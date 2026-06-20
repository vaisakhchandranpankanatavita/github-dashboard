import type { GithubRepo, GithubLanguages, GithubCommit } from './types.ts'

export class GithubError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'GithubError'
    this.status = status
  }
}

async function get<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  const token = import.meta.env.VITE_GITHUB_TOKEN
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`https://api.github.com${path}`, { headers })
  if (!res.ok) {
    throw new GithubError(res.status, `GitHub API error: ${res.status} ${res.statusText}`)
  }
  // Unchecked cast: we trust the GitHub REST API shape matches our interfaces; no runtime validation by design.
  const data: unknown = await res.json()
  return data as T
}

// per_page=100 is the first page only; pagination deferred to the list slice
export function fetchUserRepos(username: string): Promise<GithubRepo[]> {
  return get<GithubRepo[]>(`/users/${encodeURIComponent(username)}/repos?per_page=100`)
}

export function fetchRepoLanguages(owner: string, repo: string): Promise<GithubLanguages> {
  return get<GithubLanguages>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`)
}

export function fetchRepoCommits(owner: string, repo: string, branch: string): Promise<GithubCommit[]> {
  return get<GithubCommit[]>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?sha=${encodeURIComponent(branch)}&per_page=10`)
}
