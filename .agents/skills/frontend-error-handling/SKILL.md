---
name: frontend-error-handling
description: Centralized error handling for SmartPocket React app. Use when handling API errors, toast notifications, ErrorBoundary setup, try-catch patterns, RFC 7807 Problem Details, or global error management. Includes when to use manual vs automatic toasts.
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

SmartPocket usa **error handling centralizado** en 3 capas:

1. **TanStack Query global handlers** (`main.tsx`) - Toast automático para API errors
2. **ErrorBoundary** - Captura crashes de React
3. **Try-Catch local** (raro) - Solo para lógica custom de recuperación

**Filosofía:** Minimizar boilerplate. La mayoría de errores se manejan automáticamente.

---

## Toast Automático (Default)

### Setup en `main.tsx`

```typescript
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: Error) => {
      // Todos los errores de useQuery muestran toast automáticamente
      toast.error(error.message || "Failed to fetch data");
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: Error) => {
      // Todos los errores de useMutation muestran toast automáticamente
      toast.error(error.message || "Operation failed");
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1, // Reintentar 1 vez antes de fallar
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />
      {/* ... */}
    </QueryClientProvider>
  );
}
```

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
import { errorLogger } from "@/utils/errorLogger";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    // Log a servicio externo (ej: Sentry) o console en dev
    errorLogger.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">Please refresh the page</p>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

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

### ❌ Evitar try-catch cuando sea posible

TanStack Query ya maneja errores automáticamente. NO duplicar lógica:

```typescript
// ❌ MAL - try-catch innecesario
const fetchAccounts = async () => {
  try {
    const response = await api.get("/accounts");
    return response.data;
  } catch (error) {
    console.error(error); // Ya se loguea globalmente
    toast.error("Failed to fetch"); // Ya se muestra toast automáticamente
  }
};
```

```typescript
// ✅ BIEN - dejar que TanStack Query maneje
const fetchAccounts = async () => {
  const response = await api.get("/accounts");
  return response.data;
};
```

### ✅ Usar try-catch SOLO para:

#### 1. Chains de `mutateAsync` secuenciales

```typescript
const handleComplexOperation = async () => {
  try {
    const account = await createAccountMutation.mutateAsync(accountData);
    await createTransactionMutation.mutateAsync({
      accountId: account.id,
      amount: 100,
    });
    toast.success("Account created with initial transaction");
  } catch (error) {
    // Error ya logueado y mostrado, pero podemos cleanup
    console.error("Complex operation failed:", error);
  }
};
```

#### 2. Lógica de recuperación específica

```typescript
const syncData = async () => {
  try {
    await syncMutation.mutateAsync();
  } catch (error) {
    // ✅ Lógica custom de fallback
    console.warn("Sync failed, using cached data");
    return getCachedData();
  }
};
```

#### 3. Errores non-API que necesitan manejo custom

```typescript
const processFile = async (file: File) => {
  try {
    const data = await parseCSV(file);
    return data;
  } catch (error) {
    // ✅ Error de parsing, no API - manejar custom
    toast.error("Invalid CSV format");
    return null;
  }
};
```

---

## API Response Structure (RFC 7807)

Backend SmartPocket retorna **Problem Details** siguiendo RFC 7807:

### Estructura

```typescript
interface ApiError {
  type: string; // URL a documentación del error
  title: string; // Título human-readable
  status: number; // HTTP status code
  errors?: Array<{
    message: string; // Mensaje del error
    severity: "Error" | "Warning" | "Info";
    propertyName?: string | null; // Campo específico (puede ser null)
  }>;
}
```

### Ejemplo de response

```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Validation Error",
  "status": 400,
  "errors": [
    {
      "message": "Name is required",
      "severity": "Error",
      "propertyName": "name"
    },
    {
      "message": "Balance must be positive",
      "severity": "Error",
      "propertyName": "balance"
    },
    {
      "message": "Account limit reached",
      "severity": "Warning",
      "propertyName": null
    }
  ]
}
```

### Safe Access Patterns

**❌ MAL - acceso directo sin safe guards:**

```typescript
const errorMessages = error.errors.map((e) => e.message); // Crash si errors es undefined
```

**✅ BIEN - optional chaining + nullish coalescing:**

```typescript
const errorMessages = error.errors?.map((e) => e.message) ?? [];
const firstError = error.errors?.[0]?.message ?? "Unknown error";
const hasFieldErrors = error.errors?.some((e) => e.propertyName) ?? false;
```

### Filtrar errores por tipo

```typescript
// Errores globales (sin propertyName)
const globalErrors = error.errors?.filter((e) => !e.propertyName) ?? [];

// Errores por campo específico
const nameErrors = error.errors?.filter((e) => e.propertyName === "name") ?? [];

// Solo errores críticos (no warnings)
const criticalErrors = error.errors?.filter((e) => e.severity === "Error") ?? [];
```

---

## Display Patterns

### Errores globales - `<ErrorAlert>`

```typescript
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorAlertProps {
  error: ApiError;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  const globalErrors = error.errors?.filter((e) => !e.propertyName) ?? [];

  if (globalErrors.length === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertTitle>{error.title}</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-4">
          {globalErrors.map((err, i) => (
            <li key={i}>{err.message}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
```

### Errores por campo - React Hook Form

```typescript
const onSubmit = (data: FormValues) => {
  createMutation.mutate(data, {
    onError: (error: ApiError) => {
      // Errores con propertyName → mostrar debajo del input
      error.errors?.forEach((err) => {
        if (err.propertyName) {
          form.setError(err.propertyName as keyof FormValues, {
            type: "server",
            message: err.message,
          });
        }
      });

      // Errores sin propertyName → mostrar globales
      const globalErrors = error.errors?.filter((e) => !e.propertyName) ?? [];
      if (globalErrors.length > 0) {
        setApiError({ ...error, errors: globalErrors });
      }
    },
  });
};
```

---

## Axios Interceptor (spApiClient)

El error handling centralizado se configura en `spApiClient`:

```typescript
// src/api/spApiClient.ts
import axios from "axios";

export const spApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

// Response interceptor - transforma errors a formato consistente
spApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      // Backend retornó RFC 7807 - usar tal cual
      return Promise.reject(error.response.data);
    }

    // Network error o timeout - crear error genérico
    return Promise.reject({
      type: "network-error",
      title: "Network Error",
      status: 0,
      errors: [
        {
          message: error.message || "Failed to connect to server",
          severity: "Error",
          propertyName: null,
        },
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

---

## Troubleshooting

| Problema                       | Causa                                    | Solución                                         |
| ------------------------------ | ---------------------------------------- | ------------------------------------------------ |
| Toast no aparece en error      | QueryCache/MutationCache mal configurado | Verificar setup en `main.tsx`                    |
| Toast duplicado                | Manual + automático                      | Remover `toast.error()` en `onError`             |
| ErrorBoundary no captura error | Error en async code                      | Envolver async en try-catch y usar error state   |
| `.message` es undefined        | Acceso directo sin safe guard            | Usar `error?.message \|\| "Default"`             |
| Errores de API no legibles     | Axios no parsea RFC 7807                 | Verificar interceptor en `spApiClient`           |
| Form no muestra field errors   | `setError()` no llamado                  | Verificar `onError` callback con loop de errores |

---

## References

- [RFC 7807 - Problem Details](https://tools.ietf.org/html/rfc7807)
- [TanStack Query Error Handling](https://tanstack.com/query/latest/docs/react/guides/query-functions#handling-and-throwing-errors)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- SmartPocket: [spApiClient.ts](webapp/src/api/spApiClient.ts)
- SmartPocket: [ErrorBoundary.tsx](webapp/src/components/ErrorBoundary.tsx)

---
