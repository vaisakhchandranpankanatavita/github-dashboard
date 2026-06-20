export interface GithubRepo {
  readonly id: number
  readonly name: string
  readonly full_name: string
  readonly description: string | null
  readonly html_url: string
  readonly stargazers_count: number
  readonly forks_count: number
  readonly open_issues_count: number
  readonly language: string | null
  readonly updated_at: string
  readonly pushed_at: string
  readonly default_branch: string
  readonly fork: boolean
  readonly archived: boolean
  readonly topics: readonly string[]
  readonly visibility: string
}

export interface GithubLanguages {
  readonly [language: string]: number
}

export interface GithubCommitAuthorDetail {
  readonly name: string
  readonly email: string
  readonly date: string
}

export interface GithubCommitAuthor {
  readonly login: string | null
  readonly avatar_url: string
}

export interface GithubCommit {
  readonly sha: string
  readonly html_url: string
  readonly commit: {
    readonly message: string
    readonly author: GithubCommitAuthorDetail
  }
  readonly author: GithubCommitAuthor | null
}
