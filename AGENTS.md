# SmartPocket Agent Guide

## Repository Scope

- This is a monorepo without a workspace manager: `webapp/` is the React SPA, `backend/src/` is the .NET API, and `_docs/` contains planning and technical documentation.
- The existing project guidance is in `.github/copilot-instructions.md`; read it for project-specific constraints. The focused rules in `.github/instructions/` apply to matching files, and repository skills live under `.agents/skills/`.
- Normal AI work is limited to `webapp/` and `_docs/planning/`. Change `backend/` only when the user explicitly requests backend work.
- Do not invent API endpoints. Confirm the existing controller/service contract before adding frontend calls.

## Commands

Run frontend commands from `webapp/`:

```text
npm install
npm run dev
npm run lint
npm run build
npm test
npm test -- src/utils/formatters.test.ts
npm run test:coverage
```

- `npm run build` runs `tsc -b` before the Vite production build.
- Vitest uses the `node` environment, so the configured tests are for pure functions rather than browser/DOM rendering.
- Run backend commands from `backend/src/`:

```text
dotnet build SmartPocket.sln
dotnet test SmartPocket.sln
dotnet run --project SmartPocket.WebApi/SmartPocket.WebApi.csproj
```

- The backend targets .NET 9. The solution includes `BuildingBlocks`, `Domain`, `Features`, `Persistence`, `WebApi`, and `SmartPocket.Tests`.
- Backend integration tests use SQLite in-memory (`Data Source=:memory:;Foreign Keys=True`); inspect `IntegrationTestFixture` before changing test setup.
- The API requires the `ConnectionStrings:SmartPocketContext` configuration value. The checked-in `appsettings*.json` values are empty; use local configuration/user secrets rather than committing connection strings.

## Local Integration

- `webapp/.env.local` sets `VITE_API_BASE_URL=http://localhost:5261/api`; keep this aligned with the HTTP profile in `backend/src/SmartPocket.WebApi/Properties/launchSettings.json`.
- Vite proxies `/api` using `VITE_API_BASE_URL`, falling back to `http://localhost:5000`; do not rely on the fallback when using the default .NET launch profile.
- The backend applies `/api` as its path base, so frontend service URLs are relative to `/api` and must match the existing REST routes.

## Architecture Rules

- Frontend code is feature-first under `webapp/src/features/`; shared UI belongs in `src/components/`, shared hooks in `src/hooks/`, HTTP services in `src/api/services/`, and routing in `src/router/`.
- Use named exports only, TypeScript strict mode, the `@/*` alias for cross-module imports, and no `any`. Use Zod for frontend form validation and TanStack Query for server state; do not replace query hooks with ad-hoc `useEffect` fetching.
- Keep feature boundaries: a feature must not import another feature directly. Promote shared code to `components/`, `hooks/`, or `utils/`.
- Backend features follow vertical slices under `SmartPocket.Features/{Entity}/{Operation}/` with handlers and FluentValidation; controllers map results through the existing `ToActionResult()`/ProblemDetails pipeline.
- Account balances are calculated from transaction sums, not stored as a mutable balance. Soft deletes use `IsDeleted` and global EF query filters.
- Mutations that affect balances or dashboard data must invalidate the related TanStack Query caches, including cross-feature keys such as `accounts` and `dashboard`.
- Use the existing Axios error interceptor and centralized error handling instead of creating feature-specific API error pipelines.

## Style And Safety

- Code identifiers and filenames are English; project communication and documentation are Spanish unless the surrounding file establishes another convention.
- Tailwind is v4: use `@import "tailwindcss"`, `@theme`, OKLCH theme colors, and the Vite Tailwind plugin; do not add a v3 `tailwind.config.js` or `@tailwind` directives.
- Use `cn()` for conditional Tailwind classes and keep responsive layouts mobile-first.
- Do not log tokens, passwords, headers, API keys, or sensitive payloads. Do not put secrets in source or committed environment files.
