# Notes

This file logs how I directed and corrected Claude Code during the build.

## Where Claude Code helped

- **Typed scaffolding came out right first time.** The API client, all hooks, and routing boilerplate were correct on the first plan — proper error types, right query key design, loading/error/empty states handled without prompting.

- **Plans needed little rewriting.** The /slice workflow produced proposals I could approve or adjust at the decision level, not rewrite from scratch. The agent reasoned about trade-offs (estimateSize vs CSS height, dep-array choice) rather than just generating code.

- **The code-reviewer subagent caught real issues.** The orphaned commits heading (bare `<h2>` with no content while the repo loaded), the strict/noUncheckedIndexedAccess config claimed but not actually set, CSS leaking from a focus-ring insertion onto `<code>` elements — none of these came from me; all from the cold reviewer.

- **Boilerplate handled so I could focus on decisions.** Virtualizer setup, TanStack Query wiring, ARIA patterns, test mocking — done correctly and quickly. My attention stayed on what to build and what to decline.

## What I caught / corrected

- **.gitignore audit.** The agent summarized it as "standard, covers common files." I read the raw file and found plain `.env` was NOT ignored — only `*.local` was. Added `.env` explicitly before the first push. A leaked token on a public repo would be unrecoverable.

- **vite-env.d.ts.** During implementation the agent created a file its plan seemed to have dropped. I paused and asked why. The reason was sound — the file is required for `import.meta.env` to typecheck, and `?: string` forces the token-presence guard in the client. A case of querying rather than blind-approving, and the query confirmed the agent was right.

- **Zod / runtime validation.** The reviewer pushed for schema validation on API responses. I declined it as scope-creep for a read-only public API on a time-boxed task, and documented the trade-off in the README instead.

- **Rules-of-Hooks false positive.** The reviewer flagged calling `useRepos` before the `!username` guard as a blocker. It's the required pattern — hooks can't follow a conditional return. Declined the fix.

- **strict / noUncheckedIndexedAccess never actually enabled.** CLAUDE.md and README claimed strict mode was on, but the real tsconfig had neither flag. A reviewer comment made me verify the actual file instead of trusting the description. Enabled both — code was already clean (zero errors) — so the config now matches the docs.

- **JSX syntax error from a review fix.** A review fix (adding an explanatory comment) introduced a JSX syntax error that typecheck passed but crashed the dev server with a 500. Caught it by browser-testing, not the typecheck hook — reinforced that typecheck and the runtime build catch different errors.

- **Filtering and sorting are in-memory, verified.** Filter and sort changes produce zero network requests — they run over the cached TanStack Query result. The query key intentionally excludes filter params so changing a filter never triggers a refetch.

- **Orphaned "Recent commits" heading while repo loads.** The reviewer caught that the commits section heading rendered with empty content while the repo was still loading — the commits query waits for `default_branch`, so during repo load it had no data and no spinner, just a bare `<h2>`. Gated the whole section on `repoQuery.data !== undefined`. A UX bug typecheck couldn't catch — only visible by running the app.

## Prompts worth keeping

**Plan-first slice with explicit scope** (test suite):
> Write a focused test suite — only high-value tests, no coverage-chasing. Cover: (1) the API client — sends Authorization header when token is set, omits it when absent, throws GithubError with the right status on a non-ok response; (2) the filter/sort logic — name filter narrows, language filter narrows, sort by stars and by updated order correctly; (3) useCommits returns an empty array on a 409 instead of throwing; (4) one component test — the not-found state renders the right message. Mock all network/client calls. Show me the plan first.

**Reviewer triage — numbered decisions, explicit skips:**
> Now: (1) change the focus useEffects in RepoListPage/RepoDetailPage to use a [] dep array and drop the didFocus ref; (2) on HomePage, remove the heading-focus useEffect and keep focus on the search input; (4) in RepoListPage.test.tsx, replace the `as unknown as` cast with an object containing only the fields the component uses. Fix (3) if it's a clean change, otherwise leave a comment. Skip 5, 6, 7.

**Verify before trusting the description:**
> Does the app actually have a fork-inclusion toggle and an archived-repo badge? Check RepoListPage and RepoCard. If not, tell me — don't add them, just confirm what exists.

**Corrective with the specific failure explained:**
> On the home page, focus should go to the search input, not the `<h1>`. The a11y pass added heading-focus to HomePage which conflicts with the input's autoFocus — so now neither works right. Remove the heading-focus useEffect from HomePage and ensure the search input receives focus on load. Keep the heading-focus pattern on RepoListPage and RepoDetailPage — those are navigation targets where focus-to-heading is correct. Show me the diff.
