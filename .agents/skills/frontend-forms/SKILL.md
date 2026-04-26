---
name: frontend-forms
description: React Hook Form 7 + Zod patterns para SmartPocket. Usar al crear/editar forms, validación de schemas, submissions, errores de API (field-level + global), integración con TanStack Query mutations, useFormErrorHandler hook, activeMutation pattern, values vs defaultValues, form.reset() con/sin parámetros, coercion manual de números. Sistema de 3 capas de errores, estado derivado con watch(). Incluye anti-patterns eliminados y quick reference tables.
---

# SmartPocket - Forms (React Hook Form + Zod)

Patrones modernos (2026) de formularios con React Hook Form 7.71.1 + Zod 4.3.6 para SmartPocket React app.

---

## When to Use This Skill

- Crear/editar forms (create, edit, search)
- Validar schemas con Zod
- Inyectar errores de API en fields automáticamente
- Integrar forms con TanStack Query mutations
- Manejar create/edit modes en un solo componente
- Type-safe form values con z.infer
- Number field coercion (SmartPocket specific pattern)
- Sistema de 3 capas de error display
- Estado derivado con watch() vs useState

---

## Modern Form Pattern (2026)

**Overview:** Patrón estandarizado que elimina ~40 líneas de boilerplate por form.

**Key patterns:**

- ✅ `useFormErrorHandler` - inyección automática de errores API en RHF
- ✅ `activeMutation` - simplifica manejo de create/edit modes
- ✅ `values` (no defaultValues+useEffect) - sincronización reactiva de edit data
- ✅ Sistema 3 capas - field-level → inline → toast (no duplicación)
- ✅ `handleOpenChange` unificado - reset centralizado
- ✅ Estado derivado con `watch()` - elimina useState duplicado

---

## Step-by-Step: Modern Form Pattern

### Step 1: Schema Zod

Schema define estructura + validación. SIEMPRE crear schema antes del componente.

```typescript
// entitySchema.ts
import { z } from "zod";

export const entitySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  amount: z.number("Must be a number").min(0, "Must be positive"),
  categoryId: z.number("Must select a category").int().positive(),
});

// Inferir tipo del schema (type-safe!)
export type EntityFormValues = z.infer<typeof entitySchema>;
```

### Step 2: Setup mutations + activeMutation

```typescript
import { useCreateEntity, useUpdateEntity } from "./useEntities";

function EntityFormModal({ mode, entity, open, onOpenChange }) {
  const createMutation = useCreateEntity();
  const updateMutation = useUpdateEntity();

  // activeMutation simplifica lógica de create/edit
  const activeMutation = mode === "create" ? createMutation : updateMutation;

  // Estados derivados de una sola fuente
  const isSubmitting = activeMutation.isPending;
  const apiError = activeMutation.error as ApiError | null;
}
```

**Beneficios:**

- Una sola abstracción para ambos modos
- Un solo lugar para verificar estado, error, y reset
- Elimina lógica condicional duplicada

### Step 3: Form setup con values (reactive sync)

```typescript
const DEFAULT_VALUES: EntityFormValues = {
  name: "",
  amount: 0,
  categoryId: 0,
};

const form = useForm<EntityFormValues>({
  resolver: zodResolver(entitySchema),
  // values (no defaultValues) - sincroniza automáticamente cuando entity cambia
  values:
    mode === "edit" && entity
      ? { name: entity.name, amount: entity.amount, categoryId: entity.categoryId }
      : DEFAULT_VALUES,
});
```

**Beneficio:** Elimina `useEffect` manual para sincronizar edit data.

### Step 4: useFormErrorHandler hook

```typescript
import { useFormErrorHandler } from "@/hooks/useFormErrorHandler";

const handleFormError = useFormErrorHandler(form);
```

**Uso:**

```typescript
const form = useForm<MyFormValues>({...});
const handleFormError = useFormErrorHandler(form);

createMutation.mutate(payload, {
  onError: handleFormError, // ← Una línea
});
```

**Qué hace:**

- Inyecta errores de API automáticamente en RHF
- Mapeo case-insensitive: `propertyName` (backend PascalCase) → campo (camelCase)
- Errores aparecen bajo el campo via `<FormMessage />`

### Step 5: Handlers simplificados

```typescript
const handleOpenChange = (isOpen: boolean) => {
  if (!isOpen) {
    activeMutation.reset(); // Limpia error automáticamente
    form.reset(DEFAULT_VALUES);
  }
  onOpenChange(isOpen);
};

const onSubmit = (data: EntityFormValues) => {
  if (mode === "create") {
    createMutation.mutate(data, {
      onSuccess: () => handleOpenChange(false),
      onError: handleFormError, // ← Hook inyecta errores
    });
  } else if (mode === "edit" && entity) {
    updateMutation.mutate(
      { id: entity.id, data },
      {
        onSuccess: () => handleOpenChange(false),
        onError: handleFormError,
      },
    );
  }
};
```

**Elimina:**

- ❌ `useState<ApiError>` + `setApiError(null)`
- ❌ `useEffect` para limpiar errores
- ❌ Reset manual en múltiples lugares

### Step 6: Render con error display

```typescript
return (
  <Dialog open={open} onOpenChange={handleOpenChange}>
    <DialogContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Errores globales (sin propertyName) */}
          {apiError && <ErrorAlert error={apiError} />}

          {/* Campo con errores automáticos */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage /> {/* Errores de Zod + API automáticos */}
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Save"}
          </Button>
        </form>
      </Form>
    </DialogContent>
  </Dialog>
);
```

**Sistema de errores (3 capas):**

- **Error con `propertyName`** → `<FormMessage />` bajo el campo
- **Error sin `propertyName`** → `<ErrorAlert />` inline arriba del form
- **Toast automático** → Solo si NO hay `propertyName` (main.tsx)

**Resultado:** Usuario ve error una vez, en el lugar apropiado.

---

## SmartPocket Pattern: Number Fields

### ⚠️ IMPORTANTE: NO usar z.coerce.number() en este proyecto

**SmartPocket usa conversión MANUAL, NO z.coerce:**

```typescript
// ✅ Pattern correcto de SmartPocket
// 1. Schema: z.number() directo
const schema = z.object({
  amount: z.number("Must be a number").positive("Must be greater than 0"),
  accountId: z.number("Must select an account").int().positive(),
});

// 2. Component: conversión manual en onChange
<FormField
  control={form.control}
  name="amount"
  render={({ field }) => (
    <FormControl>
      <Input
        type="number"
        step="0.01"
        {...field}
        onChange={(e) => field.onChange(parseFloat(e.target.value))}
      />
    </FormControl>
  )}
/>
```

**¿Por qué NO z.coerce.number()?**

1. **API incompatible:** `z.coerce.number()` NO acepta `required_error` ni `invalid_type_error` props
2. **Consistencia:** Todo el proyecto usa este pattern
3. **Control explícito:** Conversión visible en component, más fácil debuggear

**Para integers (IDs):**

```typescript
// Schema
categoryId: z.number("Must select a category").int().positive();

// Component
<Select
  onValueChange={(value) => field.onChange(parseInt(value))}
  {...field}
/>
```

---

## Quick Reference

### values vs defaultValues

| Escenario                            | Usar            | Razón                                |
| ------------------------------------ | --------------- | ------------------------------------ |
| Form create-only (valores estáticos) | `defaultValues` | Se establece una vez al montar       |
| Form create/edit con mode toggle     | `values`        | Sincroniza automáticamente con props |
| Form con datos externos dinámicos    | `values`        | Reacciona a cambios de entity/data   |
| Form con valores hardcodeados        | `defaultValues` | No necesita reactivity               |

```typescript
// defaultValues - valores estáticos (NO sincroniza con props)
const form = useForm({
  defaultValues: { name: "" },
});

// values - sincroniza reactivamente cuando entity cambia
const form = useForm({
  values: mode === "edit" && entity ? { name: entity.name } : DEFAULT_VALUES,
});
```

### form.reset() - Con/Sin Parámetros

| Uso                          | Efecto                                                 |
| ---------------------------- | ------------------------------------------------------ |
| `form.reset()`               | Resetea a defaultValues/values originales              |
| `form.reset(newValues)`      | Resetea a valores específicos                          |
| `form.reset(DEFAULT_VALUES)` | Garantiza estado limpio (recomendado al cerrar modals) |

```typescript
// Sin parámetros - vuelve a values/defaultValues
form.reset();

// Con parámetros - establece valores específicos
form.reset({ name: "", amount: 0 });

// Al cerrar modal - garantiza limpieza completa
const handleOpenChange = (isOpen: boolean) => {
  if (!isOpen) {
    activeMutation.reset();
    form.reset(DEFAULT_VALUES); // ← Recomendado
  }
  onOpenChange(isOpen);
};
```

---

## Common Patterns

### Estado derivado con watch()

Elimina `useState` duplicado. Usar `watch()` para derivar valores del form state.

```typescript
// ❌ Antes - estado duplicado
const [selectedType, setSelectedType] = useState<boolean>(false);

<Button onClick={() => {
  field.onChange(true);
  setSelectedType(true); // ← Sincronización manual
}} />

// ✅ Después - derivado de form
const selectedType = form.watch("isIncome");

<Button onClick={() => field.onChange(true)} />
```

**Beneficio:** Una sola fuente de verdad (form state).

### Edit form (values reactivo)

```typescript
function EditEntityForm({ entityId }: { entityId: number }) {
  const { data: entity } = useEntity(entityId);

  const form = useForm<EntityFormValues>({
    resolver: zodResolver(entitySchema),
    // values (no defaultValues) - sincroniza cuando entity cambia
    values: entity ? { name: entity.name, amount: entity.amount } : DEFAULT_VALUES,
  });
}
```

### Dynamic fields (useFieldArray)

```typescript
const schema = z.object({
  items: z.array(
    z.object({
      description: z.string().min(1),
      amount: z.number("Must be a number").positive(),
    })
  ).min(1, "At least one item required"),
});

function DynamicForm() {
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
      <Button onClick={() => append({ description: "", amount: 0 })}>
        Add Item
      </Button>
    </>
  );
}
```

### Conditional validation

```typescript
const schema = z
  .object({
    type: z.enum(["savings", "credit"]),
    creditLimit: z.number("Must be a number").optional(),
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
      message: "Credit limit required for credit accounts",
      path: ["creditLimit"], // Error aparece en este campo
    },
  );
```

### Dependent fields

```typescript
function ConditionalForm() {
  const accountType = form.watch("type");

  return (
    <>
      <FormField name="type" /* ... */ />

      {/* Mostrar solo si type = credit */}
      {accountType === "credit" && (
        <FormField name="creditLimit" /* ... */ />
      )}
    </>
  );
}
```

---

## Anti-Patterns (Eliminados en 2026 Refactor)

### ❌ useState para API errors

```typescript
// ❌ MAL - TanStack Query ya maneja estado
const [apiError, setApiError] = useState<ApiError | null>(null);
const onSubmit = (data) => {
  setApiError(null);
  createMutation.mutate(data, { onError: (error) => setApiError(error) });
};

// ✅ BIEN - usar activeMutation.error
const activeMutation = mode === "create" ? createMutation : updateMutation;
const apiError = activeMutation.error as ApiError | null;
createMutation.mutate(data, { onError: handleFormError });
```

### ❌ useEffect para sincronizar edit data

```typescript
// ❌ MAL - sincronización manual
useEffect(() => {
  if (mode === "edit" && entity) form.reset({ name: entity.name });
}, [mode, entity, form]);

// ✅ BIEN - sincronización automática
const form = useForm({
  values: mode === "edit" && entity ? { name: entity.name } : DEFAULT_VALUES,
});
```

### ❌ useEffect para limpiar errores

```typescript
// ❌ MAL - limpieza manual
useEffect(() => {
  if (open) setApiError(null);
}, [open]);

// ✅ BIEN - limpieza centralizada en handleOpenChange
const handleOpenChange = (isOpen: boolean) => {
  if (!isOpen) {
    activeMutation.reset(); // Limpia error automáticamente
    form.reset(DEFAULT_VALUES);
  }
  onOpenChange(isOpen);
};
```

### ❌ getFieldErrors() helper repetido

```typescript
// ❌ MAL - helper manual en cada form
const getFieldErrors = (name: string) =>
  apiError?.errors?.filter((e) => e.propertyName === name).map((e) => e.message) || [];

// ✅ BIEN - useFormErrorHandler automático
const handleFormError = useFormErrorHandler(form);
createMutation.mutate(data, { onError: handleFormError });
// Display automático con <FormMessage />
```

### ❌ Verificar ambas mutations separadamente

```typescript
// ❌ MAL - lógica condicional duplicada
const isLoading = createMutation.isPending || updateMutation.isPending;
if (!open) {
  createMutation.reset();
  updateMutation.reset();
}

// ✅ BIEN - activeMutation pattern
const activeMutation = mode === "create" ? createMutation : updateMutation;
const isSubmitting = activeMutation.isPending;
if (!open) activeMutation.reset();
```

### ❌ useState derivado (duplicación)

```typescript
// ❌ MAL - estado duplicado + sincronización manual
const [selectedType, setSelectedType] = useState(false);
<Button onClick={() => { field.onChange(true); setSelectedType(true); }} />

// ✅ BIEN - derivado de form state
const selectedType = form.watch("isIncome");
<Button onClick={() => field.onChange(true)} />
```

### ❌ Usar z.coerce.number() en SmartPocket

```typescript
// ❌ MAL - incompatible con project pattern
amount: z.coerce.number().min(0);

// ✅ BIEN - z.number() + conversión manual
amount: z.number("Must be a number").min(0);
<Input type="number" {...field}
  onChange={(e) => field.onChange(parseFloat(e.target.value))} />
```

### ❌ Validación solo client-side

```typescript
// ❌ MAL - confiar solo en Zod (cliente puede bypassear)
const onSubmit = (data) => {
  createMutation.mutate(data);
};

// ✅ BIEN - backend SIEMPRE valida (source of truth)
const onSubmit = (data) => {
  createMutation.mutate(data, { onError: handleFormError });
};
```

### ❌ No limpiar form después de submit

```typescript
// ❌ MAL - valores persisten
const onSubmit = (data) => {
  createMutation.mutate(data);
};

// ✅ BIEN - reset en onSuccess
createMutation.mutate(data, {
  onSuccess: () => handleOpenChange(false), // Incluye form.reset()
});
```

### ❌ No definir defaultValues

```typescript
// ❌ MAL - uncontrolled inputs warning
const form = useForm<FormValues>({
  /* Falta defaultValues */
});

// ✅ BIEN - siempre definir
const form = useForm<FormValues>({ defaultValues: { name: "", amount: 0 } });
```

### ❌ No deshabilitar submit durante mutation

```typescript
// ❌ MAL - permite múltiples submits
<Button type="submit">Create</Button>

// ✅ BIEN - deshabilitar durante pending
<Button type="submit" disabled={activeMutation.isPending}>
  {activeMutation.isPending ? "Saving..." : "Create"}
</Button>
```

---

## Troubleshooting

| Problema                                        | Causa                                        | Solución                                                               |
| ----------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| "A component is changing an uncontrolled input" | Falta `defaultValues`                        | Definir `defaultValues` en `useForm()`                                 |
| Validación no ejecuta                           | Falta `resolver`                             | Agregar `resolver: zodResolver(schema)`                                |
| Edit form no pre-popula                         | Usar `defaultValues` en vez de `values`      | Cambiar a `values` para reactive updates                               |
| Números se guardan como strings                 | Falta conversión en `onChange`               | Agregar `onChange={(e) => field.onChange(parseFloat(e.target.value))}` |
| Form no limpia después de submit                | Falta `form.reset()`                         | Llamar `reset()` en `onSuccess`                                        |
| Errores de API no aparecen                      | No usar `useFormErrorHandler`                | Agregar `onError: handleFormError`                                     |
| useEffect ejecuta infinitamente en edit         | Dependencias incorrectas con `defaultValues` | Cambiar a `values` (elimina useEffect)                                 |
| Errores duplicados (toast + inline)             | Sistema de 3 capas mal configurado           | Verificar main.tsx filtra `propertyName`                               |
| Estado derivado desincronizado                  | Usar `useState` duplicado                    | Cambiar a `form.watch()`                                               |
| Reset no funciona al cerrar modal               | No pasar valores a `reset()`                 | Usar `form.reset(DEFAULT_VALUES)`                                      |

---

## References

- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [shadcn Form Component](https://ui.shadcn.com/docs/components/form)
- [RFC 7807 Problem Details](https://tools.ietf.org/html/rfc7807)

---
