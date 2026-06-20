import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useCommits } from './useCommits.ts'
import { GithubError } from '../lib/github/index.ts'

vi.mock('../lib/github/index.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/github/index.ts')>()
  return { ...actual, fetchRepoCommits: vi.fn() }
})

describe('useCommits', () => {
  it('returns an empty array on a 409 instead of throwing', async () => {
    const { fetchRepoCommits } = await import('../lib/github/index.ts')
    vi.mocked(fetchRepoCommits).mockRejectedValue(new GithubError(409, 'Conflict'))

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useCommits('owner', 'repo', 'main'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})
