import type { GithubRepo, GithubLanguages, GithubCommit } from './types.ts'

export class GithubError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'GithubError'
    this.status = status
  }
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  const token = import.meta.env.VITE_GITHUB_TOKEN
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

function parseNextLink(linkHeader: string | null): string | null {
  if (!linkHeader) return null
  const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/)
  return match?.[1] ?? null
}

async function getUrl<T>(url: string, signal?: AbortSignal): Promise<{ data: T; next: string | null }> {
  const res = await fetch(url, { headers: buildHeaders(), signal })
  if (!res.ok) {
    throw new GithubError(res.status, `GitHub API error: ${res.status} ${res.statusText}`)
  }
  // Unchecked cast: we trust the GitHub REST API shape matches our interfaces; no runtime validation by design.
  const data: unknown = await res.json().catch(() => {
    throw new GithubError(res.status, 'GitHub API returned a non-JSON response')
  })
  return { data: data as T, next: parseNextLink(res.headers.get('link')) }
}

async function get<T>(path: string): Promise<T> {
  const { data } = await getUrl<T>(`https://api.github.com${path}`)
  return data
}

export function fetchRepo(owner: string, repo: string): Promise<GithubRepo> {
  return get<GithubRepo>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`)
}

const MAX_PAGES = 50

export async function fetchUserRepos(username: string, signal?: AbortSignal): Promise<GithubRepo[]> {
  const all: GithubRepo[] = []
  let next: string | null = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100`
  let pages = 0
  while (next) {
    if (++pages > MAX_PAGES) {
      throw new GithubError(0, `Pagination safety limit (${MAX_PAGES} pages) exceeded for user "${username}"`)
    }
    const { data, next: nextUrl } = await getUrl<GithubRepo[]>(next, signal)
    all.push(...data)
    next = nextUrl
  }
  return all
}

export function fetchRepoLanguages(owner: string, repo: string): Promise<GithubLanguages> {
  return get<GithubLanguages>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`)
}

export function fetchRepoCommits(owner: string, repo: string, branch: string): Promise<GithubCommit[]> {
  return get<GithubCommit[]>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?sha=${encodeURIComponent(branch)}&per_page=10`)
}
