import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRepoFiles } from "@/lib/github";
import { analyzeRepository } from "@/lib/analyzer";
import { setAnalysis, getAnalysis, generateAnalysisId } from "@/lib/store";
import { RepoAnalysis } from "@/types";

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

  const analysisId = generateAnalysisId(session.user.id, repoFullName);

  // Check if already analyzing
  const existing = getAnalysis(analysisId);
  if (existing?.status === "analyzing") {
    return NextResponse.json(existing);
  }

  // Create analysis record
  const analysis: RepoAnalysis = {
    id: analysisId,
    repoFullName,
    repoUrl: `https://github.com/${repoFullName}`,
    status: "analyzing",
    createdAt: new Date().toISOString(),
  };
  setAnalysis(analysis);

  // Run analysis (in MVP this blocks; in production use a job queue)
  try {
    const files = await getRepoFiles(session.accessToken, owner, repo, 50);

    if (files.length === 0) {
      analysis.status = "failed";
      analysis.error = "No analyzable files found in the repository.";
      setAnalysis(analysis);
      return NextResponse.json(analysis);
    }

    const guide = await analyzeRepository(repoFullName, files);

    analysis.status = "completed";
    analysis.completedAt = new Date().toISOString();
    analysis.guide = guide;
    setAnalysis(analysis);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis failed:", error);
    analysis.status = "failed";
    analysis.error =
      error instanceof Error ? error.message : "Analysis failed";
    setAnalysis(analysis);
    return NextResponse.json(analysis, { status: 500 });
  }
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

  const analysisId = generateAnalysisId(session.user.id, repoFullName);
  const analysis = getAnalysis(analysisId);

  if (!analysis) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(analysis);
}
