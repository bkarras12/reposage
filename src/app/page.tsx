import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, GitBranch, Zap, MessageSquare } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <Zap className="h-4 w-4" />
            AI-Powered Codebase Intelligence
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 sm:text-6xl dark:text-white">
            Understand any codebase{" "}
            <span className="text-emerald-600">in minutes</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            RepoSage analyzes your GitHub repositories and generates
            comprehensive onboarding guides, architecture documentation, and
            interactive Q&A — so your team can ramp up instantly.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg">
                <GitBranch className="h-5 w-5" />
                Connect GitHub
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg">
                Learn more
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-zinc-200 bg-zinc-50 py-24 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Everything you need to onboard faster
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              Stop wasting days reading unfamiliar code. Let AI do the heavy
              lifting.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<BookOpen className="h-6 w-6 text-emerald-600" />}
              title="Auto-Generated Guides"
              description="Get a structured onboarding document covering architecture, modules, setup instructions, and coding conventions — all generated from your code."
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6 text-emerald-600" />}
              title="Interactive Q&A"
              description="Ask natural language questions about any part of the codebase and get accurate, code-grounded answers instantly."
            />
            <FeatureCard
              icon={<GitBranch className="h-6 w-6 text-emerald-600" />}
              title="GitHub Integration"
              description="Connect your repositories with one click. RepoSage works with both public and private repos through GitHub OAuth."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              How it works
            </h2>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <Step
              number="1"
              title="Connect your repo"
              description="Sign in with GitHub and select the repository you want to analyze."
            />
            <Step
              number="2"
              title="AI analyzes the code"
              description="RepoSage crawls the file tree, reads the source code, and uses Claude to understand the architecture."
            />
            <Step
              number="3"
              title="Get your guide"
              description="Receive a comprehensive onboarding guide with architecture docs, module breakdowns, and setup instructions."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-12 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-zinc-500 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold text-zinc-900 dark:text-white">
              RepoSage
            </span>
          </div>
          <p className="mt-2">
            AI-Powered Codebase Onboarding & Documentation Platform
          </p>
          <p className="mt-1">Built with Claude by Anthropic</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
        {number}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}
