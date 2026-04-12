# Error Display Components

## ErrorAlert - Errores Globales

```typescript
// src/components/ErrorAlert.tsx - Ver implementación en repo
interface ErrorAlertProps {
  error: ApiError;
  className?: string;
}

// Uso
const globalErrors = error.errors?.filter((e) => !e.propertyName) ?? [];
<ErrorAlert error={{ ...error, errors: globalErrors }} />
```

## ErrorBoundary

```typescript
// src/components/ErrorBoundary.tsx - Ver implementación completa en SKILL.md

// Uso múltiple
<ErrorBoundary>                              {/* App-level */}
<ErrorBoundary fallback={<CustomError />}>  {/* Feature-level con fallback custom */}
```

## React Hook Form - Mapear Errores

```typescript
// Mapear errores RFC 7807 a campos del form
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
