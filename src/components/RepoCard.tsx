import { Link } from 'react-router-dom'
import type { GithubRepo } from '../lib/github/index.ts'

interface RepoCardProps {
  repo: GithubRepo
  username: string
}

export function RepoCard({ repo, username }: RepoCardProps) {
  return (
    <article>
      <Link to={`/user/${username}/${repo.name}`}>
        {repo.name}
      </Link>
      {repo.description !== null && <p>{repo.description}</p>}
      <span>{repo.language ?? '—'}</span>
      <span><span aria-hidden="true">★</span> {repo.stargazers_count}<span className="sr-only"> stars</span></span>
      <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
    </article>
  )
}
