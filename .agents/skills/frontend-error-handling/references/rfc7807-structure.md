# RFC 7807 Problem Details - Estructura Completa

## TypeScript Interface

```typescript
interface ApiError {
  type: string;
  title: string;
  status: number;
  errors?: Array<{
    message: string;
    severity: "Error" | "Warning" | "Info";
    propertyName?: string | null;
  }>;
}
```

## Ejemplo de Response

```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Validation Error",
  "status": 400,
  "errors": [
    { "message": "Name is required", "severity": "Error", "propertyName": "name" },
    { "message": "Balance must be positive", "severity": "Error", "propertyName": "balance" },
    { "message": "Account limit reached", "severity": "Warning", "propertyName": null }
  ]
}
```

## Filtrar Errores

```typescript
// Por campo
const nameErrors = error.errors?.filter((e) => e.propertyName === "name") ?? [];

// Por severidad
const criticalErrors = error.errors?.filter((e) => e.severity === "Error") ?? [];

// Globales vs campo
const globalErrors = error.errors?.filter((e) => !e.propertyName) ?? [];
const fieldErrors = error.errors?.filter((e) => e.propertyName) ?? [];
```

## Referencias

- [RFC 7807 Specification](https://tools.ietf.org/html/rfc7807)
