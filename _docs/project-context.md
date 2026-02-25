---
project_name: "webapp"
user_name: "Chino"
date: "2026-02-20"
sections_completed:
  [
    "technology_stack",
    "language_rules",
    "framework_rules",
    "testing_rules",
    "code_quality",
    "critical_rules",
  ]
existing_patterns_found: 27
workflow_complete: true
---

# Project Context for AI Agents - SmartPocket

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Core Technologies

**Runtime:**

- React `19.1.1` + React DOM `19.1.1`
- TypeScript `5.8.3` (strict mode enabled)
- Node.js target: ES2022

**Build & Dev:**

- Vite `7.1.2`
- @vitejs/plugin-react `5.0.0`

### UI Framework & Styling

**Tailwind CSS v4** (⚠️ New API):

- tailwindcss `4.1.12`
- @tailwindcss/vite `4.1.12`
- Uses `@theme`, `@import "tailwindcss"`, `oklch` color format

**shadcn/ui Components (Radix UI):**

- @radix-ui/react-dialog `1.1.15`
- @radix-ui/react-alert-dialog `1.1.15`
- @radix-ui/react-select `2.2.6`
- @radix-ui/react-label `2.1.8`
- @radix-ui/react-checkbox `1.3.3`
- @radix-ui/react-slot `1.2.4`

**Icons:**

- @heroicons/react `2.2.0`
- lucide-react `0.546.0`

### State Management & Data Fetching

- **@tanstack/react-query** `5.90.6` (server state - PRIMARY)
- **axios** `1.13.1` (HTTP client with interceptors)
- **zustand** `5.0.8` (client state - OPTIONAL, may be removed)

### Routing & Forms

- **react-router-dom** `7.9.5`
- **react-hook-form** `7.71.1`
- **@hookform/resolvers** `5.2.2`
- **zod** `4.3.6`

### UI Utilities

- **class-variance-authority** `0.7.1`
- **clsx** `2.1.1`
- **tailwind-merge** `3.3.1`
- **sonner** `2.0.7` (toast notifications)

### Testing

- **vitest** `4.0.15`
- **@vitest/ui** `4.0.15`
- Environment: `node` (for pure functions, no DOM)

### Linting & Quality

- **eslint** `9.33.0` (flat config)
- **typescript-eslint** `8.39.1`
- **eslint-plugin-react-hooks** `5.2.0`
- **eslint-plugin-react-refresh** `0.4.20`

### Backend API

- .NET REST API (external)
- Proxy via Vite: `/api` → `http://localhost:5000/api`
- Base URL: `VITE_API_BASE_URL` env variable

### Critical Version Constraints

⚠️ **Tailwind CSS v4** - Uses new API incompatible with v3 (no `tailwind.config.js`, uses `@theme` in CSS)
⚠️ **React 19** - New features and hook behavior changes
⚠️ **TypeScript strict mode** - All strict flags enabled
⚠️ **Vite 7** - New major version, updated config API

---

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

#### TypeScript Configuration

**Strict Mode Enabled:**

- All strict flags: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`
- Target: ES2022, Module: ESNext
- `verbatimModuleSyntax: true` (no implicit type imports)

#### Import/Export Conventions

**✅ ALWAYS use named exports:**

```typescript
export function Component() {}
export const constant = {};
export type TypeName = {};
export interface InterfaceName {}
```

**❌ NEVER use default exports** - Prohibited

**Import Order:**

1. External packages (React, libraries)
2. Absolute imports with `@/` alias
3. Relative imports `./`

**Path Aliases:**

- `@/` for cross-feature imports
- `./` for intra-module imports

#### Type Safety Rules

**❌ NO usar `any` - PROHIBIDO**
**⚠️ Minimizar uso de `unknown` - Solo cuando sea absolutamente necesario**

**✅ Preferir tipos específicos:**

```typescript
// ✅ Correcto - Tipo específico
function process<T>(data: T) {}
function handle(error: Error | ApiError) {}

// ⚠️ Solo si realmente no hay alternativa
function handleUnknown(value: unknown) {}

// ❌ PROHIBIDO
function process(data: any) {}
```

**Prefer Union Types over Enums:**

```typescript
type Status = "pending" | "completed" | "failed";
type Mode = "create" | "edit";
```

**Type Inference con Zod:**

```typescript
export const schema = z.object({
  /* ... */
});
export type FormValues = z.infer<typeof schema>;
```

**`as const` for Constants:**

```typescript
export const ROUTES = { HOME: "/" /* ... */ } as const;
```

#### Error Handling

**Always use typed errors:**

- Transform `AxiosError` to `ApiError` via `handleApiError()`
- Define custom error interfaces
- Use type guards when needed

#### Async/Await Patterns

- Services return `Promise<T>` explicitly
- Components use hooks (NOT direct async calls)
- TanStack Query abstracts async in components

---

### Framework-Specific Rules (React + Ecosystem)

#### React Version

- React 19.1.1 (latest version)
- New features: `use()` hook, async components support
- Hook behavior changes from previous versions

#### Component Architecture

**Feature-First Structure (Flat by Default):**

```
src/features/{feature}/
  ├── ComponentName.tsx
  ├── AnotherComponent.tsx
  ├── useEntity.ts
  ├── entityTypes.ts
  └── helpers.ts
```

**Folder Organization:**

- **Default:** Keep flat (no internal folders)
- **When to organize:** Contextual decision at implementation time
- **Criteria:** Only when file count hinders visual navigation
- **Philosophy:** Personal app, not a rocket - avoid over-engineering

**File Naming:**

- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` (useEntity.ts)
- Utils: `camelCase.ts`
- Types: `camelCase.ts`

#### Data Fetching Layer (TanStack Query)

**Architecture Flow:**

```
Component → Hook (TanStack Query) → Service → spApiClient → API
```

**General Rule: Components call hooks (NOT services directly)**

**✅ Exceptions Allowed (clear criteria):**

Component can call service directly ONLY if:

1. One-off operation without reusability (e.g., unique CSV export)
2. Does NOT require caching (stateless operation)
3. Does NOT benefit from TanStack Query features (retry, refetch, etc.)

**⚠️ Exception Requirement:**

- If using direct service → MUST add integration test covering that path
- Mock service in component test: `vi.mock('@/api/services/...')`

**Service Pattern:**

```typescript
export const accountService = {
  getAll: async () => {
    const response = await spApiClient.get<PagedListResponse<Account>>("/accounts");
    return response.data.data; // Extract from ApiResponse<T>
  },
  create: async (data: AccountCreateCommand) => {
    const response = await spApiClient.post<Account>("/accounts", data);
    return response.data;
  },
};
```

**Hook Pattern:**

```typescript
// Query key factory
export const accountKeys = {
  all: ["accounts"] as const,
  detail: (id: number) => ["accounts", id] as const,
};

export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.all,
    queryFn: accountService.getAll,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
```

**Cache Invalidation Patterns:**

```typescript
// Invalidate ALL accounts queries
queryClient.invalidateQueries({ queryKey: ["accounts"] });

// Invalidate specific account
queryClient.invalidateQueries({ queryKey: ["accounts", id] });

// Partial matching
queryClient.invalidateQueries({
  predicate: (query) => query.queryKey[0] === "accounts",
});
```

#### Mutation Patterns: `mutate` vs `mutateAsync`

**Default: Use `mutate` with callbacks**

```typescript
const createMutation = useCreateAccount();

const onSubmit = (data: FormData) => {
  createMutation.mutate(data, {
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
    },
    onError: (error: ApiError) => setApiError(error),
  });
};
```

**Why `mutate`:**

- More declarative
- Callbacks execute after hook callbacks
- No explicit try/catch needed

**✅ When to use `mutateAsync`:**

ONLY for **sequential complex flows** with dependencies between mutations:

```typescript
const handleTransfer = async () => {
  try {
    const transfer = await createTransferMutation.mutateAsync(data);
    await updateBalanceMutation.mutateAsync({
      accountId: transfer.fromAccountId,
    });
    toast.success("Transfer completed");
  } catch (error) {
    toast.error("Transfer failed");
  }
};
```

**❌ DO NOT use `mutateAsync` for:**

- Independent mutations (use `mutate` with callbacks)
- Just to have async/await syntax (unnecessary)

#### Form Handling (React Hook Form + Zod)

**Pattern:**

```typescript
// 1. Schema first
export const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  balance: z.coerce.number().min(0),
});
export type AccountFormValues = z.infer<typeof accountSchema>;

// 2. Form setup
const form = useForm<AccountFormValues>({
  resolver: zodResolver(accountSchema),
  defaultValues: { name: "", balance: 0 },
});

// 3. Submit
const onSubmit = (data: AccountFormValues) => {
  createMutation.mutate(data, {
    /* callbacks */
  });
};
```

**Error Display:**

- **Field-level errors:** Automatic with react-hook-form `<FormMessage />`
- **API errors without `propertyName`:** Use `<ErrorAlert error={apiError} />`
- **API errors with `propertyName`:** Filter and display below specific input

#### Error Handling (Centralized)

**Automatic Toast (default):**

- Configured in `main.tsx` (QueryCache/MutationCache)
- ALL TanStack Query errors show toast automatically

**General Rule: DO NOT handle toast manually**

**✅ Exceptions Allowed (clear criteria):**

Manual toast ONLY if:

1. Custom timing needed (e.g., multi-step with delays)
2. Different message than default error (additional context)
3. Specific UI/UX that conflicts with automatic toast

**ErrorBoundary:**

- Catches React crashes
- Automatic fallback UI
- Logs to `errorLogger`

#### Routing (React Router v7)

**Route Constants:**

```typescript
export const ROUTES = { HOME: "/", ACCOUNTS: "/accounts" } as const;
```

**Navigation:**

```typescript
// ✅ ALWAYS use <Link>
<Link to={ROUTES.ACCOUNTS}>Go to Accounts</Link>

// ❌ NEVER button + navigate for links
<button onClick={() => navigate('/accounts')}>Bad</button>
```

**Active State:**

- Use `NavLink` with `isActive` for sidebar/nav
- Apply active styles via className callback

#### State Management

- **Server State:** TanStack Query (PRIMARY)
- **Client State Global:** Zustand (OPTIONAL - may be removed)
- **Local State:** `useState`, `useReducer` (temporary UI)

#### Testing Requirements for Framework Exceptions

**Minimum Coverage:** 60% for MVP

**For features with exceptions (direct services, manual toast):**

- **MUST** have integration test covering that path
- Mock services: `vi.mock('@/api/services/...')`
- Mock toast: `vi.mock('sonner', () => ({ toast: { success: vi.fn() } }))`

---

### Testing Rules

#### Test Setup

**Test Runner:** Vitest 4.0.15

- Environment: `node` (pure functions, no DOM)
- Coverage: `vitest --coverage`
- UI: `vitest --ui`

**Testing Library:**

- Component testing utilities
- `renderHook()`, `waitFor()`, `screen`

#### Test Organization

**File Naming:**

```
src/utils/formatters.ts
src/utils/formatters.test.ts  ← Test next to source file
```

**Test Structure Pattern:**

```typescript
import { describe, it, expect } from "vitest";

describe("functionName", () => {
  it("describes specific behavior", () => {
    expect(result).toBe(expected);
  });
});
```

#### Mock Patterns

**Service Mocking:**

```typescript
vi.mock("@/api/services/accounts/accountService", () => ({
  accountService: {
    getAll: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mocked(accountService.getAll).mockResolvedValue([mockAccount]);
```

**Hook Testing:**

```typescript
import { renderHook, waitFor } from "@testing-library/react";

const { result } = renderHook(() => useAccounts());
await waitFor(() => expect(result.current.isSuccess).toBe(true));
```

**Mutation Testing:**

```typescript
const { result } = renderHook(() => useCreateAccount());
await result.current.mutateAsync(mockData);
expect(mockService.create).toHaveBeenCalledWith(mockData);
```

**Toast Mocking (if manual toasts):**

```typescript
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
```

#### Coverage Requirements

**Minimum for MVP:** 60%

**Priorities:**

- Utils/helpers: 80%+ (pure functions, easy to test)
- Services: 70%+ (critical business logic)
- Hooks: 60%+ (data fetching patterns)
- Components: 50%+ (UI less critical for MVP)

**MUST test:**

- Features with exceptions (direct services, manual toasts)
- Critical business logic (calculations, validations)
- Edge cases (errors, empty states)

**SKIP in MVP:**

- Purely presentational components
- Simple UI without logic
- Mock data and types

#### Integration Tests

**When to write:**

- Feature uses service directly (exception to hook rule)
- Complex multi-step flow (e.g., transfer with multiple mutations)
- Critical user paths (create account, transaction, transfer)

#### Best Practices

**✅ DO:**

- Test behavior, not implementation
- Use descriptive test names
- Mock external dependencies (API, services)
- Test error cases and edge cases
- Keep tests simple and focused

**❌ DON'T:**

- Test implementation details
- Test third-party libraries
- Over-mock (only what's necessary)
- Write tests just for coverage % (must have value)

#### Running Tests

```bash
npm test                 # Run all tests
npm run test:ui          # Visual test UI
npm run test:coverage    # Coverage report
```

---

### Code Quality & Style Rules

#### Core Principles

**KISS (Keep It Simple, Stupid):**

- Simplest solution that works is the best solution
- Avoid over-engineering for "future flexibility"
- Refactor when needed, not in anticipation
- Personal app, not enterprise system - pragmatism over perfection

#### Linting Configuration

**ESLint 9.33.0 (Flat Config):**

- Config: `eslint.config.js`
- Plugins: typescript-eslint, react-hooks, react-refresh
- Run: `npm run lint`

#### Naming Conventions

| Element             | Convention       | Example                         |
| ------------------- | ---------------- | ------------------------------- |
| Components          | PascalCase       | `AccountCard.tsx`               |
| Hooks               | camelCase        | `useAccounts.ts`                |
| Types/Interfaces    | PascalCase       | `ApiError`, `AccountFormValues` |
| Functions/Variables | camelCase        | `formatCurrency()`, `isLoading` |
| Constants           | UPPER_SNAKE_CASE | `MAX_ITEMS`, `ROUTES.HOME`      |
| Folders             | camelCase        | `src/features/accounts/`        |
| CSS Classes         | kebab-case       | `.glass-card`                   |

#### Import Order

1. External packages (React, libraries)
2. Absolute imports with `@/` alias
3. Relative imports `./`
4. Types (can be mixed)

```typescript
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/utils/formatters";
import { Account } from "./accountTypes";
```

#### Styling Approach

**Tailwind CSS Only** (NO CSS Modules, NO styled-components)

**Utility-First:**

```typescript
<div className="px-4 md:px-6 glass-card">
```

**Custom Utilities:** Define in `@layer utilities` in `index.css`

**Use `cn()` helper** for conditional classes:

```typescript
import { cn } from '@/lib/utils';

className={cn(
  "base-classes",
  isActive && "active-classes"
)}
```

#### Comments & Documentation

**File Headers (for complex modules only):**

```typescript
/**
 * HTTP Client (spApiClient)
 *
 * Cliente HTTP basado en Axios con abstracción.
 */
```

**Function Documentation (when not obvious):**

```typescript
/**
 * Transforma AxiosError a ApiError user-friendly
 */
export function handleApiError(error: unknown): ApiError;
```

**TODO Comments:**

```typescript
// TODO (Fase futura - Auth): Agregar token JWT
```

**NO comment obvious code**

#### Code Quality Guidelines

**Function Length:**

- Keep functions <50 lines when possible
- Extract helpers for complex logic
- Components <200 lines (consider split if larger)

**DRY (Don't Repeat Yourself):**

- Extract repeated logic to utils/helpers
- Create custom hooks for reusable logic
- Use shared types and constants

**Single Responsibility:**

- Each function does ONE thing well
- Each component has ONE clear responsibility

**No Magic Numbers:**

```typescript
const MAX_VISIBLE_ITEMS = 10;
if (items.length > MAX_VISIBLE_ITEMS) {
}
```

**Early Returns:**

```typescript
if (!account) return null;
if (isLoading) return <Skeleton />;
return <AccountCard account={account} />;
```

#### Error Handling Standards

**Minimize try-catch - Use Global Error Handling:**

Already configured:

- TanStack Query handles API errors automatically
- `errorHandler` transforms errors
- `ErrorBoundary` catches React crashes
- Centralized toast notifications

**❌ Avoid try-catch when possible:**

```typescript
// ❌ Unnecessary - TanStack Query handles this
const fetchData = async () => {
  try {
    const response = await api.get("/data");
    return response;
  } catch (error) {
    console.error(error); // Already logged globally
  }
};
```

**✅ Use try-catch ONLY for:**

- Sequential `mutateAsync` chains (already global-handled)
- Specific error recovery logic (rare)
- Non-API errors that need custom handling

**✅ Let global handlers work:**

```typescript
// TanStack Query + errorHandler + toast already handle errors
const { data, error } = useQuery({
  /* ... */
});
```

**Type errors properly:**

```typescript
catch (error) {
  const apiError = handleApiError(error); // Typed
}
```

#### Accessibility (Basic for MVP)

**Semantic HTML:**

- Use `<nav>`, `<main>`, `<article>`, `<button>`, `<a>`
- NOT generic `<div>` for interactive elements

**Button vs Link:**

- `<button>` for actions (submit, modal, toggle)
- `<Link>` for navigation (route change)

**Alt text for images:**

```typescript
<img src={icon} alt={`${account.name} icon`} />
```

---

### Critical Don't-Miss Rules

#### Anti-Patterns to Avoid

**1. Tailwind v4 Incompatibilities**

**❌ NEVER:**

```javascript
// ❌ NO existe tailwind.config.js en v4
module.exports = {
  theme: { colors: { primary: "#1e40af" } },
};
```

**✅ ALWAYS:**

```css
/* En index.css con @theme */
@theme {
  --color-sp-blue-600: oklch(0.424 0.181 266);
}
```

**Gotchas:**

- Tailwind v4 usa `@import "tailwindcss"` NO `@tailwind` directives
- Colores custom en formato `oklch`, NO hex
- `@tailwindcss/vite` plugin, NO PostCSS config
- Variables CSS con `--color-*`, NO `theme()` en JS

**2. React 19 Breaking Changes**

**⚠️ Hook Behavior Changes:**

- `useEffect` cleanup timing changed
- `useRef` initialization stricter
- Server Components support (not used in this app)

**3. TanStack Query v5 Gotchas**

**❌ Common Mistakes:**

**Not invalidating queries after mutations:**

```typescript
// ❌ Mutation sin invalidation = stale data
useMutation({
  mutationFn: accountService.create,
  // Falta onSuccess con invalidateQueries
});
```

**Using wrong query key:**

```typescript
// ❌ Inconsistente
useQuery({ queryKey: ["account"] }); // Singular
queryClient.invalidateQueries({ queryKey: ["accounts"] }); // Plural - NO MATCH
```

**✅ Use query key factory:**

```typescript
export const accountKeys = {
  all: ["accounts"] as const,
  detail: (id: number) => ["accounts", id] as const,
};
```

**Over-fetching sin staleTime:**

- Already configured in QueryClient: `staleTime: 5 * 60 * 1000` (5 min)

**4. TypeScript Strict Mode Gotchas**

**❌ Unused variables break build:**

```typescript
// ❌ Error: 'unused' is declared but never used
const unused = "test";
```

**✅ Prefix with `_` or remove:**

```typescript
const _unused = "test"; // Or delete it
```

**❌ Non-null assertions sin validación:**

```typescript
// ❌ Peligroso - puede ser undefined
const account = accounts.find((a) => a.id === id)!;
account.name; // Runtime error si no existe
```

**✅ Use optional chaining:**

```typescript
const account = accounts.find((a) => a.id === id);
return account?.name; // undefined si no existe
```

**5. React Router v7 Pitfalls**

**❌ Don't:**

```typescript
// ❌ String hardcoded - typo prone
<Link to="/acounts">Accounts</Link> // Typo!

// ❌ Button for navigation
<button onClick={() => navigate('/accounts')}>
```

**✅ Do:**

```typescript
import { ROUTES } from '@/router/routes';
<Link to={ROUTES.ACCOUNTS}>Accounts</Link>
```

**6. Form Validation Edge Cases**

**❌ Client-side validation alone:**

- Backend puede retornar error diferente
- Handle both Zod + API errors con `propertyName`

**❌ Coerce numbers sin validación:**

```typescript
// ❌ z.coerce.number() acepta strings vacíos → 0
balance: z.coerce.number();
```

**✅ Validate:**

```typescript
balance: z.coerce.number().min(0, "Balance must be positive");
```

#### Edge Cases to Handle

**1. Empty States**

Always handle:

- Empty arrays: `accounts.length === 0`
- Null/undefined data: `!account`
- Loading states: `isLoading`
- Error states: `error`

```typescript
if (isLoading) return <Skeleton />;
if (error) return <ErrorAlert error={error} />;
if (!accounts.length) return <EmptyState />;
return <List items={accounts} />;
```

**2. API Response Structure**

**⚠️ Backend returns RFC 7807 Problem Details:**

```typescript
// API error response structure
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Validation Error",
  "status": 400,
  "errors": [
    {
      "message": "Name is required",
      "severity": "Error",
      "propertyName": "name" // Puede ser null
    }
  ]
}
```

**Safe access:**

```typescript
// ❌ Assume errors es array
error.errors.map((e) => e.message);

// ✅ Safe
error.errors?.map((e) => e.message) ?? [];
```

**3. Proxy Configuration**

**⚠️ Development API proxy:**

```javascript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: env.VITE_API_BASE_URL || 'http://localhost:5000',
    }
  }
}
```

**Gotcha:**

- Proxy solo funciona en dev (`npm run dev`)
- Production: Configurar `VITE_API_BASE_URL` correctamente
- Backend debe estar en `localhost:5000` en dev

#### Security Considerations (MVP)

**❌ Don't:**

- Store sensitive data in localStorage without encryption
- Log API tokens/passwords to console
- Expose API keys in client code

**✅ Do:**

```typescript
// Safe logging in dev
if (import.meta.env.DEV) {
  console.log("[API] Request:", config.url); // URL only
  // NO log: headers, tokens, passwords
}
```

#### Performance Gotchas

**❌ Inline function props (causa re-renders):**

```typescript
// ❌ Nueva función en cada render
<Button onClick={() => handleClick(id)} />
```

**✅ Extract callback:**

```typescript
const handleButtonClick = () => handleClick(id);
<Button onClick={handleButtonClick} />

// Or use useCallback si necesita deps
const handleClickWithId = useCallback(() => handleClick(id), [id]);
```

**Large lists:**

- OK para <100 items en MVP
- Si >100 items, considerar pagination

**Cache configuration:**

- TanStack Query `staleTime` ya configurado (5min)
- NO deshabilitar cache sin razón

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

**Last Updated:** 2026-02-20
