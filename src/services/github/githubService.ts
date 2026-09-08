import { RepositoryRef } from '../../core/types/graph';

export interface GitHubFileItem {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
  url?: string;
  sha?: string;
}

export class GitHubService {
  /**
   * Parse a GitHub URL or string into an owner/repo/branch reference object.
   */
  public static parseUrl(urlInput: string): RepositoryRef {
    let clean = urlInput.trim();
    if (!clean) {
      throw new Error('Please enter a valid GitHub repository URL.');
    }

    // Strip trailing slashes and .git
    clean = clean.replace(/\/+$/, '').replace(/\.git$/, '');

    // Match https://github.com/owner/repo or github.com/owner/repo or owner/repo
    const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/;
    const match = clean.match(githubRegex);

    if (match) {
      return {
        owner: match[1],
        repo: match[2],
        branch: match[3] || 'main', // Default branch attempt main
        url: `https://github.com/${match[1]}/${match[2]}`,
      };
    }

    // Simple "owner/repo" shorthand format check
    const shorthandRegex = /^([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)$/;
    const shortMatch = clean.match(shorthandRegex);
    if (shortMatch) {
      return {
        owner: shortMatch[1],
        repo: shortMatch[2],
        branch: 'main',
        url: `https://github.com/${shortMatch[1]}/${shortMatch[2]}`,
      };
    }

    throw new Error('Invalid GitHub repository URL format. Example: https://github.com/facebook/react');
  }

  /**
   * Fetch repository details and file tree from GitHub REST API.
   */
  public static async fetchRepositoryTree(repoRef: RepositoryRef): Promise<{ files: GitHubFileItem[]; defaultBranch: string }> {
    const { owner, repo } = repoRef;

    // Step 1: Get repository info to identify default branch
    let defaultBranch = repoRef.branch || 'main';
    try {
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (repoRes.status === 404) {
        throw new Error(`Repository "${owner}/${repo}" was not found or is private.`);
      }
      if (repoRes.status === 403) {
        throw new Error(`GitHub API rate limit exceeded or access forbidden. Please try again later.`);
      }
      if (!repoRes.ok) {
        throw new Error(`Unable to fetch repository info (HTTP ${repoRes.status}).`);
      }
      const repoData = await repoRes.json();
      if (repoData.default_branch) {
        defaultBranch = repoData.default_branch;
      }
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error('Failed to connect to GitHub API.');
    }

    // Step 2: Fetch recursive git tree
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
    const treeRes = await fetch(treeUrl);

    if (!treeRes.ok) {
      // Fallback: try main vs master if tree fetch failed
      const altBranch = defaultBranch === 'main' ? 'master' : 'main';
      const altUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${altBranch}?recursive=1`;
      const altRes = await fetch(altUrl);

      if (!altRes.ok) {
        throw new Error(`Failed to fetch file tree for repository "${owner}/${repo}".`);
      }

      const altData = await altRes.json();
      return {
        files: altData.tree || [],
        defaultBranch: altBranch,
      };
    }

    const treeData = await treeRes.json();
    return {
      files: treeData.tree || [],
      defaultBranch,
    };
  }

  /**
   * Fetch raw file source content from GitHub.
   */
  public static async fetchFileContent(repoRef: RepositoryRef, filePath: string, branch: string): Promise<string> {
    const { owner, repo } = repoRef;
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;

    const res = await fetch(rawUrl);
    if (!res.ok) {
      throw new Error(`Could not fetch file content for ${filePath} (HTTP ${res.status}).`);
    }

    return await res.text();
  }
}
