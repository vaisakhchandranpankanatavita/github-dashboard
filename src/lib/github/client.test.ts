import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchUserRepos, GithubError } from './client.ts'

describe('GitHub API client', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('sends Authorization header when VITE_GITHUB_TOKEN is set', async () => {
    vi.stubEnv('VITE_GITHUB_TOKEN', 'test-token')
    let capturedInit: RequestInit | undefined
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url: string, init: RequestInit) => {
        capturedInit = init
        return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }))
      }),
    )

    await fetchUserRepos('octocat')

    const headers = capturedInit?.headers as Record<string, string> | undefined
    expect(headers?.['Authorization']).toBe('Bearer test-token')
  })

  it('omits Authorization header when VITE_GITHUB_TOKEN is not set', async () => {
    vi.stubEnv('VITE_GITHUB_TOKEN', '')
    let capturedInit: RequestInit | undefined
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url: string, init: RequestInit) => {
        capturedInit = init
        return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }))
      }),
    )

    await fetchUserRepos('octocat')

    const headers = capturedInit?.headers as Record<string, string> | undefined
    expect(headers?.['Authorization']).toBeUndefined()
  })

  it('throws GithubError with the response status on a non-ok response', async () => {
    vi.stubEnv('VITE_GITHUB_TOKEN', '')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('', { status: 422, statusText: 'Unprocessable Entity' }),
      ),
    )

    const error = await fetchUserRepos('octocat').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(GithubError)
    expect((error as GithubError).status).toBe(422)
  })
})
