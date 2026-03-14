export interface RepoFile {
  path: string;
  content: string;
  size: number;
  type: "file" | "dir";
}

export interface RepoAnalysis {
  id: string;
  repoFullName: string;
  repoUrl: string;
  status: "pending" | "analyzing" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  guide?: OnboardingGuide;
  error?: string;
}

export interface OnboardingGuide {
  summary: string;
  architecture: string;
  modules: ModuleDoc[];
  setupInstructions: string;
  conventions: string;
  dataFlow: string;
  keyDecisions: string;
}

export interface ModuleDoc {
  name: string;
  path: string;
  description: string;
  responsibilities: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  default_branch: string;
  private: boolean;
  stargazers_count: number;
  updated_at: string;
}
