import { useQuery } from '@tanstack/react-query'
import { fetchRepoCommits, GithubError } from '../lib/github/index.ts'
import type { GithubCommit } from '../lib/github/index.ts'

export function useCommits(owner: string, repo: string, branch: string) {
  return useQuery<GithubCommit[], Error>({
    queryKey: ['commits', owner, repo, branch] as const,
    queryFn: async () => {
      try {
        return await fetchRepoCommits(owner, repo, branch)
      } catch (err) {
        if (err instanceof GithubError && err.status === 409) return []
        throw err
      }
    },
    enabled: owner !== '' && repo !== '' && branch !== '',
    staleTime: 60_000,
  })
}
