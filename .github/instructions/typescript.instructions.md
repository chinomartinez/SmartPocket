---
description: "TypeScript strict mode rules: named exports, type safety, path aliases, and naming conventions for SmartPocket webapp"
applyTo: "webapp/**/*.{ts,tsx}"
---

# TypeScript Standards

TypeScript 5.8.3 strict mode conventions for SmartPocket React app.

## Exports & Imports

**PROHIBIDO: Default exports**

```typescript
// ❌ NUNCA
export default Component;
export default function handler() {}
```

**OBLIGATORIO: Named exports**

```typescript
// ✅ SIEMPRE
export function Component() {}
export const constant = {};
export type TypeName = {};
export interface InterfaceName {}
```

### Import Order

1. External packages (React, libraries)
2. Absolute imports with `@/` alias
3. Relative imports `./`

```typescript
// ✅ Orden correcto
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { accountService } from "@/api/services/accounts/accountService";
import { formatCurrency } from "./helpers";
```

### Path Aliases

| Context               | Alias | Ejemplo                                           |
| --------------------- | ----- | ------------------------------------------------- |
| Cross-feature imports | `@/`  | `import { Button } from '@/components/ui/button'` |
| Intra-module imports  | `./`  | `import { helper } from './helpers'`              |

## Type Safety

**PROHIBIDO: `any` type**

```typescript
// ❌ NUNCA
function process(data: any) {}
const result: any = fetch();
```

**MINIMIZAR: `unknown` (solo cuando sea absolutamente necesario)**

```typescript
// ⚠️ Solo si no hay alternativa
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

**PREFERIR: Union types, generics, type guards**

```typescript
// ✅ Union types
type Status = "pending" | "completed" | "failed";

// ✅ Generics
function process<T>(data: T): T {
  return data;
}

// ✅ Type guards
function isError(error: Error | ApiError): error is ApiError {
  return "code" in error;
}
```

### Null Safety

**❌ EVITAR: Non-null assertions sin validación**

```typescript
const account = accounts.find((a) => a.id === id)!;
account.name; // Runtime error si no existe
```

**✅ USAR: Optional chaining**

```typescript
const account = accounts.find((a) => a.id === id);
return account?.name; // undefined si no existe

// O early return
if (!account) return null;
return account.name;
```

## Naming Conventions

| Elemento         | Convención       | Ejemplo                    |
| ---------------- | ---------------- | -------------------------- |
| Components       | PascalCase       | `AccountCard.tsx`          |
| Hooks            | camelCase        | `useAccounts.ts`           |
| Types/Interfaces | PascalCase       | `ApiError`, `Account`      |
| Functions        | camelCase        | `formatCurrency()`         |
| Variables        | camelCase        | `accountBalance`           |
| Constants        | UPPER_SNAKE_CASE | `MAX_ITEMS`, `API_TIMEOUT` |
| Files            | camelCase        | `accountService.ts`        |
| Folders          | camelCase        | `src/features/accounts/`   |

**PROHIBIDO: Enums (usar union types)**

```typescript
// ❌ EVITAR
enum Status {
  Pending,
  Completed,
}

// ✅ PREFERIR
type Status = "pending" | "completed";
```

## Type Inference

**Zod schemas**

```typescript
import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1),
  balance: z.coerce.number(),
});

// ✅ Inferir tipo del schema
export type AccountFormValues = z.infer<typeof accountSchema>;
```

**Const assertions**

```typescript
// ✅ Para objetos inmutables
export const ROUTES = {
  HOME: "/",
  ACCOUNTS: "/accounts",
} as const;

// ✅ Para arrays readonly
export const STATUSES = ["pending", "completed"] as const;
type Status = (typeof STATUSES)[number]; // 'pending' | 'completed'
```

## Validation

- Build: `npm run build` (compila con `tsc --noEmit`)
- Lint: `npm run lint` (ESLint + TypeScript)
- Type check: `npx tsc --noEmit`
