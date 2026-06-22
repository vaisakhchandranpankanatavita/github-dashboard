import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RepoListPage } from './RepoListPage.tsx'
import { GithubError } from '../lib/github/index.ts'
import { useRepos } from '../hooks/useRepos.ts'

vi.mock('../hooks/useRepos.ts', () => ({
  useRepos: vi.fn(),
}))

describe('RepoListPage', () => {
  beforeEach(() => {
    vi.mocked(useRepos).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new GithubError(404, 'Not Found'),
    } as unknown as ReturnType<typeof useRepos>)
  })

  it('renders the not-found message when the user does not exist', () => {
    render(
      <MemoryRouter initialEntries={['/octocat']}>
        <Routes>
          <Route
            path="/:username"
            element={
              <QueryClientProvider client={new QueryClient()}>
                <RepoListPage />
              </QueryClientProvider>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('User "octocat" not found.')).toBeInTheDocument()
  })
})
