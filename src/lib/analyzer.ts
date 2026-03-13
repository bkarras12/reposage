import OpenAI from "openai";
import { RepoFile, OnboardingGuide } from "@/types";

const openai = new OpenAI();

function buildFileContext(files: RepoFile[]): string {
  let context = "";
  for (const file of files) {
    // Truncate very long files to first 200 lines
    const lines = file.content.split("\n");
    const truncated = lines.length > 50
      ? lines.slice(0, 50).join("\n") + "\n... (truncated)"
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

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 4000,
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
  "setupInstructions": "Comprehensive step-by-step setup guide. Include: 1) Prerequisites (language runtimes, package managers, CLI tools, database servers needed and their versions), 2) How to clone and install dependencies, 3) Environment variables needed (list every env var found in .env.example or referenced in code, with a description of what each one is for and how to obtain it), 4) Database setup or migrations if applicable, 5) How to run the dev server, 6) How to run tests, linting, and builds, 7) Common gotchas or troubleshooting tips. Use newlines to separate sections clearly.",
  "conventions": "Coding conventions and patterns observed in the codebase - naming conventions, file organization, error handling patterns, testing patterns, etc.",
  "dataFlow": "A detailed multi-paragraph description of how data flows through the system. Trace at least 2-3 key user journeys or request flows end-to-end (e.g. user signs up, user creates a resource, data gets processed). For each flow, describe: the entry point (UI action or API call), each service/function/component the data passes through, any transformations or validations applied, where data is persisted, and what the user sees as output. Use numbered steps for clarity. Separate each flow with a blank line.",
  "keyDecisions": "Key architectural and technical decisions that can be inferred from the codebase - framework choices, database choices, authentication approach, deployment strategy, etc."
}

Important: Return ONLY valid JSON. No markdown, no code fences, no explanation text outside the JSON.`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content || "";

  // Extract JSON from response (handle potential markdown wrapping)
  let jsonStr = text.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const guide: OnboardingGuide = JSON.parse(jsonStr);
  return guide;
}
