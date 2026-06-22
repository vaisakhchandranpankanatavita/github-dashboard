import { useParams, Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useRepo } from '../hooks/useRepo.ts'
import { useLanguages } from '../hooks/useLanguages.ts'
import { useCommits } from '../hooks/useCommits.ts'
import { GithubError } from '../lib/github/index.ts'
import { LanguageBar } from '../components/LanguageBar.tsx'

export function RepoDetailPage() {
  const { username, repo: repoName } = useParams<{ username: string; repo: string }>()

  const repoQuery = useRepo(username ?? '', repoName ?? '')
  const languagesQuery = useLanguages(username ?? '', repoName ?? '')
  const commitsQuery = useCommits(
    username ?? '',
    repoName ?? '',
    repoQuery.data?.default_branch ?? '',
  )

  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  if (!username || !repoName) return <p>Invalid URL.</p>

  return (
    <main>
      <nav aria-label="Breadcrumb">
        <Link
          className="back-link"
          to={`/user/${username}`}
          aria-label={`Back to ${username}'s repositories`}
        >
          ← {username}
        </Link>
      </nav>

      <section aria-label="Repository overview">
        {repoQuery.isLoading && <p>Loading repository…</p>}
        {repoQuery.isError && (
          repoQuery.error instanceof GithubError && repoQuery.error.status === 404
            ? <p>Repository &quot;{repoName}&quot; not found.</p>
            : <p>Error: {repoQuery.error.message}</p>
        )}
        {repoQuery.data !== undefined && (
          <>
            <h1 className="detail-title" ref={headingRef} tabIndex={-1}>{repoQuery.data.name}</h1>
            {repoQuery.data.description !== null && <p className="detail-description">{repoQuery.data.description}</p>}
            <ul className="repo-stats" aria-label="Repository statistics">
              <li><span aria-hidden="true">★</span> {repoQuery.data.stargazers_count}<span className="sr-only"> stars</span></li>
              <li>{repoQuery.data.forks_count} forks</li>
              <li>{repoQuery.data.open_issues_count} open issues</li>
            </ul>
          </>
        )}
      </section>

      {repoQuery.data !== undefined && (
        <section aria-label="Language breakdown">
          <h2 className="section-heading">Languages</h2>
          {languagesQuery.isLoading && <p>Loading languages…</p>}
          {languagesQuery.isError && <p>Error loading languages: {languagesQuery.error.message}</p>}
          {languagesQuery.data !== undefined && (
            Object.keys(languagesQuery.data).length === 0
              ? <p>No language data available.</p>
              : <LanguageBar languages={languagesQuery.data} />
          )}
        </section>
      )}

      {repoQuery.data !== undefined && (
        <section aria-label="Recent commits">
          <h2 className="section-heading">Recent commits</h2>
          {commitsQuery.isLoading && <p>Loading commits…</p>}
          {commitsQuery.isError && <p>Error loading commits: {commitsQuery.error.message}</p>}
          {commitsQuery.data !== undefined && (
            commitsQuery.data.length === 0
              ? <p>No commits yet — this repository is empty.</p>
              : (
                <ol className="repo-commits">
                  {commitsQuery.data.map((commit) => {
                    const firstLine = commit.commit.message.split('\n')[0] ?? commit.commit.message
                    const author = commit.author?.login ?? commit.commit.author.name
                    return (
                      <li key={commit.sha}>
                        <a className="commit-message" href={commit.html_url} target="_blank" rel="noreferrer">
                          {firstLine}
                          <span className="sr-only"> (opens in new tab)</span>
                        </a>
                        <div className="commit-meta">
                          <span>{author}</span>
                          <time dateTime={commit.commit.author.date}>
                            {' — '}{new Date(commit.commit.author.date).toLocaleDateString()}
                          </time>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )
          )}
        </section>
      )}
    </main>
  )
}
