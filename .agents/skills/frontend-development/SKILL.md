---
name: frontend-development
description: React 19 + TypeScript + Tailwind v4 development patterns for SmartPocket webapp. Covers architecture, data fetching, forms, styling, and critical rules.
---

# SmartPocket - Frontend Development Skill

Reglas técnicas para desarrollo frontend con React 19 + TypeScript strict + Tailwind v4.

---

## Stack Crítico

**Runtime:**

- React 19.1.1 + TypeScript 5.8.3 (strict mode)
- Vite 7.1.2

**Styling:**

- Tailwind CSS v4 (⚠️ nueva API: `@theme`, `@import "tailwindcss"`, formato `oklch`)
- shadcn/ui + Radix UI

**Data & State:**

- TanStack Query 5.90.6 (server state - PRIMARY)
- Axios 1.13.1 (HTTP client)
- Zustand 5.0.8 (client state - OPCIONAL)

**Forms & Validation:**

- React Hook Form 7.71.1 + Zod 4.3.6

**Routing:**

- React Router 7.9.5

---

## TypeScript Rules

### Exports & Imports

**✅ ALWAYS:**

```typescript
export function Component() {}
export const constant = {};
export type TypeName = {};
```

**❌ NEVER:**

```typescript
export default Component; // PROHIBIDO - Solo named exports
```

**Import Order:**

1. External packages (React, libraries)
2. Absolute imports with `@/` alias
3. Relative imports `./`

**Path Aliases:**

- `@/` for cross-feature imports
- `./` for intra-module imports

### Type Safety

**⚠️ Minimizar uso de `unknown` - Solo cuando sea absolutamente necesario**

**❌ PROHIBIDO:**

```typescript
function process(data: any) {} // NO usar any
```

**✅ Correcto:**

```typescript
function process<T>(data: T) {}
function handle(error: Error | ApiError) {}
type Status = "pending" | "completed" | "failed"; // Union types, no enums
```

**Zod Type Inference:**

```typescript
export const schema = z.object({ name: z.string() });
export type FormValues = z.infer<typeof schema>;
```

**Constants:**

```typescript
export const ROUTES = { HOME: "/", ACCOUNTS: "/accounts" } as const;
```

---

## Component Architecture

### Feature-First Structure (Flat by Default)

```
src/features/{feature}/
  ├── ComponentName.tsx       # PascalCase
  ├── useEntity.ts            # camelCase
  ├── entityTypes.ts          # camelCase
  ├── entityService.ts        # camelCase
  └── helpers.ts              # camelCase
```

**Filosofía:** Mantener flat. Solo organizar en subcarpetas si el conteo de archivos dificulta navegación visual.

### Naming Conventions

| Elemento            | Convención       | Ejemplo                  |
| ------------------- | ---------------- | ------------------------ |
| Components          | PascalCase       | `AccountCard.tsx`        |
| Hooks               | camelCase        | `useAccounts.ts`         |
| Types/Interfaces    | PascalCase       | `ApiError`               |
| Functions/Variables | camelCase        | `formatCurrency()`       |
| Constants           | UPPER_SNAKE_CASE | `MAX_ITEMS`              |
| Folders             | camelCase        | `src/features/accounts/` |

---

## Data Fetching (TanStack Query)

### Architecture Flow

```
Component → Hook (TanStack Query) → Service → spApiClient → API
```

**Regla crítica:** Componentes llaman hooks, NUNCA services directamente.

**✅ Excepción permitida:** Componente puede llamar service directamente SOLO si:

1. Operación única sin reusabilidad (ej: export CSV único)
2. NO requiere caching (operación stateless)
3. NO se beneficia de TanStack Query (retry, refetch, etc.)
4. **DEBE** tener integration test cubriendo ese path

### Service Pattern

```typescript
export const accountService = {
  getAll: async () => {
    const response = await spApiClient.get<PagedListResponse<Account>>("/accounts");
    return response.data.data; // Extraer de ApiResponse<T>
  },

  create: async (data: AccountCreateCommand) => {
    const response = await spApiClient.post<Account>("/accounts", data);
    return response.data;
  },
};
```

### Hook Pattern

```typescript
// Query key factory (OBLIGATORIO)
export const accountKeys = {
  all: ["accounts"] as const,
  detail: (id: number) => ["accounts", id] as const,
};

// Query hook
export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.all,
    queryFn: accountService.getAll,
  });
}

// Mutation hook
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

### Cache Invalidation

```typescript
// Invalidar TODAS las queries de accounts
queryClient.invalidateQueries({ queryKey: ["accounts"] });

// Invalidar account específico
queryClient.invalidateQueries({ queryKey: ["accounts", id] });

// Matching parcial
queryClient.invalidateQueries({
  predicate: (query) => query.queryKey[0] === "accounts",
});
```

### Mutation Patterns: `mutate` vs `mutateAsync`

**Default: Usar `mutate` con callbacks**

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

**✅ Usar `mutateAsync` SOLO para flujos secuenciales complejos:**

```typescript
const handleTransfer = async () => {
  try {
    const transfer = await createTransferMutation.mutateAsync(data);
    await updateBalanceMutation.mutateAsync({ accountId: transfer.fromAccountId });
    toast.success("Transfer completed");
  } catch (error) {
    toast.error("Transfer failed");
  }
};
```

**❌ NO usar `mutateAsync` para:**

- Mutations independientes (usar `mutate` con callbacks)
- Solo para tener syntax async/await (innecesario)

---

## Form Handling (React Hook Form + Zod)

### Pattern Standard

```typescript
// 1. Schema primero
export const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  balance: z.coerce.number().min(0, "Balance must be positive"),
});
export type AccountFormValues = z.infer<typeof accountSchema>;

// 2. Form setup
const form = useForm<AccountFormValues>({
  resolver: zodResolver(accountSchema),
  defaultValues: { name: "", balance: 0 },
});

// 3. Submit handler
const onSubmit = (data: AccountFormValues) => {
  createMutation.mutate(data, {
    onSuccess: () => form.reset(),
  });
};
```

### Display de Errores

- **Errores de campo:** Automático con `<FormMessage />` de react-hook-form
- **Errores de API sin `propertyName`:** Usar `<ErrorAlert error={apiError} />`
- **Errores de API con `propertyName`:** Filtrar y mostrar debajo del input específico

---

## Error Handling (Centralizado)

### Toast Automático (Default)

- Configurado en `main.tsx` (QueryCache/MutationCache)
- TODAS las queries/mutations de TanStack Query muestran toast automáticamente en error

**Regla crítica:** NO manejar toast manualmente

**✅ Excepción permitida para toast manual SOLO si:**

1. Timing personalizado necesario (ej: multi-step con delays)
2. Mensaje diferente al error default (contexto adicional)
3. UI/UX específico que conflictúa con toast automático

### ErrorBoundary

- Captura crashes de React
- UI fallback automático
- Logs a `errorLogger`

### Try-Catch Mínimo

**❌ Evitar try-catch cuando sea posible:**

```typescript
// ❌ Innecesario - TanStack Query maneja esto
const fetchData = async () => {
  try {
    const response = await api.get("/data");
    return response;
  } catch (error) {
    console.error(error); // Ya se loguea globalmente
  }
};
```

**✅ Usar try-catch SOLO para:**

- Chains de `mutateAsync` secuenciales (ya manejado globalmente)
- Lógica de recuperación de error específica (raro)
- Errores non-API que necesitan manejo custom

---

## Styling (Tailwind CSS v4)

### Nueva API (Breaking Changes)

**❌ NUNCA (v3 syntax):**

```javascript
// ❌ NO existe tailwind.config.js en v4
module.exports = { theme: { colors: { primary: "#1e40af" } } };
```

**✅ SIEMPRE (v4 syntax):**

```css
/* En index.css con @theme */
@theme {
  --color-sp-blue-600: oklch(0.424 0.181 266);
}
```

**Key Changes:**

- `@import "tailwindcss"` (NO `@tailwind` directives)
- Colores en formato `oklch`, NO hex
- `@tailwindcss/vite` plugin (NO PostCSS config)
- Variables CSS con `--color-*` (NO `theme()` en JS)

### Utility-First Approach

```typescript
<div className="px-4 md:px-6 glass-card">
```

### Conditional Classes con `cn()`

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "primary-classes"
)} />
```

---

## Routing (React Router v7)

### Route Constants

```typescript
export const ROUTES = {
  HOME: "/",
  ACCOUNTS: "/accounts",
  TRANSACTIONS: "/transactions",
} as const;
```

### Navigation

**✅ SIEMPRE usar `<Link>` para navegación:**

```typescript
import { Link } from "react-router-dom";
<Link to={ROUTES.ACCOUNTS}>Go to Accounts</Link>
```

**❌ NUNCA button + navigate para links:**

```typescript
<button onClick={() => navigate('/accounts')}>Bad</button>
```

### Active State

```typescript
import { NavLink } from "react-router-dom";

<NavLink
  to={ROUTES.ACCOUNTS}
  className={({ isActive }) =>
    cn("nav-link", isActive && "nav-link-active")
  }
>
  Accounts
</NavLink>
```

---

## Testing (Vitest)

### Test Organization

```
src/utils/formatters.ts
src/utils/formatters.test.ts  ← Test junto al archivo fuente
```

### Mock Patterns

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

**Toast Mocking (si manual):**

```typescript
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
```

### Coverage Requirements

**Mínimo MVP:** 60%

**Prioridades:**

- Utils/helpers: 80%+ (funciones puras)
- Services: 70%+ (lógica crítica)
- Hooks: 60%+ (data fetching)
- Components: 50%+ (UI menos crítico en MVP)

---

## Code Quality Principles

### KISS (Keep It Simple, Stupid)

- Solución más simple que funciona es la mejor
- Evitar over-engineering para "flexibilidad futura"
- Refactorizar cuando se necesita, no en anticipación
- App personal, no sistema enterprise - pragmatismo sobre perfección

### Early Returns

```typescript
if (!account) return null;
if (isLoading) return <Skeleton />;
if (error) return <ErrorAlert error={error} />;
return <AccountCard account={account} />;
```

### No Magic Numbers

```typescript
const MAX_VISIBLE_ITEMS = 10;
if (items.length > MAX_VISIBLE_ITEMS) {
  // ...
}
```

---

## Anti-Patterns Críticos

### 1. TanStack Query Mistakes

**❌ Mutation sin invalidation:**

```typescript
useMutation({
  mutationFn: accountService.create,
  // Falta onSuccess con invalidateQueries = datos stale
});
```

**❌ Query keys inconsistentes:**

```typescript
useQuery({ queryKey: ["account"] }); // Singular
queryClient.invalidateQueries({ queryKey: ["accounts"] }); // Plural - NO MATCH
```

**✅ Usar query key factory:**

```typescript
export const accountKeys = {
  all: ["accounts"] as const,
  detail: (id: number) => ["accounts", id] as const,
};
```

### 2. TypeScript Strict Mode Gotchas

**❌ Non-null assertions sin validación:**

```typescript
const account = accounts.find((a) => a.id === id)!;
account.name; // Runtime error si no existe
```

**✅ Optional chaining:**

```typescript
const account = accounts.find((a) => a.id === id);
return account?.name; // undefined si no existe
```

### 3. Performance Issues

**❌ Inline function props (re-renders):**

```typescript
<Button onClick={() => handleClick(id)} />
```

**✅ Extract callback:**

```typescript
const handleButtonClick = () => handleClick(id);
<Button onClick={handleButtonClick} />
```

**Cache configuration:**

- TanStack Query `staleTime` ya configurado (5min)
- NO deshabilitar cache sin razón

### 4. Form Validation Edge Cases

**❌ Coerce sin validación:**

```typescript
balance: z.coerce.number(); // Acepta strings vacíos → 0
```

**✅ Validar:**

```typescript
balance: z.coerce.number().min(0, "Balance must be positive");
```

---

## Edge Cases a Manejar

### Empty States

Siempre manejar:

- Arrays vacíos: `accounts.length === 0`
- Null/undefined data: `!account`
- Loading states: `isLoading`
- Error states: `error`

```typescript
if (isLoading) return <Skeleton />;
if (error) return <ErrorAlert error={error} />;
if (!accounts.length) return <EmptyState />;
return <List items={accounts} />;
```

### API Response Structure (RFC 7807)

Backend retorna Problem Details:

```typescript
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
error.errors?.map((e) => e.message) ?? [];
```

---

## State Management

- **Server State:** TanStack Query (PRIMARY)
- **Client State Global:** Zustand (OPCIONAL - puede ser removido)
- **Local State:** `useState`, `useReducer` (UI temporal)

---

## Security Considerations (MVP)

**❌ NO hacer:**

- Guardar datos sensibles en localStorage sin encriptación
- Loguear API tokens/passwords en consola
- Exponer API keys en código cliente

**✅ Hacer:**

```typescript
// Logging seguro en dev
if (import.meta.env.DEV) {
  console.log("[API] Request:", config.url); // Solo URL
  // NO loguear: headers, tokens, passwords
}
```

**Validación y Sanitización:**

- Backend valida SIEMPRE (fuente de verdad)
- Frontend usa Zod para validación optimista
- Nunca confiar en input del usuario sin validar

---

## Accessibility (Básico MVP)

**Semantic HTML:**

- Usar `<nav>`, `<main>`, `<article>`, `<button>`, `<a>`
- NO `<div>` genérico para elementos interactivos

**Button vs Link:**

- `<button>` para acciones (submit, modal, toggle)
- `<Link>` para navegación (cambio de ruta)

**Alt text:**

```typescript
<img src={icon} alt={`${account.name} icon`} />
```

---
