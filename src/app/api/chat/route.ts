import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { ChatMessage, OnboardingGuide } from "@/types";

const openai = new OpenAI();

export const maxDuration = 60;

function buildSystemPrompt(repoFullName: string, guide: OnboardingGuide): string {
  const moduleSummary = guide.modules
    .map((m) => `- ${m.name} (${m.path}): ${m.description}`)
    .join("\n");

  return `You are a helpful codebase assistant for the GitHub repository "${repoFullName}".
You have deep knowledge of this project based on an analysis of its source code.
Answer questions about the codebase clearly and concisely. Reference specific files, modules, and patterns when relevant.

Here is what you know about this project:

## Summary
${guide.summary}

## Architecture
${guide.architecture}

## Modules
${moduleSummary}

## Setup Instructions
${guide.setupInstructions}

## Conventions
${guide.conventions}

## Data Flow
${guide.dataFlow}

## Key Decisions
${guide.keyDecisions}

When answering:
- Be specific and reference actual file paths and module names from the analysis
- If you don't know something based on the available information, say so
- Keep answers focused and practical`;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { repoFullName: string; guide: OnboardingGuide; messages: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { repoFullName, guide, messages } = body;
  if (!repoFullName || !guide || !messages || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: "repoFullName, guide, and messages are required" },
      { status: 400 }
    );
  }

  try {
    const systemPrompt = buildSystemPrompt(repoFullName, guide);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1500,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });

    const reply = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat request failed" },
      { status: 500 }
    );
  }
}
