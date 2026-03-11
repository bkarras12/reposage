import { put, list, head } from "@vercel/blob";
import { RepoAnalysis } from "@/types";

function blobPath(userId: string, repoFullName: string): string {
  return `analyses/${userId}/${repoFullName}.json`;
}

export function generateAnalysisId(userId: string, repoFullName: string): string {
  return `${userId}:${repoFullName}`;
}

export async function getAnalysis(userId: string, repoFullName: string): Promise<RepoAnalysis | undefined> {
  const path = blobPath(userId, repoFullName);
  try {
    const blob = await head(path);
    const res = await fetch(blob.url);
    return await res.json();
  } catch {
    return undefined;
  }
}

export async function getAnalysesByUser(userId: string): Promise<RepoAnalysis[]> {
  const prefix = `analyses/${userId}/`;
  const { blobs } = await list({ prefix });
  const analyses: RepoAnalysis[] = [];
  for (const blob of blobs) {
    try {
      const res = await fetch(blob.url);
      const data: RepoAnalysis = await res.json();
      analyses.push(data);
    } catch {
      // skip corrupt blobs
    }
  }
  return analyses;
}

export async function setAnalysis(userId: string, repoFullName: string, analysis: RepoAnalysis): Promise<void> {
  const path = blobPath(userId, repoFullName);
  await put(path, JSON.stringify(analysis), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
}
