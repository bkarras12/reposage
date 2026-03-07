"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { GitBranch, BookOpen } from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
            <BookOpen className="h-6 w-6 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to RepoSage</CardTitle>
          <CardDescription>
            Sign in with your GitHub account to analyze your repositories and
            generate onboarding documentation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            size="lg"
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          >
            <GitBranch className="h-5 w-5" />
            Sign in with GitHub
          </Button>
          <p className="mt-4 text-center text-xs text-zinc-500">
            We&apos;ll request read access to your repositories to analyze the
            codebase. Your code is never stored permanently.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
