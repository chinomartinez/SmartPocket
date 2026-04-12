---
name: frontend-forms
description: Patrones de React Hook Form + Zod validation para forms de SmartPocket. Usar al construir formularios, validación de schemas, manejar form submissions, mostrar errores de validación, input fields, o trabajar con react-hook-form. Incluye patterns de error display y gotchas de coercion.
---

# SmartPocket - Forms (React Hook Form + Zod)

Patrones de formularios con React Hook Form 7.71.1 + Zod 4.3.6 para SmartPocket React app.

---

## When to Use This Skill

- Crear formularios (create, edit, search)
- Validar inputs con schemas
- Manejar form submission
- Mostrar errores de validación (client-side y API)
- Integrar formularios con mutations de TanStack Query
- Type-safe form values
- Coercion de tipos (strings → numbers, etc.)
- Dynamic form fields

---

## Standard Form Pattern

### Step 1: Definir schema Zod

Schema define estructura + validación. SIEMPRE crear schema antes del componente.

```typescript
// src/features/accounts/accountSchema.ts
import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  balance: z.coerce.number().min(0, "Balance must be positive"),
  currencyId: z.coerce.number().int().positive("Currency is required"),
  iconId: z.coerce.number().int().positive().optional(),
  colorHex: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
    .optional(),
});

// Inferir tipo del schema (type-safe!)
export type AccountFormValues = z.infer<typeof accountSchema>;
```

**Key features:**

- `z.coerce.number()` - Convierte string → number (útil para inputs HTML)
- `.optional()` - Campo no requerido
- `.min()`, `.max()`, `.regex()` - Validaciones built-in
- Custom messages para UX

### Step 2: Setup form con `useForm`

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema, type AccountFormValues } from "./accountSchema";

function AccountForm() {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema), // Integrar Zod
    defaultValues: {
      name: "",
      balance: 0,
      currencyId: 1,
      iconId: undefined,
      colorHex: undefined,
    },
  });

  // ...
}
```

**Options importantes:**

- `resolver: zodResolver(schema)` - Valida con Zod antes de submit
- `defaultValues` - Inicializar campos (REQUERIDO para controlled inputs)
- `mode: "onChange"` - Validar en tiempo real (opcional, por defecto `onSubmit`)

### Step 3: Submit handler con mutation

```typescript
import { useCreateAccount } from "./useAccounts";

function AccountForm({ onClose }: { onClose: () => void }) {
  const form = useForm<AccountFormValues>({
    /* ... */
  });
  const createMutation = useCreateAccount();

  const onSubmit = (data: AccountFormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        form.reset(); // Limpiar form
        onClose(); // Cerrar modal/dialog
      },
      onError: (error: ApiError) => {
        // Mostrar errores de API (ver Display de Errores)
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* ... */}
    </form>
  );
}
```

### Step 4: Render inputs con shadcn Form components

```typescript
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

function AccountForm() {
  // ...

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Savings Account" {...field} />
              </FormControl>
              <FormMessage /> {/* Muestra errores automáticamente */}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Balance</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Creating..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}
```

---

## Display de Errores

### Errores de validación (Zod) - Automático

`<FormMessage />` muestra errores de schema automáticamente:

```typescript
<FormField name="name" /* ... */>
  <FormControl>
    <Input {...field} />
  </FormControl>
  <FormMessage /> {/* "Name is required" si falla validación */}
</FormField>
```

### Errores de API - Manual

Backend retorna RFC 7807 Problem Details con array de errores:

```typescript
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Validation Error",
  "status": 400,
  "errors": [
    {
      "message": "Account name already exists",
      "severity": "Error",
      "propertyName": "name" // Puede ser null
    }
  ]
}
```

**Estrategia de display:**

#### Opción A: Errores globales (sin `propertyName`)

Usar `<ErrorAlert>` component arriba del form:

```typescript
import { ErrorAlert } from "@/components/ErrorAlert";

function AccountForm() {
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const createMutation = useCreateAccount();

  const onSubmit = (data: AccountFormValues) => {
    setApiError(null); // Limpiar errores previos

    createMutation.mutate(data, {
      onSuccess: () => {
        /* ... */
      },
      onError: (error: ApiError) => {
        setApiError(error); // Guardar para display
      },
    });
  };

  return (
    <Form {...form}>
      {apiError && <ErrorAlert error={apiError} />}
      <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>
    </Form>
  );
}
```

#### Opción B: Errores por campo (con `propertyName`)

Usar `form.setError()` para mostrar debajo del input específico:

```typescript
const onSubmit = (data: AccountFormValues) => {
  createMutation.mutate(data, {
    onError: (error: ApiError) => {
      // Filtrar errores que tienen propertyName
      const fieldErrors = error.errors?.filter((e) => e.propertyName) ?? [];

      fieldErrors.forEach((err) => {
        if (err.propertyName === "name") {
          form.setError("name", {
            type: "server",
            message: err.message,
          });
        }
        // Repetir para otros campos...
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

## Common Form Patterns

### Edit form (pre-populate data)

```typescript
function EditAccountForm({ accountId }: { accountId: number }) {
  const { data: account } = useAccount(accountId);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    values: account, // Auto-populate cuando data llega
  });

  // NOTA: Usar `values` (no `defaultValues`) para reactive updates
}
```

### Dynamic fields (array)

```typescript
const transactionSchema = z.object({
  items: z
    .array(
      z.object({
        description: z.string().min(1),
        amount: z.coerce.number().positive(),
      })
    )
    .min(1, "At least one item required"),
});

function TransactionForm() {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <>
      {fields.map((field, index) => (
        <div key={field.id}>
          <FormField name={`items.${index}.description`} /* ... */ />
          <FormField name={`items.${index}.amount`} /* ... */ />
          <Button onClick={() => remove(index)}>Remove</Button>
        </div>
      ))}
      <Button onClick={() => append({ description: "", amount: 0 })}>Add Item</Button>
    </>
  );
}
```

### Conditional validation

```typescript
const accountSchema = z
  .object({
    type: z.enum(["savings", "credit"]),
    creditLimit: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      // Si type = credit, creditLimit es requerido
      if (data.type === "credit") {
        return data.creditLimit !== undefined && data.creditLimit > 0;
      }
      return true;
    },
    {
      message: "Credit limit is required for credit accounts",
      path: ["creditLimit"], // Error aparece en este campo
    },
  );
```

### Dependent fields (watch values)

```typescript
function AccountForm() {
  const form = useForm<AccountFormValues>();
  const accountType = form.watch("type"); // Observar cambios

  return (
    <>
      <FormField name="type" /* ... */ />

      {/* Mostrar solo si type = credit */}
      {accountType === "credit" && <FormField name="creditLimit" /* ... */ />}
    </>
  );
}
```

---

## Anti-Patterns Críticos

### ❌ Coerce sin validación

```typescript
// ❌ MAL - acepta strings vacíos → 0
balance: z.coerce.number();
```

```typescript
// ✅ BIEN - validar después de coercion
balance: z.coerce.number().min(0, "Balance must be positive");
```

### ❌ Validación solo client-side

```typescript
// ❌ MAL - confiar solo en Zod (cliente puede bypassear)
const onSubmit = (data: FormValues) => {
  // Asume data es válido y seguro
  createMutation.mutate(data);
};
```

```typescript
// ✅ BIEN - backend SIEMPRE valida (source of truth)
// Frontend Zod es solo UX optimista
const onSubmit = (data: FormValues) => {
  createMutation.mutate(data, {
    onError: (error: ApiError) => {
      // Manejar errores de backend validation
    },
  });
};
```

### ❌ No limpiar form después de submit

```typescript
// ❌ MAL - valores quedan después de crear
const onSubmit = (data: FormValues) => {
  createMutation.mutate(data);
};
```

```typescript
// ✅ BIEN - reset después de success
const onSubmit = (data: FormValues) => {
  createMutation.mutate(data, {
    onSuccess: () => {
      form.reset();
    },
  });
};
```

### ❌ Hardcodear default values sin defaultValues option

```typescript
// ❌ MAL - uncontrolled inputs, warning en console
function AccountForm() {
  const form = useForm<AccountFormValues>({
    // Falta defaultValues
  });

  return <Input {...form.register("name")} />; // Warning!
}
```

```typescript
// ✅ BIEN - siempre definir defaultValues
const form = useForm<AccountFormValues>({
  defaultValues: {
    name: "",
    balance: 0,
  },
});
```

### ❌ Regex sin escape

```typescript
// ❌ MAL - regex incorrecto
colorHex: z.string().regex(/^#[0-9A-F]{6}$/); // Falta 'i' flag
```

```typescript
// ✅ BIEN - case insensitive, escaped
colorHex: z.string().regex(/^#[0-9A-F]{6}$/i);
```

### ❌ No deshabilitar submit button durante mutation

```typescript
// ❌ MAL - permite múltiples submits
<Button type="submit">Create</Button>
```

```typescript
// ✅ BIEN - deshabilitar durante pending
<Button type="submit" disabled={createMutation.isPending}>
  {createMutation.isPending ? "Creating..." : "Create"}
</Button>
```

---

## Troubleshooting

| Problema                                        | Causa                                   | Solución                                     |
| ----------------------------------------------- | --------------------------------------- | -------------------------------------------- |
| "A component is changing an uncontrolled input" | Falta `defaultValues`                   | Definir `defaultValues` en `useForm()`       |
| Validación no ejecuta                           | Falta `resolver`                        | Agregar `resolver: zodResolver(schema)`      |
| Edit form no pre-popula                         | Usar `defaultValues` en vez de `values` | Cambiar a `values` para reactive updates     |
| Números se guardan como strings                 | No usar `z.coerce.number()`             | Aplicar coercion en schema                   |
| Form no limpia después de submit                | Falta `form.reset()`                    | Llamar `reset()` en `onSuccess`              |
| Errores de API no aparecen                      | No capturar `onError`                   | Agregar `onError` callback con `setApiError` |

---

## References

- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [shadcn Form Component](https://ui.shadcn.com/docs/components/form)
- SmartPocket: [Example form](webapp/src/features/accounts/AccountForm.tsx)

---
