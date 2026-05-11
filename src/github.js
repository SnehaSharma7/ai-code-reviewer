const { Octokit } = require("@octokit/rest");
const { analyzeCode } = require("./ai");
const { addHistoryEntry } = require("./history");
const { readSettings } = require("./settings");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

function getExtension(filename) {
  const lastDotIndex = filename.lastIndexOf(".");
  return lastDotIndex === -1 ? "" : filename.slice(lastDotIndex).toLowerCase();
}

function shouldAnalyzeFile(filename, settings) {
  const extension = getExtension(filename);
  const ignoredExtensions = Array.isArray(settings.ignoredExtensions)
    ? settings.ignoredExtensions.map((item) => String(item).toLowerCase())
    : [];

  return !ignoredExtensions.includes(extension);
}

function filterDiffByFiles(diffText, allowedFiles) {
  if (!diffText || allowedFiles.length === 0) {
    return "";
  }

  const sections = diffText.split(/^diff --git /m);
  const keptSections = [];

  for (let i = 1; i < sections.length; i += 1) {
    const section = sections[i];
    const firstLine = section.split("\n", 1)[0] || "";
    const match = firstLine.match(/^a\/(.+?) b\/(.+)$/);
    const candidateFile = match ? match[2] : "";

    if (allowedFiles.includes(candidateFile)) {
      keptSections.push(`diff --git ${section}`);
    }
  }

  return keptSections.join("\n");
}

function buildCommentBody(review, meta) {
  return [
    "## GitGuard AI Review",
    "",
    `Repository: ${meta.owner}/${meta.repo}`,
    `PR: #${meta.prNumber}`,
    `Analyzed files: ${meta.analyzedFilesCount}`,
    `Strict mode: ${meta.strictMode ? "enabled" : "disabled"}`,
    "",
    review,
  ].join("\n");
}

async function handlePullRequest(payload) {
  const settings = readSettings();
  const { owner, name } = payload.repository;
  const prNumber = payload.pull_request.number;
  const action = payload.action;

  try {
    const { data: files } = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
      {
        owner,
        repo: name,
        pull_number: prNumber,
        per_page: 100,
      }
    );

    const analyzableFiles = files
      .map((item) => item.filename)
      .filter((filename) => shouldAnalyzeFile(filename, settings));

    if (analyzableFiles.length === 0) {
      const skipMessage = "Skipped review: no analyzable files after ignore rules.";
      await octokit.issues.createComment({
        owner,
        repo: name,
        issue_number: prNumber,
        body: `## GitGuard AI Review\n\n${skipMessage}`,
      });

      addHistoryEntry({
        repository: `${owner}/${name}`,
        prNumber,
        action,
        status: "skipped",
        reason: "no_analyzable_files",
        analyzedFiles: [],
      });

      return;
    }

    const { data: fullDiff } = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}",
      {
        owner,
        repo: name,
        pull_number: prNumber,
        headers: {
          accept: "application/vnd.github.v3.diff",
        },
      }
    );

    const filteredDiff = filterDiffByFiles(fullDiff, analyzableFiles).slice(0, settings.maxDiffChars);

    const review = await analyzeCode(filteredDiff, {
      model: settings.model,
      strictMode: Boolean(settings.strictMode),
      ignoreStylingAndLinterIssues: Boolean(settings.ignoreStylingAndLinterIssues),
      repository: `${owner}/${name}`,
      pullRequestNumber: prNumber,
    });

    await octokit.issues.createComment({
      owner,
      repo: name,
      issue_number: prNumber,
      body: buildCommentBody(review, {
        owner,
        repo: name,
        prNumber,
        strictMode: Boolean(settings.strictMode),
        analyzedFilesCount: analyzableFiles.length,
      }),
    });

    addHistoryEntry({
      repository: `${owner}/${name}`,
      prNumber,
      action,
      status: "success",
      analyzedFiles: analyzableFiles,
    });
  } catch (error) {
    addHistoryEntry({
      repository: `${owner}/${name}`,
      prNumber,
      action,
      status: "failed",
      reason: error.message,
    });
    throw error;
  }
}

module.exports = { handlePullRequest };