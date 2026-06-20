import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useRepoFilters } from './useRepoFilters.ts'
import type { GithubRepo } from '../lib/github/index.ts'

function makeRepo(
  overrides: Pick<GithubRepo, 'id' | 'name' | 'language' | 'stargazers_count' | 'updated_at'>,
): GithubRepo {
  return {
    full_name: `octocat/${overrides.name}`,
    description: null,
    html_url: `https://github.com/octocat/${overrides.name}`,
    forks_count: 0,
    open_issues_count: 0,
    pushed_at: overrides.updated_at,
    default_branch: 'main',
    fork: false,
    archived: false,
    topics: [],
    visibility: 'public',
    ...overrides,
  }
}

const repos: GithubRepo[] = [
  makeRepo({ id: 1, name: 'react-app',    language: 'TypeScript', stargazers_count: 50,  updated_at: '2024-01-01T00:00:00Z' }),
  makeRepo({ id: 2, name: 'python-tool',  language: 'Python',     stargazers_count: 200, updated_at: '2023-06-01T00:00:00Z' }),
  makeRepo({ id: 3, name: 'react-native', language: 'TypeScript', stargazers_count: 10,  updated_at: '2024-03-01T00:00:00Z' }),
]

function makeWrapper(search = '') {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[`/${search}`]}>
        <Routes>
          <Route path="/" element={<>{children}</>} />
        </Routes>
      </MemoryRouter>
    )
  }
}

describe('useRepoFilters', () => {
  it('name filter narrows results to repos whose names contain the query', () => {
    const { result } = renderHook(() => useRepoFilters(repos), {
      wrapper: makeWrapper('?q=react'),
    })
    expect(result.current.filtered.map((r) => r.name)).toEqual(['react-app', 'react-native'])
  })

  it('language filter narrows results to repos matching the selected language', () => {
    const { result } = renderHook(() => useRepoFilters(repos), {
      wrapper: makeWrapper('?lang=Python'),
    })
    expect(result.current.filtered.map((r) => r.name)).toEqual(['python-tool'])
  })

  it('sort by stars returns repos in descending star order', () => {
    const { result } = renderHook(() => useRepoFilters(repos), {
      wrapper: makeWrapper('?sort=stars'),
    })
    expect(result.current.filtered.map((r) => r.stargazers_count)).toEqual([200, 50, 10])
  })

  it('sort by updated returns repos in descending date order', () => {
    const { result } = renderHook(() => useRepoFilters(repos), {
      wrapper: makeWrapper('?sort=updated'),
    })
    expect(result.current.filtered.map((r) => r.name)).toEqual(['react-native', 'react-app', 'python-tool'])
  })
})
