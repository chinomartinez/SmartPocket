# Error Display Components

## ErrorAlert - Errores Globales

`ErrorAlert` filtra automáticamente errores sin `propertyName` (errores globales).

```typescript
// src/components/ErrorAlert.tsx - Ver implementación en repo
interface ErrorAlertProps {
  error: ApiError | null;
  onDismiss?: () => void;
  className?: string;
}

// Uso
const apiError = activeMutation.error as ApiError | null;
{apiError && <ErrorAlert error={apiError} />}
```

**Qué hace internamente:**
- Filtra `error.errors` para mostrar solo los que NO tienen `propertyName`
- Si no hay errores globales, retorna `null` (no renderiza nada)
- Muestra lista de errores con íconos y dismissable opcional

## ErrorBoundary

```typescript
// src/components/ErrorBoundary.tsx - Ver implementación completa en SKILL.md

// Uso múltiple
<ErrorBoundary>                              {/* App-level */}
<ErrorBoundary fallback={<CustomError />}>  {/* Feature-level con fallback custom */}
```

## React Hook Form - useFormErrorHandler

Hook que inyecta errores de API automáticamente en React Hook Form (mapeo case-insensitive).

```typescript
// src/hooks/useFormErrorHandler.ts - Ver implementación en repo
import { useFormErrorHandler } from "@/hooks/useFormErrorHandler";

// Setup
const form = useForm<AccountFormValues>({
  resolver: zodResolver(accountSchema),
  values: mode === "edit" && account ? { ...account } : DEFAULT_VALUES,
});

const handleFormError = useFormErrorHandler(form);

// Uso en mutation
createMutation.mutate(data, {
  onSuccess: () => handleOpenChange(false),
  onError: handleFormError, // ← Una línea
});
```

**Qué hace:**
- Recibe `error: ApiError` automáticamente desde TanStack Query
- Itera `error.errors` y para cada error con `propertyName`:
  - Mapea case-insensitive: `PropertyName` → `propertyName`
  - Llama `form.setError(fieldName, { type: "server", message })`
- Errores aparecen automáticamente bajo `<FormMessage />` de cada campo

**✅ Beneficios:**
- Elimina ~20 líneas de boilerplate por form
- Mapeo case-insensitive automático (backend PascalCase → frontend camelCase)
- Type-safe con `Path<T>` de React Hook Form

**❌ OBSOLETO - setError manual:**
```typescript
// Ya NO hacer esto
error.errors?.forEach((err) => {
  if (err.propertyName) {
    form.setError(err.propertyName as keyof FormValues, {
      type: "server",
      message: err.message,
    });
  }
});
```

## Toast Patterns Avanzados

```typescript
// Con acción (undo)
toast.success("Deleted", {
  action: { label: "Undo", onClick: () => restore() },
});

// Duration custom
toast.error("Critical error", { duration: 10000 });
toast.error("Connection lost", { duration: Infinity });

// Promise loading
toast.promise(mutation.mutateAsync(), {
  loading: "Syncing...",
  success: "Synced",
  error: "Failed",
});
```
