import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRepos } from '../hooks/useRepos.ts'
import { useRepoFilters } from '../hooks/useRepoFilters.ts'
import { GithubError } from '../lib/github/index.ts'
import { RepoCard } from '../components/RepoCard.tsx'

export function RepoListPage() {
  const { username } = useParams<{ username: string }>()
  const { data, isLoading, isError, error } = useRepos(username ?? '')
  const { q, lang, sort, setParam, languages, filtered } = useRepoFilters(data ?? [])
  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  })

  if (!username) return <p>No username provided.</p>
  if (isLoading) return <p>Loading repos for {username}…</p>

  if (isError) {
    if (error instanceof GithubError && error.status === 404) {
      return <p>User &quot;{username}&quot; not found.</p>
    }
    return <p>Error: {error.message}</p>
  }

  if (!data || data.length === 0) {
    return <p>{username} has no public repositories.</p>
  }

  return (
    <main>
      <h1>{username}</h1>
      <div>
        <input
          type="search"
          value={q}
          onChange={(e) => setParam('q', e.target.value)}
          placeholder="Filter by name"
          aria-label="Filter repositories by name"
        />
        <select
          value={lang}
          onChange={(e) => setParam('lang', e.target.value)}
          aria-label="Filter by language"
        >
          <option value="">All languages</option>
          {languages.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setParam('sort', e.target.value)}
          aria-label="Sort repositories"
        >
          <option value="">Default order</option>
          <option value="stars">Most stars</option>
          <option value="updated">Recently updated</option>
        </select>
      </div>

      {// 70vh is a deliberate simple choice; revisit if a fixed header/footer is added
      filtered.length === 0 ? (
        <p>No repositories match the current filters.</p>
      ) : (
        <div ref={parentRef} style={{ height: '70vh', overflow: 'auto' }}>
          <ul
            aria-label={`Repositories for ${username}`}
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
              margin: 0,
              padding: 0,
              listStyle: 'none',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const repo = filtered[virtualItem.index]
              if (!repo) return null
              return (
                <li
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <RepoCard repo={repo} />
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </main>
  )
}
