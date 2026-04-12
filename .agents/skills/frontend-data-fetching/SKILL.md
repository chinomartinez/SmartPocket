---
name: frontend-data-fetching
description: Patrones de TanStack Query para SmartPocket React app. Usar al implementar llamadas API, data fetching, mutations, invalidación de caché, server state, query hooks, o trabajar con useQuery/useMutation. Incluye patterns de service layer, query key factories, y anti-patterns comunes.
---

# SmartPocket - Data Fetching (TanStack Query)

Patrones de data fetching con TanStack Query 5.90.6 para SmartPocket React app.

---

## When to Use This Skill

- Implementar llamadas API (GET, POST, PUT, DELETE)
- Crear query hooks (`useQuery`)
- Crear mutation hooks (`useMutation`)
- Cache invalidation después de mutations
- Configurar query keys
- Crear services (API layer)
- Optimistic updates
- Server state management
- Troubleshooting stale data o cache issues

---

## Architecture Flow

```
Component → Hook (TanStack Query) → Service → spApiClient → API
```

**Regla crítica:** Componentes llaman hooks, NUNCA services directamente.

**✅ Excepción permitida:** Componente puede llamar service directamente SOLO si:

1. Operación única sin reusabilidad (ej: export CSV único)
2. NO requiere caching (operación stateless)
3. NO se beneficia de TanStack Query (retry, refetch, etc.)
4. **DEBE** tener integration test cubriendo ese path

---

## Service Pattern

Services son funciones puras que wrappean `spApiClient` (Axios instance). Viven en `src/api/services/{entity}/{entity}Service.ts`.

```typescript
import { spApiClient } from "@/api/spApiClient";
import type { Account, AccountCreateCommand, PagedListResponse } from "./types";

export const accountService = {
  getAll: async () => {
    const response = await spApiClient.get<PagedListResponse<Account>>("/accounts");
    return response.data.data; // Extraer de ApiResponse<T>
  },

  getById: async (id: number) => {
    const response = await spApiClient.get<Account>(`/accounts/${id}`);
    return response.data;
  },

  create: async (data: AccountCreateCommand) => {
    const response = await spApiClient.post<Account>("/accounts", data);
    return response.data;
  },

  update: async (id: number, data: AccountUpdateCommand) => {
    const response = await spApiClient.put<Account>(`/accounts/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await spApiClient.delete(`/accounts/${id}`);
  },
};
```

**Key points:**

- NO manejar errores aquí (manejados globalmente por TanStack Query)
- Extraer `.data` del response (destructurar wrapper de API)
- Tipar response con genéricos: `spApiClient.get<T>`
- Async/await syntax

---

## Query Key Factory (OBLIGATORIO)

Query keys deben ser consistentes. Usar factory pattern:

```typescript
// src/api/services/accounts/accountKeys.ts
export const accountKeys = {
  all: ["accounts"] as const,
  lists: () => [...accountKeys.all, "list"] as const,
  list: (filters: AccountFilters) => [...accountKeys.lists(), filters] as const,
  details: () => [...accountKeys.all, "detail"] as const,
  detail: (id: number) => [...accountKeys.details(), id] as const,
};
```

**Uso:**

```typescript
// Query
queryKey: accountKeys.all; // ["accounts"]
queryKey: accountKeys.detail(5); // ["accounts", "detail", 5]

// Invalidation
invalidateQueries({ queryKey: accountKeys.all }); // Invalida TODO
invalidateQueries({ queryKey: accountKeys.detail(5) }); // Invalida solo id=5
```

---

## Query Hook Pattern

Hooks encapsulan `useQuery` y exponen data/loading/error states. Viven en `src/features/{feature}/use{Entity}.ts`.

```typescript
import { useQuery } from "@tanstack/react-query";
import { accountService } from "@/api/services/accounts/accountService";
import { accountKeys } from "@/api/services/accounts/accountKeys";

export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.all,
    queryFn: accountService.getAll,
  });
}

export function useAccount(id: number) {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => accountService.getById(id),
    enabled: !!id, // Solo ejecutar si id existe
  });
}
```

**Uso en componentes:**

```typescript
function AccountList() {
  const { data: accounts, isLoading, error } = useAccounts();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorAlert error={error} />;
  if (!accounts?.length) return <EmptyState />;

  return <List items={accounts} />;
}
```

---

## Mutation Hook Pattern

Mutations modifican data en el servidor. Siempre invalidar queries relacionadas en `onSuccess`.

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountService } from "@/api/services/accounts/accountService";
import { accountKeys } from "@/api/services/accounts/accountKeys";

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountService.create,
    onSuccess: () => {
      // Invalidar cache para refetch automático
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AccountUpdateCommand }) =>
      accountService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidar lista + detalle específico
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: accountKeys.detail(variables.id) });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}
```

---

## Cache Invalidation Strategies

### Invalidar TODO

```typescript
queryClient.invalidateQueries({ queryKey: ["accounts"] });
```

### Invalidar registro específico

```typescript
queryClient.invalidateQueries({ queryKey: ["accounts", id] });
```

### Invalidar con predicate (matching parcial)

```typescript
queryClient.invalidateQueries({
  predicate: (query) => query.queryKey[0] === "accounts",
});
```

### Invalidar múltiples entidades (cascade)

```typescript
// Ejemplo: al crear transaction, invalidar accounts + categories
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["transactions"] });
  queryClient.invalidateQueries({ queryKey: ["accounts"] }); // Balance cambió
  queryClient.invalidateQueries({ queryKey: ["categories"] }); // Stats cambió
};
```

---

## Mutation Patterns: `mutate` vs `mutateAsync`

### Default: Usar `mutate` con callbacks

Para la mayoría de casos (single mutation, UI simple):

```typescript
function AccountForm() {
  const createMutation = useCreateAccount();

  const onSubmit = (data: AccountFormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false); // Cerrar modal
        form.reset();
      },
      onError: (error: ApiError) => {
        setApiError(error); // Mostrar error en form
      },
    });
  };

  return (
    <Form onSubmit={onSubmit}>
      {/* ... */}
      {createMutation.isPending && <Spinner />}
    </Form>
  );
}
```

### Usar `mutateAsync` SOLO para flujos secuenciales complejos

Cuando necesitas encadenar mutations o ejecutar lógica después:

```typescript
function TransferForm() {
  const createTransferMutation = useCreateTransfer();
  const updateBalanceMutation = useUpdateBalance();

  const handleTransfer = async (data: TransferFormValues) => {
    try {
      const transfer = await createTransferMutation.mutateAsync(data);
      await updateBalanceMutation.mutateAsync({
        accountId: transfer.fromAccountId,
      });
      await updateBalanceMutation.mutateAsync({
        accountId: transfer.toAccountId,
      });
      toast.success("Transfer completed");
      navigate(ROUTES.TRANSFERS);
    } catch (error) {
      // Error ya manejado globalmente, pero podemos agregar lógica custom
      console.error("Transfer failed:", error);
    }
  };

  return <Form onSubmit={handleTransfer}>{/* ... */}</Form>;
}
```

**❌ NO usar `mutateAsync` para:**

- Mutations independientes (usar `mutate` con callbacks)
- Solo para tener syntax async/await (innecesario y menos idiomático)
- Cuando no necesitas esperar resultado para ejecutar siguiente step

---

## State Management Philosophy

SmartPocket usa un hybrid state approach:

- **Server State:** TanStack Query (este skill) — **PRIMARY**
- **Local State:** `useState`, `useReducer` — UI temporal (modal open, form values)
- **Global Client State:** Zustand — OPCIONAL, considerar remover en MVP

**Regla:** Si data viene del servidor, usar TanStack Query. NO duplicar en Zustand.

---

## Anti-Patterns Críticos

### ❌ Mutation sin invalidation

```typescript
// ❌ MAL - datos quedan stale después de create
useMutation({
  mutationFn: accountService.create,
  // Falta onSuccess con invalidateQueries
});
```

```typescript
// ✅ BIEN
useMutation({
  mutationFn: accountService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: accountKeys.all });
  },
});
```

### ❌ Query keys inconsistentes

```typescript
// ❌ MAL - singular/plural mismatch
useQuery({ queryKey: ["account"] });
queryClient.invalidateQueries({ queryKey: ["accounts"] }); // NO MATCH!
```

```typescript
// ✅ BIEN - usar query key factory
useQuery({ queryKey: accountKeys.all });
queryClient.invalidateQueries({ queryKey: accountKeys.all });
```

### ❌ Query keys hardcoded sin factory

```typescript
// ❌ MAL - duplicación, typos, refactoring difícil
useQuery({ queryKey: ["accounts"] });
useQuery({ queryKey: ["accounts", "list"] });
invalidateQueries({ queryKey: ["acounts"] }); // Typo!
```

```typescript
// ✅ BIEN - centralizado, type-safe
useQuery({ queryKey: accountKeys.all });
useQuery({ queryKey: accountKeys.lists() });
invalidateQueries({ queryKey: accountKeys.all });
```

### ❌ Llamar service directamente desde componente

```typescript
// ❌ MAL - bypassing cache, duplicating requests
function AccountList() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    accountService.getAll().then(setAccounts);
  }, []);
}
```

```typescript
// ✅ BIEN - usar hook con cache
function AccountList() {
  const { data: accounts } = useAccounts();
}
```

### ❌ Deshabilitar cache sin razón

```typescript
// ❌ MAL - perder beneficios de cache
useQuery({
  queryKey: accountKeys.all,
  queryFn: accountService.getAll,
  staleTime: 0, // Refetch en CADA render
  cacheTime: 0, // No cachear nunca
});
```

```typescript
// ✅ BIEN - usar defaults configurados globalmente
useQuery({
  queryKey: accountKeys.all,
  queryFn: accountService.getAll,
  // staleTime: 5min (configurado en main.tsx)
});
```

### ❌ Usar `mutateAsync` innecesariamente

```typescript
// ❌ MAL - async/await sin necesidad
const onSubmit = async (data: FormData) => {
  try {
    await createMutation.mutateAsync(data);
    onOpenChange(false);
  } catch (error) {
    // Error handling duplicado (ya manejado globalmente)
  }
};
```

```typescript
// ✅ BIEN - usar mutate con callbacks
const onSubmit = (data: FormData) => {
  createMutation.mutate(data, {
    onSuccess: () => onOpenChange(false),
  });
};
```

---

## Troubleshooting

| Problema                              | Causa                                 | Solución                              |
| ------------------------------------- | ------------------------------------- | ------------------------------------- |
| Data no actualiza después de mutation | Falta `invalidateQueries`             | Agregar `onSuccess` con invalidation  |
| Multiple requests innecesarios        | Query keys diferentes para mismo data | Usar query key factory consistente    |
| "Cannot read property of undefined"   | Acceso directo sin optional chaining  | Usar `data?.property` o early return  |
| Infinite loop de requests             | Dependency array mal configurada      | Revisar `enabled` option o `queryKey` |
| Stale data en diferentes componentes  | Cache fragmentado                     | Consolidar query keys con factory     |

---

## References

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Query Keys Guide](https://tkdodo.eu/blog/effective-react-query-keys)
- SmartPocket: [spApiClient.ts](webapp/src/api/spApiClient.ts)
- SmartPocket: [Example service](webapp/src/api/services/accounts/accountService.ts)

---
