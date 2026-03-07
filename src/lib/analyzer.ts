import Anthropic from "@anthropic-ai/sdk";
import { RepoFile, OnboardingGuide } from "@/types";

const anthropic = new Anthropic();

function buildFileContext(files: RepoFile[]): string {
  let context = "";
  for (const file of files) {
    // Truncate very long files to first 200 lines
    const lines = file.content.split("\n");
    const truncated = lines.length > 200
      ? lines.slice(0, 200).join("\n") + "\n... (truncated)"
      : file.content;
    context += `\n--- ${file.path} ---\n${truncated}\n`;
  }
  return context;
}

export async function analyzeRepository(
  repoFullName: string,
  files: RepoFile[]
): Promise<OnboardingGuide> {
  const fileContext = buildFileContext(files);
  const fileList = files.map((f) => f.path).join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: `You are an expert software architect analyzing a GitHub repository called "${repoFullName}".
Based on the codebase files provided below, generate a comprehensive onboarding guide.

FILE LIST:
${fileList}

FILE CONTENTS:
${fileContext}

Generate a JSON response with this exact structure (no markdown fences, just raw JSON):
{
  "summary": "A 2-3 paragraph executive summary of the project - what it is, what problem it solves, and the key technologies used.",
  "architecture": "A detailed description of the system architecture, including how components interact, the overall design patterns used, and the high-level data flow. Use text-based diagrams where helpful.",
  "modules": [
    {
      "name": "Module Name",
      "path": "path/to/module",
      "description": "What this module does",
      "responsibilities": ["Responsibility 1", "Responsibility 2"]
    }
  ],
  "setupInstructions": "Step-by-step instructions for setting up the development environment, installing dependencies, and running the project locally. Derive these from config files and scripts found in the codebase.",
  "conventions": "Coding conventions and patterns observed in the codebase - naming conventions, file organization, error handling patterns, testing patterns, etc.",
  "dataFlow": "A text-based description of how data flows through the system, from input to output. Include key entry points and data transformations.",
  "keyDecisions": "Key architectural and technical decisions that can be inferred from the codebase - framework choices, database choices, authentication approach, deployment strategy, etc."
}

Important: Return ONLY valid JSON. No markdown, no code fences, no explanation text outside the JSON.`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Extract JSON from response (handle potential markdown wrapping)
  let jsonStr = text.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const guide: OnboardingGuide = JSON.parse(jsonStr);
  return guide;
}
