import { useParams } from 'react-router-dom'
import { useRepos } from '../hooks/useRepos.ts'
import { GithubError } from '../lib/github/index.ts'
import { RepoCard } from '../components/RepoCard.tsx'

export function RepoListPage() {
  const { username } = useParams<{ username: string }>()
  const { data, isLoading, isError, error } = useRepos(username ?? '')

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
      <ul>
        {data.map((repo) => (
          <RepoCard key={repo.id} repo={repo} />
        ))}
      </ul>
    </main>
  )
}
