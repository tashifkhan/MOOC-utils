const { execSync } = require("child_process");

async function generateNotes() {
  const apiKey = process.env.GEMINI_API_KEY;
  const tag = process.env.GITHUB_REF_NAME;

  // Get the previous tag
  let previousTag;
  try {
    // Find the most recent tag before the current one
    const tags = execSync("git tag --sort=-v:refname")
      .toString()
      .split("\n")
      .filter((t) => t && t !== tag);
    previousTag = tags[0];

    if (!previousTag) {
      previousTag = execSync("git rev-list --max-parents=0 HEAD")
        .toString()
        .trim();
    }
  } catch (e) {
    previousTag = execSync("git rev-list --max-parents=0 HEAD")
      .toString()
      .trim();
  }

  // Get the diff
  const diff = execSync(
    `git log ${previousTag}..${tag} --oneline --pretty=format:"- %s"`,
  ).toString();

  if (!diff) {
    console.log("No changes detected.");
    process.exit(0);
  }

  const prompt = `You are a helpful release manager. Generate a professional and concise release note for the tag "${tag}" based on the following git commits.
Group them into categories like "Features", "Fixes", and "Chore".

Commits:
${diff}

Response format: Markdown.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const notes = data.candidates[0].content.parts[0].text;
      console.log(notes);
    } else {
      console.error("Unexpected Gemini response:", JSON.stringify(data));
      throw new Error("Invalid response structure");
    }
  } catch (error) {
    console.error("Failed to generate notes with Gemini:", error);
    // Fallback to raw diff
    console.log("## Changes\n\n" + diff);
  }
}

generateNotes();
