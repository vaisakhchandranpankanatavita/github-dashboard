# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server with HMR
npm run build        # type-check + production build (tsc -b && vite build)
npm run typecheck    # type-check only, no emit
npm run lint         # ESLint
npm run test         # vitest (watch mode)
npm run preview      # preview production build
```

## Architecture

React 19 + TypeScript + Vite. Entry: `src/main.tsx` mounts `<App />` into `#root` wrapped in `<StrictMode>`.

Two tsconfig files in play:
- `tsconfig.app.json` — compiles `src/` with strict TypeScript (`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`)
- `tsconfig.node.json` — compiles Vite config files

The project uses `verbatimModuleSyntax`, so type-only imports must use `import type`.

ESLint is configured with `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`. To enable type-aware lint rules (stricter), update `eslint.config.js` to use `tseslint.configs.recommendedTypeChecked` and add `parserOptions.project`.

Vitest is listed as a script target but not yet installed — add it to `devDependencies` before running tests.

## Project

A dashboard over GitHub repo data. Enter a GitHub username, see their public
repos in a filterable (name, language) and sortable (stars, last updated) list.
Clicking a repo opens a detail view: description, stars/forks/open issues,
language breakdown, recent commits, and one visualization.

## Hard rules

- No `any`. No non-null `!` to silence the compiler. Type API responses properly.
- Filters and sort live in the URL (useSearchParams), never local useState.
- Every async surface has explicit loading / error / empty / not-found states.
- Data fetching goes through TanStack Query. No bare fetch inside components.
- Never commit secrets. The GitHub token comes from .env (gitignored).
- Ask before adding any dependency.

## Conventions

- Components in `src/components`, hooks in `src/hooks`, API client in `src/lib/github`.
- Co-locate tests as `*.test.tsx` next to the unit under test.
- Type-only imports use `import type` (verbatimModuleSyntax is on).

## Git conventions

- Conventional Commits: feat / fix / chore / test / refactor / docs.
- One commit per vertical slice; the message describes the slice.

## Documented assumptions

- Recent commits = last 10 on the default branch (`repo.default_branch`).
- Empty repo: handle the 409 from the commits endpoint with an empty state.
- Forks excluded from the default list (toggle to show). Archived repos shown with a badge.
