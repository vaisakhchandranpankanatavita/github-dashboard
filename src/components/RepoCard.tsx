import { Link } from 'react-router-dom'
import type { GithubRepo } from '../lib/github/index.ts'
import { getLanguageColor } from '../lib/languageColors.ts'

interface RepoCardProps {
  repo: GithubRepo
  username: string
}

export function RepoCard({ repo, username }: RepoCardProps) {
  return (
    <article className="repo-card">
      <div className="repo-card-body">
        <Link to={`/user/${username}/${repo.name}`}>{repo.name}</Link>
        {repo.description !== null && <p>{repo.description}</p>}
      </div>
      <div className="repo-card-meta">
        {repo.language !== null && (
          <span className="repo-lang">
            <span
              className="lang-dot"
              style={{ backgroundColor: getLanguageColor(repo.language) }}
              aria-hidden="true"
            />
            {repo.language}
          </span>
        )}
        <span><span aria-hidden="true">★</span> {repo.stargazers_count}<span className="sr-only"> stars</span></span>
        <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
      </div>
    </article>
  )
}
