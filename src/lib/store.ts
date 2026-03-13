import { put, list, del } from "@vercel/blob";
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
    const { blobs } = await list({ prefix: path, limit: 1 });
    if (blobs.length === 0) return undefined;
    const res = await fetch(blobs[0].downloadUrl);
    if (!res.ok) return undefined;
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
      const res = await fetch(blob.downloadUrl);
      if (!res.ok) continue;
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
  // Delete existing blob first (since addRandomSuffix: false may not overwrite)
  try {
    const { blobs } = await list({ prefix: path, limit: 1 });
    if (blobs.length > 0) {
      await del(blobs[0].url);
    }
  } catch {
    // ignore cleanup errors
  }
  await put(path, JSON.stringify(analysis), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
  });
}
