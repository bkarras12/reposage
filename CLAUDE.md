# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RepoSage is an AI-powered codebase onboarding platform. Users authenticate via GitHub OAuth, select a repository, and the app fetches source files via the GitHub API then sends them to OpenAI (gpt-4o) for analysis, producing a structured onboarding guide (summary, architecture, modules, setup instructions, conventions, data flow, key decisions).

## Commands

- `npm run dev` — start Next.js dev server on localhost:3000
- `npm run build` — production build
- `npm run lint` — ESLint
- No test framework is configured yet.

## Environment Setup

Copy `.env.example` to `.env` and fill in:
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — GitHub OAuth App credentials
- `AUTH_SECRET` — generate with `openssl rand -base64 32`
- `OPENAI_API_KEY` — required for repository analysis
- `BLOB_READ_WRITE_TOKEN` — auto-set when Vercel Blob storage is added in dashboard

## Architecture

Next.js 16 App Router with Tailwind CSS v4 and NextAuth v5 (beta).

**Auth flow:** `src/lib/auth.ts` configures NextAuth with GitHub provider. The GitHub access token is stored in the JWT and exposed on the session object. Custom sign-in page at `/login`.

**API routes (all require auth):**
- `POST /api/analyze` — triggers analysis: returns immediately with "analyzing" status, then uses `after()` to fetch repo files and run OpenAI analysis in the background (`maxDuration=60`)
- `GET /api/analyze?repo=owner/name` — retrieves stored analysis
- `GET /api/repos` — lists the authenticated user's GitHub repositories

**Core libraries (`src/lib/`):**
- `github.ts` — Octokit wrapper. `getRepoFiles` fetches the git tree recursively, filters to code files (by extension whitelist), caps at 50 files, fetches contents in batches of 10.
- `analyzer.ts` — builds a file-context prompt and calls OpenAI (`gpt-4o`) to produce an `OnboardingGuide` JSON.
- `store.ts` — persists `RepoAnalysis` as JSON blobs via `@vercel/blob`, keyed by `analyses/{userId}/{owner/repo}.json`.

**Pages:** `/` (landing), `/login`, `/dashboard` (repo list), `/repo/[id]` (analysis view).

**Types:** All shared interfaces in `src/types/index.ts` — `RepoFile`, `RepoAnalysis`, `OnboardingGuide`, `ModuleDoc`, `GitHubRepo`.

## Key Conventions

- Path alias: `@/*` maps to `./src/*`
- UI components use `class-variance-authority` + `tailwind-merge` + `clsx` (see `src/lib/utils.ts` for `cn()` helper)
- OpenAI SDK is initialized without explicit key (`new OpenAI()`) — reads `OPENAI_API_KEY` from env automatically
