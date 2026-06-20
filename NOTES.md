# Notes

This file logs how I directed and corrected Claude Code during the build.

## What I caught / corrected

- **.gitignore audit.** The agent summarized it as "standard, covers common files." I read the raw file and found plain `.env` was NOT ignored — only `*.local` was. Added `.env` explicitly before the first push. A leaked token on a public repo would be unrecoverable.

- **vite-env.d.ts.** During implementation the agent created a file its plan seemed to have dropped. I paused and asked why. The reason was sound — the file is required for `import.meta.env` to typecheck, and `?: string` forces the token-presence guard in the client. A case of querying rather than blind-approving, and the query confirmed the agent was right.

- **Zod / runtime validation.** The reviewer pushed for schema validation on API responses. I declined it as scope-creep for a read-only public API on a time-boxed task, and documented the trade-off in the README instead.

- **Rules-of-Hooks false positive.** The reviewer flagged calling `useRepos` before the `!username` guard as a blocker. It's the required pattern — hooks can't follow a conditional return. Declined the fix.

- **strict / noUncheckedIndexedAccess never actually enabled.** CLAUDE.md and README claimed strict mode was on, but the real tsconfig had neither flag. A reviewer comment made me verify the actual file instead of trusting the description. Enabled both — code was already clean (zero errors) — so the config now matches the docs.

- **JSX syntax error from a review fix.** A review fix (adding an explanatory comment) introduced a JSX syntax error that typecheck passed but crashed the dev server with a 500. Caught it by browser-testing, not the typecheck hook — reinforced that typecheck and the runtime build catch different errors.

- **Filtering and sorting are in-memory, verified.** Filter and sort changes produce zero network requests — they run over the cached TanStack Query result. The query key intentionally excludes filter params so changing a filter never triggers a refetch.

- **Orphaned "Recent commits" heading while repo loads.** The reviewer caught that the commits section heading rendered with empty content while the repo was still loading — the commits query waits for `default_branch`, so during repo load it had no data and no spinner, just a bare `<h2>`. Gated the whole section on `repoQuery.data !== undefined`. A UX bug typecheck couldn't catch — only visible by running the app.
