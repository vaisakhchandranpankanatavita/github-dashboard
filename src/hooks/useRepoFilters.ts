import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { GithubRepo } from '../lib/github/index.ts'

export function useRepoFilters(repos: GithubRepo[]) {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const lang = searchParams.get('lang') ?? ''
  const sort = searchParams.get('sort') ?? ''

  const setParam = useCallback(
    (key: 'q' | 'lang' | 'sort', value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value) next.set(key, value)
          else next.delete(key)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const languages = useMemo(() => {
    const seen = new Set<string>()
    for (const repo of repos) {
      if (repo.language !== null) seen.add(repo.language)
    }
    return [...seen].sort()
  }, [repos])

  const filtered = useMemo(() => {
    let result = repos
    if (q) {
      const lower = q.toLowerCase()
      result = result.filter((r) => r.name.toLowerCase().includes(lower))
    }
    if (lang) {
      result = result.filter((r) => r.language === lang)
    }
    if (sort === 'stars') {
      result = [...result].sort((a, b) => b.stargazers_count - a.stargazers_count)
    } else if (sort === 'updated') {
      result = [...result].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )
    }
    return result
  }, [repos, q, lang, sort])

  return { q, lang, sort, setParam, languages, filtered }
}
