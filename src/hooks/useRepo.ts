import { useQuery } from '@tanstack/react-query'
import { fetchRepo, GithubError } from '../lib/github/index.ts'
import type { GithubRepo } from '../lib/github/index.ts'

export function useRepo(owner: string, repo: string) {
  return useQuery<GithubRepo, Error>({
    queryKey: ['repo', owner, repo] as const,
    queryFn: () => fetchRepo(owner, repo),
    enabled: owner !== '' && repo !== '',
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (error instanceof GithubError && error.status === 404) return false
      return failureCount < 3
    },
  })
}
