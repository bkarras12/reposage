import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { getRepoFiles } from "@/lib/github";
import { analyzeRepository } from "@/lib/analyzer";
import { setAnalysis, getAnalysis, generateAnalysisId } from "@/lib/store";
import { RepoAnalysis } from "@/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repoFullName } = await request.json();
  if (!repoFullName || typeof repoFullName !== "string") {
    return NextResponse.json(
      { error: "repoFullName is required" },
      { status: 400 }
    );
  }

  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Invalid repository format. Use owner/repo." },
      { status: 400 }
    );
  }

  const userId = session.user.id;

  // Check if already analyzing or completed
  const existing = await getAnalysis(userId, repoFullName);
  if (existing?.status === "analyzing") {
    return NextResponse.json(existing);
  }

  // Create analysis record with "analyzing" status
  const analysis: RepoAnalysis = {
    id: generateAnalysisId(userId, repoFullName),
    repoFullName,
    repoUrl: `https://github.com/${repoFullName}`,
    status: "analyzing",
    createdAt: new Date().toISOString(),
  };
  try {
    await setAnalysis(userId, repoFullName, analysis);
  } catch (error) {
    console.error("Failed to save analysis:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save analysis" },
      { status: 500 }
    );
  }

  // Capture token for use in after() callback
  const accessToken = session.accessToken;

  // Run analysis in the background after the response is sent
  after(async () => {
    try {
      const files = await getRepoFiles(accessToken, owner, repo, 50);

      if (files.length === 0) {
        analysis.status = "failed";
        analysis.error = "No analyzable files found in the repository.";
        await setAnalysis(userId, repoFullName, analysis);
        return;
      }

      const guide = await analyzeRepository(repoFullName, files);

      analysis.status = "completed";
      analysis.completedAt = new Date().toISOString();
      analysis.guide = guide;
      await setAnalysis(userId, repoFullName, analysis);
    } catch (error) {
      console.error("Analysis failed:", error);
      analysis.status = "failed";
      analysis.error =
        error instanceof Error ? error.message : "Analysis failed";
      await setAnalysis(userId, repoFullName, analysis);
    }
  });

  return NextResponse.json(analysis);
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repoFullName = request.nextUrl.searchParams.get("repo");
  if (!repoFullName) {
    return NextResponse.json(
      { error: "repo parameter is required" },
      { status: 400 }
    );
  }

  const analysis = await getAnalysis(session.user.id, repoFullName);

  if (!analysis) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(analysis);
}
