"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Star, Lock, Globe, Loader2, BookOpen } from "lucide-react";
import { GitHubRepo } from "@/types";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingRepo, setAnalyzingRepo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchRepos();
    }
  }, [session]);

  async function fetchRepos() {
    try {
      const res = await fetch("/api/repos");
      if (!res.ok) throw new Error("Failed to fetch repos");
      const data = await res.json();
      setRepos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load repos");
    } finally {
      setLoading(false);
    }
  }

  async function analyzeRepo(repoFullName: string) {
    setAnalyzingRepo(repoFullName);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoFullName }),
      });
      const data = await res.json();
      if (data.status === "completed") {
        router.push(`/repo/${encodeURIComponent(repoFullName)}`);
      } else if (data.status === "failed") {
        setError(data.error || "Analysis failed");
        setAnalyzingRepo(null);
      } else if (data.status === "analyzing") {
        pollForCompletion(repoFullName);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setAnalyzingRepo(null);
    }
  }

  async function pollForCompletion(repoFullName: string) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/analyze?repo=${encodeURIComponent(repoFullName)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "completed") {
          clearInterval(interval);
          router.push(`/repo/${encodeURIComponent(repoFullName)}`);
        } else if (data.status === "failed") {
          clearInterval(interval);
          setError(data.error || "Analysis failed");
          setAnalyzingRepo(null);
        }
      } catch {
        // keep polling
      }
    }, 3000);
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Your Repositories
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Select a repository to generate an AI-powered onboarding guide.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {analyzingRepo && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-800 dark:text-emerald-200">
                Analyzing {analyzingRepo}...
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                This may take a minute. Claude is reading and understanding your
                codebase.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {repos.map((repo) => (
          <Card key={repo.id} className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {repo.private ? (
                    <Lock className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <Globe className="h-4 w-4 text-zinc-400" />
                  )}
                  <CardTitle className="text-base">{repo.name}</CardTitle>
                </div>
                {repo.language && (
                  <Badge variant="secondary">{repo.language}</Badge>
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {repo.description || "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" />
                    {repo.stargazers_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3.5 w-3.5" />
                    {repo.default_branch}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => analyzeRepo(repo.full_name)}
                  disabled={analyzingRepo !== null}
                >
                  {analyzingRepo === repo.full_name ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BookOpen className="h-4 w-4" />
                  )}
                  Analyze
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {repos.length === 0 && !loading && (
        <div className="text-center py-12">
          <GitBranch className="mx-auto h-12 w-12 text-zinc-300" />
          <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-white">
            No repositories found
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            Make sure your GitHub account has repositories and try again.
          </p>
        </div>
      )}
    </div>
  );
}
