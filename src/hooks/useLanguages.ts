import { useQuery } from '@tanstack/react-query'
import { fetchRepoLanguages } from '../lib/github/index.ts'
import type { GithubLanguages } from '../lib/github/index.ts'

export function useLanguages(owner: string, repo: string) {
  return useQuery<GithubLanguages, Error>({
    queryKey: ['languages', owner, repo] as const,
    queryFn: () => fetchRepoLanguages(owner, repo),
    enabled: owner !== '' && repo !== '',
    staleTime: 60_000,
  })
}
