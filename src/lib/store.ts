import { RepoAnalysis } from "@/types";

// In-memory store for MVP. Replace with PostgreSQL/Supabase in production.
const analyses = new Map<string, RepoAnalysis>();

export function getAnalysis(id: string): RepoAnalysis | undefined {
  return analyses.get(id);
}

export function getAnalysesByUser(userId: string): RepoAnalysis[] {
  return Array.from(analyses.values()).filter((a) =>
    a.id.startsWith(userId + ":")
  );
}

export function setAnalysis(analysis: RepoAnalysis): void {
  analyses.set(analysis.id, analysis);
}

export function generateAnalysisId(userId: string, repoFullName: string): string {
  return `${userId}:${repoFullName}`;
}
