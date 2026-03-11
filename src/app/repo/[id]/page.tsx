"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  BookOpen,
  Layers,
  Terminal,
  Code2,
  GitBranch,
  Lightbulb,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { RepoAnalysis } from "@/types";

export default function RepoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const repoFullName = decodeURIComponent(params.id as string);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchAnalysis();
    }
  }, [session]);

  useEffect(() => {
    if (analysis?.status === "analyzing") {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/analyze?repo=${encodeURIComponent(repoFullName)}`
          );
          if (res.ok) {
            const data = await res.json();
            setAnalysis(data);
            if (data.status !== "analyzing") {
              clearInterval(interval);
            }
          }
        } catch {
          // keep polling
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [analysis?.status, repoFullName]);

  async function fetchAnalysis() {
    try {
      const res = await fetch(
        `/api/analyze?repo=${encodeURIComponent(repoFullName)}`
      );
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      }
    } catch {
      // Analysis not found
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (analysis?.status === "analyzing") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-emerald-500" />
        <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">
          Analyzing {repoFullName}...
        </h2>
        <p className="mt-2 text-zinc-500">
          Claude is reading and understanding your codebase. This may take a minute.
        </p>
      </div>
    );
  }

  if (!analysis || !analysis.guide) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-zinc-300" />
        <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">
          {analysis?.status === "failed" ? "Analysis failed" : "No analysis found"}
        </h2>
        <p className="mt-2 text-zinc-500">
          {analysis?.error || "This repository hasn\u0027t been analyzed yet."}
        </p>
        <Button className="mt-6" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const guide = analysis.guide;

  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "architecture", label: "Architecture", icon: Layers },
    { id: "modules", label: "Modules", icon: Code2 },
    { id: "setup", label: "Setup", icon: Terminal },
    { id: "conventions", label: "Conventions", icon: Code2 },
    { id: "decisions", label: "Key Decisions", icon: Lightbulb },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="mb-3 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              {repoFullName}
            </h1>
            <Badge variant="success">Analyzed</Badge>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Generated {new Date(analysis.completedAt!).toLocaleDateString()}
          </p>
        </div>
        <a
          href={analysis.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4" />
            View on GitHub
          </Button>
        </a>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                Project Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-zinc max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap">{guide.summary}</p>
              </div>
              {guide.dataFlow && (
                <div className="mt-8">
                  <h3 className="mb-3 text-lg font-semibold flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-emerald-600" />
                    Data Flow
                  </h3>
                  <pre className="overflow-x-auto rounded-lg bg-zinc-50 p-4 text-sm dark:bg-zinc-900">
                    {guide.dataFlow}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "architecture" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-600" />
                Architecture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-zinc max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-base">
                  {guide.architecture}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "modules" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {guide.modules.map((mod, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-base">{mod.name}</CardTitle>
                  <code className="text-xs text-zinc-500">{mod.path}</code>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {mod.description}
                  </p>
                  {mod.responsibilities.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {mod.responsibilities.map((r, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "setup" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-emerald-600" />
                Setup Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap rounded-lg bg-zinc-50 p-6 text-sm dark:bg-zinc-900">
                {guide.setupInstructions}
              </pre>
            </CardContent>
          </Card>
        )}

        {activeTab === "conventions" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-emerald-600" />
                Coding Conventions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-zinc max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-base">
                  {guide.conventions}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "decisions" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-emerald-600" />
                Key Decisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-zinc max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-base">
                  {guide.keyDecisions}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
