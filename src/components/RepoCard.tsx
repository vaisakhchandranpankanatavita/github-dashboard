import type { GithubRepo } from '../lib/github/index.ts'

interface RepoCardProps {
  repo: GithubRepo
}

export function RepoCard({ repo }: RepoCardProps) {
  return (
    <li>
      <a href={repo.html_url} target="_blank" rel="noreferrer">
        {repo.name}
      </a>
      {repo.description !== null && <p>{repo.description}</p>}
      <span>{repo.language ?? '—'}</span>
      <span>★ {repo.stargazers_count}</span>
      <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
    </li>
  )
}
