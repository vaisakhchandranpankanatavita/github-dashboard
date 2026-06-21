# GitHub Dashboard

A single-page app for exploring a GitHub user's public repositories. Enter a username, browse and filter their repos by name or language, sort by stars or last updated, and click through to a detail view with description, stats, language breakdown, and recent commits.

## Running locally

```bash
npm install
cp .env.example .env        # then optionally add VITE_GITHUB_TOKEN (see below)
npm run dev
```

**GitHub token (optional).** The app works unauthenticated but hits GitHub's 60 req/hr rate limit quickly. Add a classic personal access token (no scopes needed — public data only) to `.env`:

```
VITE_GITHUB_TOKEN=ghp_...
```

This raises the limit to 5 000 req/hr.

```bash
npm test            # Vitest unit tests (watch mode)
npm test -- --run   # single-pass
npm run typecheck   # tsc --noEmit
npm run build       # typecheck + production build
```

## Tech choices

**React 19 + TypeScript + Vite.** Standard, fast iteration loop. Strict mode on (`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`) — the compiler surfaces real bugs rather than being decoration.

**TanStack Query** for all data fetching. It handles caching, deduplication, and loading/error state without manual `useEffect` + `useState` plumbing. The cache means navigating back from a detail page is instant: no refetch, no loading spinner.

**URL-as-state via `useSearchParams`** for filters and sort. Filter state lives in the URL rather than component state, so it survives refresh, is shareable, and works with the browser's back button — no extra state management layer needed.

**In-memory filtering over a cached query result.** Filter and sort params are intentionally excluded from the TanStack Query key. Changing a filter never triggers a network request — it reruns a `useMemo` over the cached repo array. This keeps the API interaction simple (one fetch per username) and makes filtering instant.

**TanStack Virtual** for the repo list. Renders only the visible rows regardless of how many repos a user has. The scroll container gets `tabIndex={0}` so keyboard users can arrow-key scroll through the virtualised list.

**Live GitHub REST API, unauthenticated by default.** No mock server, no fixture files. Real data means real edge cases: empty repos, repos with no language, API errors. The optional token is the only configuration the app needs.

**Vitest + React Testing Library, mocked network.** Tests cover the API client (auth header, error status), filter/sort logic, the 409 → empty-state handling in `useCommits`, and the not-found render state in `RepoListPage`. All network calls are mocked with `vi.stubGlobal('fetch', ...)` or `vi.mock(...)` — the test suite never hits the real API.

## Assumptions

- **Recent commits** = last 10 commits on `repo.default_branch`. The count is a deliberate cut; the endpoint supports up to 100 per page if needed.
- **Empty repo (409)** — GitHub returns 409 Conflict on the commits endpoint for a repo with no commits. `useCommits` catches this status specifically and returns `[]` rather than surfacing an error.
- **Forks and archived repos** are included in the list without distinction. The API response includes `fork` and `archived` fields but they are not currently filtered or labelled.
- **`per_page=100`** — GitHub's maximum per page. The client fetches all pages by following the `Link: rel="next"` header until it is absent.
- **API responses are cast, not validated.** The GitHub REST API is read-only, public, and well-documented. A schema mismatch produces a UI glitch rather than a security issue, so Zod validation is deferred — see below.

## With more time

- **Zod validation** on all API responses. Currently the client casts `unknown as T`; Zod would catch API drift at the boundary and give cleaner error messages.
- **Fork toggle and archived badge** — the data is already in the API response; excluding forks by default and badging archived repos are straightforward filter/display additions.
- **Debounced username autocomplete** using GitHub's user-search endpoint. Right now the full fetch fires on form submit only.
- **Playwright E2E tests** covering the full navigation flow (home → list → detail → back) and filter interactions. The current suite covers units; the happy-path integration is only manually tested.
- **Debounced filter inputs** — currently every keystroke reruns the filter memo; fine for 100 repos, unnecessary for any future paginated set.

## Known issues / how I caught them

**Repo list capped at 100 items regardless of actual repo count.**

- **Cause.** GitHub REST API hard-caps `per_page` at 100 per request. The initial implementation made a single request and returned whatever came back — no pagination loop.
- **How caught.** Tested against an account with a large number of public repos (`sindresorhus`, 1 100+ repos). The list showed exactly 100 entries and stopped; the same search on GitHub's own UI shows all of them. An account with fewer than 100 repos would never trigger the symptom.
- **Fix.** `fetchUserRepos` now accumulates pages in a loop. After each response it reads the `Link` header and follows the `rel="next"` URL; when that header is absent the loop ends. The fix is in `src/lib/github/client.ts`.

**Post-fix code review surfaced 7 secondary issues in the pagination implementation.**

- **How caught.** The `code-reviewer` subagent reviewed the pagination diff cold (no conversation context) across correctness, removed-behaviour, cross-file, and conventions angles.
- **Triage.** Four were real bugs and got fixed immediately: the TanStack Query retry handler restarting the entire page loop from page 1 on any transient error; `fetchUserRepos` ignoring the `AbortSignal` TanStack provides (loop continued fetching after the query was cancelled); `res.json()` throwing a raw `SyntaxError` on non-JSON 200 responses rather than a typed `GithubError`; and no maximum-page guard on the `while` loop. One was deferred to the "with more time" list (pagination test coverage). Two were declined as speculative for this project's actual scale: guarding `get<T>` against misuse on hypothetical future paginated endpoints, and extracting the hard-coded `https://api.github.com` base URL into a constant when there is no second environment to point it at.
- **Why this is here.** Not every flagged issue is worth fixing. The review process includes deciding what is real risk versus what is low-impact or speculative — acting on everything a reviewer surfaces without that judgement is its own failure mode.

## Working with Claude Code

Development notes and corrections are in `NOTES.md`.

The control stack used throughout:

- **`CLAUDE.md`** — hard rules the agent can't override: no `any`, no `!` assertions, URL-as-state, TanStack Query for all fetching, every async surface handles loading/error/empty/not-found, no secrets committed.
- **Stop hook** — `.claude/settings.json` runs `npm run typecheck && npm test -- --run` automatically after every agent turn, so type errors and broken tests surface immediately rather than accumulating.
- **`/slice` command** — structured workflow for each feature: propose files + states + tests, wait for approval, implement, run typecheck/tests, run the code-reviewer subagent before committing.
- **`/a11y-audit` command** — dedicated accessibility audit pass: tab order, focus management, ARIA labels, focus-visible styles. Run once, report gaps by severity, fix only after confirmation.
- **`code-reviewer` subagent** — independent review of each uncommitted diff for type holes, missing async states, a11y gaps, and unnecessary complexity. Runs cold (no conversation context) to avoid anchoring to the agent's own choices.

The plan-first discipline was the main lever: every slice was proposed before any file was touched, decisions were explicit rather than implicit, and each review round caught things the initial implementation missed.
