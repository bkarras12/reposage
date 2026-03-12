import { Octokit } from "octokit";
import { GitHubRepo, RepoFile } from "@/types";

export function createOctokit(accessToken: string) {
  return new Octokit({ auth: accessToken });
}

export async function getUserRepos(accessToken: string): Promise<GitHubRepo[]> {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 30,
    type: "all",
  });
  return data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    html_url: repo.html_url,
    language: repo.language,
    default_branch: repo.default_branch,
    private: repo.private,
    stargazers_count: repo.stargazers_count,
    updated_at: repo.updated_at ?? "",
  }));
}

export async function getRepoFiles(
  accessToken: string,
  owner: string,
  repo: string,
  maxFiles: number = 30
): Promise<RepoFile[]> {
  const octokit = createOctokit(accessToken);
  const files: RepoFile[] = [];

  // Get the repo tree recursively
  const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
  const { data: tree } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: repoData.default_branch,
    recursive: "true",
  });

  // Filter to code files, skip binary/large files
  const codeExtensions = new Set([
    ".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".java", ".rb",
    ".php", ".c", ".cpp", ".h", ".hpp", ".cs", ".swift", ".kt",
    ".md", ".json", ".yaml", ".yml", ".toml", ".xml",
    ".html", ".css", ".scss", ".sql", ".sh", ".bash",
    ".dockerfile", ".prisma", ".graphql", ".proto",
  ]);

  const importantFiles = new Set([
    "package.json", "requirements.txt", "pyproject.toml", "cargo.toml",
    "go.mod", "pom.xml", "build.gradle", "gemfile",
    "dockerfile", "docker-compose.yml", "docker-compose.yaml",
    "readme.md", "readme", "makefile", ".env.example",
  ]);

  const eligibleBlobs = (tree.tree || [])
    .filter((item) => {
      if (item.type !== "blob" || !item.path || !item.size) return false;
      if (item.size > 50000) return false; // Skip files > 50KB
      if (item.path.includes("node_modules/")) return false;
      if (item.path.includes("vendor/")) return false;
      if (item.path.includes(".min.")) return false;
      if (item.path.includes("dist/")) return false;
      if (item.path.includes("build/")) return false;
      if (item.path.includes("__pycache__/")) return false;
      if (item.path.includes(".lock")) return false;

      const fileName = item.path.split("/").pop()?.toLowerCase() || "";
      if (importantFiles.has(fileName)) return true;

      const ext = "." + fileName.split(".").pop()?.toLowerCase();
      return codeExtensions.has(ext);
    })
    .sort((a, b) => {
      // Prioritize root-level and important files
      const aDepth = (a.path?.match(/\//g) || []).length;
      const bDepth = (b.path?.match(/\//g) || []).length;
      return aDepth - bDepth;
    })
    .slice(0, maxFiles);

  // Fetch file contents in parallel (batched)
  const batchSize = 10;
  for (let i = 0; i < eligibleBlobs.length; i += batchSize) {
    const batch = eligibleBlobs.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (item) => {
        try {
          const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: item.path!,
          });
          if ("content" in data && data.encoding === "base64") {
            return {
              path: item.path!,
              content: Buffer.from(data.content, "base64").toString("utf-8"),
              size: item.size!,
              type: "file" as RepoFile["type"],
            };
          }
        } catch {
          // Skip files that can't be fetched
        }
        return null;
      })
    );
    const validFiles = results.filter(
      (f): f is RepoFile => f !== null
    );
    files.push(...validFiles);
  }

  return files;
}
