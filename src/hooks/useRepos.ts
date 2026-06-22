import { useQuery } from '@tanstack/react-query'
import { fetchUserRepos } from '../lib/github/index.ts'
import type { GithubRepo } from '../lib/github/index.ts'

export function useRepos(username: string) {
  return useQuery<GithubRepo[], Error>({
    queryKey: ['repos', username] as const,
    queryFn: ({ signal }) => fetchUserRepos(username, signal),
    enabled: username !== '',
    staleTime: 60_000,
    // Pagination fetches all pages sequentially before resolving. Retrying restarts
    // from page 1, re-issuing every already-fetched request and worsening rate-limit
    // pressure on failure. A failed search is recoverable by re-submitting; no retry.
    retry: false,
  })
}
