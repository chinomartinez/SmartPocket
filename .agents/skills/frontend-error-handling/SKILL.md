---
name: frontend-error-handling
description: Manejo centralizado de errores para SmartPocket React app. Usar al manejar errores de API, toast notifications, ErrorBoundary, try-catch patterns, RFC 7807 Problem Details, form field-level errors (useFormErrorHandler), ErrorAlert automático, y cuándo usar toasts manuales vs automáticos.
---

# SmartPocket - Error Handling (Centralizado)

Manejo centralizado de errores para SmartPocket React app con toast automático, ErrorBoundary, y RFC 7807 Problem Details.

---

## When to Use This Skill

- Manejar errores de API (HTTP 4xx, 5xx)
- Configurar toast notifications (Sonner)
- Setup ErrorBoundary para React crashes
- Decidir cuándo usar try-catch
- Parsear errores RFC 7807 del backend
- Logging de errores
- Mostrar errores globales vs por campo
- Debugging error flows

---

## Architecture Overview

SmartPocket usa **error handling centralizado** con múltiples componentes integrados:

- **Toast global con filtrado inteligente** (`main.tsx`) - Muestra errores automáticamente SOLO si no tienen `propertyName` (evita duplicación con errores de campo)
- **ErrorBoundary** - Captura crashes de React (errores no manejados en render/lifecycle)
- **ErrorAlert** - Componente que filtra y muestra errores globales automáticamente (sin `propertyName`)
- **Form field-level errors** - `useFormErrorHandler` hook inyecta errores de API en React Hook Form automáticamente (mapeo case-insensitive)
- **Try-Catch local** (raro) - Solo para lógica custom de recuperación

**Filosofía:** Minimizar boilerplate. La mayoría de errores se manejan automáticamente.

---

## Toast Automático (Default)

### Setup en `main.tsx`

Configurar QueryClient con `QueryCache` y `MutationCache` que llaman a `onCentralError`:

```typescript
function onCentralError(error: ApiError) {
  if (!error) return;

  // Solo mostrar toast si NO hay errores de campo específicos
  const hasFieldErrors = error.errors && error.errors.some((e) => e.propertyName);

  if (!hasFieldErrors && error.message) {
    toast.error(error.message);
  }
}
```

**Lógica de filtrado:** Si el error contiene `propertyName` en alguno de sus errores, NO muestra toast (se maneja via form field-level errors). Solo toast para errores globales.

### Comportamiento automático

**Sin configuración adicional:**

```typescript
// Query - toast automático en error
function AccountList() {
  const { data, error } = useAccounts();
  // Si API falla → toast.error("Failed to fetch data") automáticamente
  return <List items={data} />;
}

// Mutation - toast automático en error
function AccountForm() {
  const createMutation = useCreateAccount();

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data);
    // Si API falla → toast.error("Operation failed") automáticamente
  };
}
```

### ✅ Cuando usar toast manual

**Regla crítica:** NO manejar toast manualmente EXCEPTO en estos casos:

1. **Timing personalizado** (ej: multi-step con delays)
2. **Mensaje diferente al default** (contexto adicional)
3. **UI/UX custom** que conflictúa con toast automático

**Ejemplo válido de toast manual:**

```typescript
function TransferForm() {
  const createTransferMutation = useCreateTransfer();

  const handleTransfer = async (data: TransferFormValues) => {
    try {
      await createTransferMutation.mutateAsync(data);
      // ✅ Toast manual OK - mensaje custom con contexto
      toast.success(`Transfer of $${data.amount} completed successfully`);
      navigate(ROUTES.TRANSFERS);
    } catch (error) {
      // Error ya mostrado automáticamente, pero podemos agregar contexto
      toast.error("Transfer failed. Please check account balances.");
    }
  };
}
```

**❌ Toast manual innecesario:**

```typescript
// ❌ MAL - duplica toast automático
createMutation.mutate(data, {
  onError: () => {
    toast.error("Failed to create account"); // Ya se muestra automáticamente
  },
});
```

---

## ErrorBoundary

Captura crashes de React (errores no manejados en render, lifecycle, event handlers).

### Setup

```typescript
// src/components/ErrorBoundary.tsx
import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Ver [error-components.md](./references/error-components.md) para implementación completa con fallbacks y dev mode.**

### Uso en App

```typescript
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

---

## Try-Catch Patterns

### ❌ Evitar try-catch (TanStack Query maneja automáticamente)

```typescript
// ❌ MAL - try-catch innecesario
const fetchAccounts = async () => {
  try {
    const response = await api.get("/accounts");
    return response.data;
  } catch (error) {
    console.error(error); // Ya se loguea
    toast.error("Failed"); // Ya se muestra
  }
};

// ✅ BIEN - dejar que TanStack Query maneje
const fetchAccounts = async () => {
  const response = await api.get("/accounts");
  return response.data;
};
```

### ✅ Usar try-catch SOLO para:

**1. Chains de `mutateAsync` secuenciales**

```typescript
const handleComplexOp = async () => {
  try {
    const account = await createAccountMutation.mutateAsync(accountData);
    await createTransactionMutation.mutateAsync({ accountId: account.id, amount: 100 });
    toast.success("Account created with initial transaction");
  } catch (error) {
    console.error("Complex operation failed:", error);
  }
};
```

**2. Lógica de recuperación custom**

```typescript
const syncData = async () => {
  try {
    await syncMutation.mutateAsync();
  } catch {
    console.warn("Sync failed, using cached data");
    return getCachedData();
  }
};
```

**3. Errores non-API**

```typescript
const processFile = async (file: File) => {
  try {
    return await parseCSV(file);
  } catch {
    toast.error("Invalid CSV format");
    return null;
  }
};
```

---

## API Response Structure (RFC 7807)

Backend retorna **Problem Details** (RFC 7807). Ver [rfc7807-structure.md](./references/rfc7807-structure.md) para estructura completa.

### Safe Access Patterns

**Siempre usar optional chaining + nullish coalescing:**

```typescript
// ❌ MAL - crash si errors es undefined
const errorMessages = error.errors.map((e) => e.message);

// ✅ BIEN - safe access
const errorMessages = error.errors?.map((e) => e.message) ?? [];
const firstError = error.errors?.[0]?.message ?? "Unknown error";
const hasFieldErrors = error.errors?.some((e) => e.propertyName) ?? false;

// Filtrar por tipo
const globalErrors = error.errors?.filter((e) => !e.propertyName) ?? [];
const nameErrors = error.errors?.filter((e) => e.propertyName === "name") ?? [];
const criticalErrors = error.errors?.filter((e) => e.severity === "Error") ?? [];
```

---

## Display Patterns

### Errores globales - `<ErrorAlert>`

`ErrorAlert` filtra errores automáticamente, solo muestra los que NO tienen `propertyName`.

```typescript
const apiError = activeMutation.error as ApiError | null;
{apiError && <ErrorAlert error={apiError} />}
```

### Errores por campo - React Hook Form

> **Nota:** Para patterns completos de formularios, ver [frontend-forms](../frontend-forms/SKILL.md).

Usar `useFormErrorHandler` hook para inyectar errores automáticamente:

```typescript
import { useFormErrorHandler } from "@/hooks/useFormErrorHandler";

const form = useForm<FormValues>({...});
const handleFormError = useFormErrorHandler(form);
const apiError = mutation.error as ApiError | null;

mutation.mutate(data, {
  onError: handleFormError, // ← Inyecta errores en campos automáticamente
});

// En render
{apiError && <ErrorAlert error={apiError} />}
<FormField ...>
  <FormMessage /> {/* ← Muestra errores de campo */}
</FormField>
```

**Sistema de errores (3 puntos):**
1. **Field-level:** Errores con `propertyName` → `<FormMessage />`
2. **Inline:** Errores sin `propertyName` → `<ErrorAlert />`
3. **Toast:** Errores sin `propertyName` → Toast global

**Ver [error-components.md](./references/error-components.md) para implementación completa.**

---

## Axios Interceptor (spApiClient)

```typescript
// src/api/spApiClient.ts
import axios from "axios";

export const spApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

spApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      return Promise.reject(error.response.data); // RFC 7807 del backend
    }

    // Network error - normalizar a RFC 7807
    return Promise.reject({
      type: "network-error",
      title: "Network Error",
      status: 0,
      errors: [
        { message: error.message || "Failed to connect", severity: "Error", propertyName: null },
      ],
    });
  },
);
```

---

## Anti-Patterns Críticos

### ❌ Try-catch en cada query/mutation

```typescript
// ❌ MAL - duplica error handling
function AccountList() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await accountService.getAll();
        setAccounts(data);
      } catch (err) {
        setError(err); // Ya manejado por TanStack Query
        toast.error("Failed"); // Ya mostrado automáticamente
      }
    };
    fetchData();
  }, []);
}
```

### ❌ Toast manual duplicado

```typescript
// ❌ MAL - toast duplicado
createMutation.mutate(data, {
  onSuccess: () => {
    toast.success("Created!"); // ✅ OK - success toast válido
  },
  onError: () => {
    toast.error("Failed!"); // ❌ Duplica toast automático
  },
});
```

### ❌ Acceso directo sin safe guards

```typescript
// ❌ MAL - crash si errors es undefined
const message = error.errors[0].message;
```

```typescript
// ✅ BIEN - safe access
const message = error.errors?.[0]?.message ?? "Unknown error";
```

### ❌ Ignorar errors silenciosamente

```typescript
// ❌ MAL - swallow errors sin feedback
try {
  await riskyOperation();
} catch {
  // Silencio total - usuario no sabe que falló
}
```

```typescript
// ✅ BIEN - siempre dar feedback
try {
  await riskyOperation();
} catch (error) {
  toast.error("Operation failed. Please try again.");
  console.error("Detailed error:", error);
}
```

### ❌ setError() manual en loops

```typescript
// ❌ MAL - mapear errores manualmente
const onSubmit = (data: FormValues) => {
  createMutation.mutate(data, {
    onError: (error: ApiError) => {
      error.errors?.forEach((err) => {
        if (err.propertyName) {
          form.setError(err.propertyName as keyof FormValues, {
            type: "server",
            message: err.message,
          });
        }
      });
    },
  });
};
```

```typescript
// ✅ BIEN - usar useFormErrorHandler
import { useFormErrorHandler } from "@/hooks/useFormErrorHandler";

const form = useForm<FormValues>({...});
const handleFormError = useFormErrorHandler(form);

createMutation.mutate(data, {
  onError: handleFormError, // ← Una línea
});
```

### ❌ Filtrar errores manualmente para ErrorAlert

```typescript
// ❌ MAL - filtrar manualmente (ErrorAlert lo hace internamente)
const globalErrors = error.errors?.filter((e) => !e.propertyName) ?? [];

// ✅ BIEN - ErrorAlert filtra automáticamente
const apiError = activeMutation.error as ApiError | null;
{apiError && <ErrorAlert error={apiError} />}
```

### ❌ useState para apiError en forms

```typescript
// ❌ MAL - estado duplicado
const [apiError, setApiError] = useState<ApiError | null>(null);
const createMutation = useCreateAccount();

useEffect(() => {
  if (open) setApiError(null);
}, [open]);

createMutation.mutate(data, {
  onError: (error) => setApiError(error),
});
```

```typescript
// ✅ BIEN - usar activeMutation pattern
const createMutation = useCreateAccount();
const updateMutation = useUpdateAccount();
const activeMutation = mode === "create" ? createMutation : updateMutation;

const apiError = activeMutation.error as ApiError | null;

const handleOpenChange = (isOpen: boolean) => {
  if (!isOpen) {
    activeMutation.reset(); // ← Limpia error automáticamente
    form.reset();
  }
  onOpenChange(isOpen);
};
```

---

## Troubleshooting

| Problema                       | Causa                                      | Solución                                                  |
| ------------------------------ | ------------------------------------------ | --------------------------------------------------------- |
| Toast no aparece en error      | QueryCache/MutationCache mal configurado   | Verificar setup en `main.tsx`                             |
| Toast duplicado                | Manual + automático                        | Remover `toast.error()` en `onError`                      |
| Toast aparece en form errors   | Filtrado mal configurado                   | Verificar `onCentralError` filtra `hasFieldErrors`        |
| ErrorBoundary no captura error | Error en async code                        | Envolver async en try-catch y usar error state            |
| `.message` es undefined        | Acceso directo sin safe guard              | Usar `error?.message \|\| "Default"`                      |
| Errores de API no legibles     | Axios no parsea RFC 7807                   | Verificar interceptor en `spApiClient`                    |
| Form no muestra field errors   | `useFormErrorHandler` no usado             | Agregar `onError: handleFormError` en mutation            |
| ErrorAlert no muestra nada     | Solo hay errores con `propertyName`        | Esperado - ErrorAlert filtra automáticamente              |
| Field errors case-sensitive    | Backend usa PascalCase, frontend camelCase | `useFormErrorHandler` mapea case-insensitive (automático) |

---

## References

- [RFC 7807 - Problem Details](https://tools.ietf.org/html/rfc7807)
- [TanStack Query Error Handling](https://tanstack.com/query/latest/docs/react/guides/query-functions#handling-and-throwing-errors)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- SmartPocket: [spApiClient.ts](webapp/src/api/spApiClient.ts)
- SmartPocket: [ErrorBoundary.tsx](webapp/src/components/ErrorBoundary.tsx)

---
