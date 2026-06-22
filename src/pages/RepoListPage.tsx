import { useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRepos } from '../hooks/useRepos.ts'
import { useRepoFilters } from '../hooks/useRepoFilters.ts'
import { GithubError } from '../lib/github/index.ts'
import { RepoCard } from '../components/RepoCard.tsx'

function StateIcon() {
  return (
    <svg
      className="state-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="16" y1="16" x2="21" y2="21" />
    </svg>
  )
}

export function RepoListPage() {
  const { username } = useParams<{ username: string }>()
  const { data, isLoading, isError, error } = useRepos(username ?? '')
  const { q, lang, sort, setParam, languages, filtered } = useRepoFilters(data ?? [])
  const parentRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  })

  const backLink = (
    <nav aria-label="Breadcrumb">
      <Link className="back-link" to="/" aria-label="Back to search">
        <span aria-hidden="true">←</span>{' '}New search
      </Link>
    </nav>
  )

  if (!username) return <p>No username provided.</p>

  if (isLoading) {
    return (
      <main>
        {backLink}
        <p className="sr-only" role="status" aria-live="polite">
          Loading repositories for {username}…
        </p>
        <ul className="repo-list" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="skeleton-row">
              <div className="skeleton-bar" style={{ width: `${60 - i * 4}%` }} />
            </li>
          ))}
        </ul>
      </main>
    )
  }

  if (isError) {
    if (error instanceof GithubError && error.status === 404) {
      return (
        <main>
          {backLink}
          <div className="state" role="alert">
            <StateIcon />
            {/* Heading wording kept dynamic to satisfy RepoListPage.test.tsx */}
            <p className="state-heading">User &quot;{username}&quot; not found.</p>
            <p className="state-text">Check the username and try again.</p>
          </div>
        </main>
      )
    }
    return (
      <main>
        {backLink}
        <div className="state" role="alert">
          <StateIcon />
          <p className="state-heading">Something went wrong</p>
          <p className="state-text">GitHub API returned an error.</p>
        </div>
      </main>
    )
  }

  if (!data || data.length === 0) {
    return (
      <main>
        {backLink}
        <div className="state">
          <StateIcon />
          <p className="state-heading">No public repositories</p>
          <p className="state-text">{username} hasn&apos;t published any repositories yet.</p>
        </div>
      </main>
    )
  }

  return (
    <main>
      {backLink}
      <h1 className="list-heading" ref={headingRef} tabIndex={-1}>{username}</h1>
      <div className="filter-row" role="group" aria-label="Filter and sort repositories">
        <input
          className="filter-control"
          type="search"
          value={q}
          onChange={(e) => setParam('q', e.target.value)}
          placeholder="Filter by name"
          aria-label="Filter repositories by name"
        />
        <select
          className="filter-control"
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
          className="filter-control"
          value={sort}
          onChange={(e) => setParam('sort', e.target.value)}
          aria-label="Sort repositories"
        >
          <option value="">Default order</option>
          <option value="stars">Most stars</option>
          <option value="updated">Recently updated</option>
        </select>
      </div>

      <p className="repo-count" role="status" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'repository' : 'repositories'}
      </p>

      {// 70vh is a deliberate simple choice; revisit if a fixed header/footer is added
      filtered.length === 0 ? (
        <div className="state">
          <StateIcon />
          <p className="state-heading">No repositories match your filters.</p>
        </div>
      ) : (
        <div ref={parentRef} tabIndex={0} style={{ height: '70vh', overflow: 'auto' }}>
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
                  className="repo-row"
                  data-index={virtualItem.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <RepoCard repo={repo} username={username} />
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </main>
  )
}
