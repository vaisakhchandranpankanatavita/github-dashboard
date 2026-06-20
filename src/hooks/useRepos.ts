import { useQuery } from '@tanstack/react-query'
import { fetchUserRepos, GithubError } from '../lib/github/index.ts'
import type { GithubRepo } from '../lib/github/index.ts'

export function useRepos(username: string) {
  return useQuery<GithubRepo[], Error>({
    queryKey: ['repos', username] as const,
    queryFn: () => fetchUserRepos(username),
    enabled: username !== '',
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (error instanceof GithubError && error.status === 404) return false
      return failureCount < 3
    },
  })
}
