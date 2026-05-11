const axios = require("axios");

async function analyzeCode(diff, options = {}) {
  const {
    model = process.env.OPENAI_MODEL || "gpt-4o-mini",
    strictMode = false,
    ignoreStylingAndLinterIssues = true,
    repository = "unknown",
    pullRequestNumber = "unknown",
  } = options;

  const reviewRules = [
    "Focus on real bugs, security flaws, breaking changes, and performance issues.",
    "For every issue include: severity (high|medium|low), file path, explanation, and corrected code snippet.",
    "Prioritize practical fixes that can be applied immediately.",
  ];

  if (strictMode) {
    reviewRules.push("Strict mode is enabled: include only medium/high impact findings.");
  }

  if (ignoreStylingAndLinterIssues) {
    reviewRules.push("Ignore purely styling, formatting, and linter-only feedback.");
  }

  const prompt = `
You are an expert pull request reviewer.

Repository: ${repository}
Pull Request: #${pullRequestNumber}

Rules:
${reviewRules.map((rule, index) => `${index + 1}. ${rule}`).join("\n")}

Output format:
1. A short summary line.
2. A findings section using markdown bullets.
3. A final "Recommended patch examples" section.

${diff}
`;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model,
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  return response.data.choices[0].message.content;
}

module.exports = { analyzeCode };