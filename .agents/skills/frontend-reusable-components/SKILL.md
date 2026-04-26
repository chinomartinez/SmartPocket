---
name: frontend-reusable-components
description: "Componentes reutilizables de SmartPocket. **Usar al** trabajar con IconBox, DeleteConfirmationDialog, ErrorAlert, PlaceholderPage, iconMap, o al crear componentes nuevos en /components. Incluye cuándo usar shadcn/ui vs crear custom, y reglas de organización de archivos."
argument-hint: 'Component name or action (e.g., "IconBox usage" or "create new component")'
---

# SmartPocket - Reusable Components

Componentes reutilizables compartidos entre features de SmartPocket React app.

---

## When to Use This Skill

- Trabajar con componentes reutilizables existentes (IconBox, DeleteConfirmationDialog, etc.)
- Crear componentes nuevos en `/components`
- Decidir entre shadcn/ui vs componente custom
- Usar o extender `iconMap.ts`
- Renderizar iconos en cualquier contexto
- Mostrar dialogs de confirmación de eliminación

---

## Organización de Archivos

### Regla de ubicación

**SIEMPRE en `src/components/`** - No en features individuales.

```
src/components/
├── IconBox.tsx                    # ✅ Componente single-file
├── DeleteConfirmationDialog.tsx   # ✅ Componente single-file
├── ErrorAlert.tsx                 # ✅ Componente single-file
├── PlaceholderPage.tsx            # ✅ Componente single-file
├── iconBoxes/                     # ✅ Multi-file component
│   ├── IconBox.tsx
│   └── iconMap.ts
└── ui/                            # shadcn/ui components
    ├── button.tsx
    ├── dialog.tsx
    └── ...
```

### Regla: Single-file vs Carpeta

| Escenario                           | Ubicación                              |
| ----------------------------------- | -------------------------------------- |
| Componente de un solo archivo       | `/components/ComponentName.tsx`        |
| Componente + helpers/types/archivos | `/components/componentName/` (carpeta) |
| shadcn/ui component                 | `/components/ui/` (ya existe)          |

**Ejemplo multi-file:**

```
components/
└── iconBoxes/
    ├── IconBox.tsx       # Componente
    ├── iconMap.ts        # Mapa de iconos
    └── iconHelpers.ts    # Helpers (si se necesitan)
```

---

## shadcn/ui vs Custom Component

### Cuándo instalar de shadcn/ui

**SIEMPRE verificar primero** si shadcn/ui tiene el componente:

```bash
# Listar componentes disponibles
npx shadcn@latest add

# Instalar componente específico
npx shadcn@latest add textarea
npx shadcn@latest add badge
npx shadcn@latest add tabs
```

**Instalar de shadcn/ui cuando:**

- ✅ El componente existe en shadcn/ui (Button, Dialog, Input, Select, etc.)
- ✅ Necesitas comportamiento UI básico sin lógica de negocio
- ✅ Quieres mantener consistencia con el design system

### Cuándo crear custom component

**Crear custom solo si:**

- ✅ shadcn/ui NO tiene el componente
- ✅ Necesita lógica de negocio específica de SmartPocket (ej: DeleteConfirmationDialog)
- ✅ Combina múltiples componentes shadcn/ui con estado complejo
- ✅ Es específico del dominio (ej: IconBox para iconos de categorías/cuentas)

**Ejemplo - MAL (crear Textarea custom):**

```typescript
// ❌ NO crear si shadcn/ui lo tiene
export function CustomTextarea() {
  return <textarea className="..." />;
}
```

**Ejemplo - BIEN (instalar de shadcn/ui):**

```bash
# ✅ Instalar desde shadcn/ui
npx shadcn@latest add textarea
```

```typescript
// ✅ Usar componente instalado
import { Textarea } from "@/components/ui/textarea";

<Textarea placeholder="Descripción..." />;
```

---

## IconBox Component

**Ubicación:** `src/components/iconBoxes/IconBox.tsx`

### Propósito

Renderizar iconos de categorías/cuentas con color, tamaño y forma consistente. Centraliza la lógica de visualización de iconos en toda la app.

### Props

```typescript
interface IconBoxProps {
  icon: IconDTO; // { code: string, colorHex: string }
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "square" | "rounded" | "circle";
  backgroundOpacity?: 10 | 20 | 30;
  showBackground?: boolean;
  className?: string;
  onClick?: () => void;
  animated?: boolean; // Hover scale effect
}
```

### Tamaños disponibles

| Size | Dimensions | Text Size | Uso común               |
| ---- | ---------- | --------- | ----------------------- |
| xs   | 24px       | text-sm   | Selects, badges, inline |
| sm   | 40px       | text-lg   | Cards pequeñas          |
| md   | 56px       | text-2xl  | Cards principales       |
| lg   | 80px       | text-3xl  | Headers, destacados     |
| xl   | 96px       | text-4xl  | Hero sections           |

### Ejemplos de uso

**En cards (AccountCard, CategoryCard):**

```typescript
<IconBox icon={account.icon} size="md" shape="rounded" backgroundOpacity={20} animated />
```

**En selects (TransactionFormModal):**

```typescript
<SelectItem value={account.id.toString()}>
  <div className="flex items-center gap-2">
    <IconBox icon={account.icon} size="xs" shape="rounded" backgroundOpacity={20} />
    <span>{account.name}</span>
  </div>
</SelectItem>
```

**En badges o inline display:**

```typescript
<div className="flex items-center gap-2">
  <IconBox icon={category.icon} size="xs" shape="circle" showBackground={false} />
  <span>{category.name}</span>
</div>
```

**Con interactividad:**

```typescript
<IconBox
  icon={icon}
  size="md"
  onClick={() => handleIconClick(icon.code)}
  animated
  className="cursor-pointer"
/>
```

### Background opacity

Controla la opacidad del background coloreado:

- **10** - Muy sutil (10% opacity)
- **20** - Balanceado (20% opacity) - **DEFAULT**
- **30** - Más visible (30% opacity)

**Nota:** Opacity se aplica via inline styles (Tailwind no soporta opacidades dinámicas con hex colors).

---

## iconMap.ts - Icon Registry

**Ubicación:** `src/components/iconBoxes/iconMap.ts`

### Propósito

Mapa centralizado de todos los iconos disponibles (cuentas, categorías, otros). Facilita búsqueda, filtrado y futura migración a Heroicons si se decide.

### Estructura

```typescript
export interface IconOption {
  code: string; // Identificador único ('money-bag', 'food', etc.)
  symbol: string; // Emoji ('💰', '🍔', etc.)
  label: string; // Nombre legible ('Bolsa de dinero', 'Comida')
}

export const ICON_MAP: Record<string, IconOption> = {
  // Iconos de Cuentas
  "money-bag": { code: "money-bag", symbol: "💰", label: "Bolsa de dinero" },
  "credit-card": { code: "credit-card", symbol: "💳", label: "Tarjeta" },
  // ...

  // Iconos de Categorías - Gastos
  shopping: { code: "shopping", symbol: "🛒", label: "Compras" },
  food: { code: "food", symbol: "🍔", label: "Comida" },
  // ...

  // Iconos de Categorías - Ingresos
  salary: { code: "salary", symbol: "💰", label: "Salario" },
  investment: { code: "investment", symbol: "📈", label: "Inversiones" },
  // ...
};
```

### Helper Functions

**`getIconSymbol(code, fallbackCode?)`**

Obtener símbolo emoji por código.

```typescript
const symbol = getIconSymbol("food"); // '🍔'
const fallback = getIconSymbol("invalid", "default"); // '⚪'
```

**`getIconOption(code, fallbackCode?)`**

Obtener objeto `IconOption` completo.

```typescript
const option = getIconOption("salary");
// { code: 'salary', symbol: '💰', label: 'Salario' }
```

**`getAllIcons()`**

Obtener todos los iconos disponibles.

```typescript
const allIcons = getAllIcons(); // IconOption[]
```

**`getAccountIcons()`**

Obtener solo iconos de cuentas.

```typescript
const accountIcons = getAccountIcons();
// [{ code: 'money-bag', ... }, { code: 'credit-card', ... }, ...]
```

**`getCategoryIcons(isIncome)`**

Obtener iconos de categorías filtrados por tipo.

```typescript
const expenseIcons = getCategoryIcons(false); // Iconos de gastos
const incomeIcons = getCategoryIcons(true); // Iconos de ingresos
```

### Agregar nuevos iconos

**1. Agregar al ICON_MAP:**

```typescript
export const ICON_MAP: Record<string, IconOption> = {
  // ...existing icons
  "new-icon": { code: "new-icon", symbol: "🎨", label: "Nuevo Icono" },
};
```

**2. Si es icono de cuenta, actualizar `getAccountIcons()`:**

```typescript
export function getAccountIcons(): IconOption[] {
  const accountCodes = [
    "money-bag",
    "credit-card",
    // ...
    "new-icon", // ✅ Agregar aquí
  ];
  return accountCodes.map((code) => ICON_MAP[code]);
}
```

**3. Si es icono de categoría, actualizar `getCategoryIcons()`:**

```typescript
export function getCategoryIcons(isIncome: boolean): IconOption[] {
  if (isIncome) {
    const incomeCodes = [
      "salary",
      // ...
      "new-income-icon", // ✅ Agregar aquí si es ingreso
    ];
    return incomeCodes.map((code) => ICON_MAP[code]);
  } else {
    const expenseCodes = [
      "shopping",
      // ...
      "new-expense-icon", // ✅ Agregar aquí si es gasto
    ];
    return expenseCodes.map((code) => ICON_MAP[code]);
  }
}
```

### Cuándo usar cada helper

| Contexto                                 | Helper a usar              |
| ---------------------------------------- | -------------------------- |
| Renderizar icono conociendo solo el code | `getIconSymbol()`          |
| Mostrar opción completa (label + symbol) | `getIconOption()`          |
| Selector de iconos de cuentas            | `getAccountIcons()`        |
| Selector de iconos de categorías         | `getCategoryIcons()`       |
| Búsqueda/filtrado general                | `getAllIcons()`            |
| IconBox component (interno)              | `getIconSymbol()` (usado)  |
| Migración futura a Heroicons             | Actualizar `getIconSymbol` |

---

## DeleteConfirmationDialog Component

**Ubicación:** `src/components/DeleteConfirmationDialog.tsx`

### Propósito

Dialog de confirmación reutilizable para eliminación de entidades. Mantiene UX consistente en toda la app.

### Props

```typescript
interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string; // Nombre del item a eliminar
  itemType?: string; // "cuenta", "categoría", "transacción"
  isDeleting?: boolean; // Loading state
  title?: string; // Override default title
  description?: string; // Override default description
}
```

### Defaults inteligentes

- **title:** `¿Eliminar ${itemType}?`
- **description:** `¿Estás seguro de que deseas eliminar la ${itemType} "${itemName}"? Esta acción no se puede deshacer.`

### Ejemplos de uso

**En feature components (AccountCard, CategoryFormModal):**

```typescript
const [showDeleteDialog, setShowDeleteDialog] = useState(false);
const deleteMutation = useDeleteAccount();

// Trigger
<Button onClick={() => setShowDeleteDialog(true)}>
  <TrashIcon />
</Button>

// Dialog
<DeleteConfirmationDialog
  open={showDeleteDialog}
  onOpenChange={setShowDeleteDialog}
  onConfirm={() => {
    deleteMutation.mutate(accountId);
    setShowDeleteDialog(false);
  }}
  itemName={account.name}
  itemType="cuenta"
  isDeleting={deleteMutation.isPending}
/>
```

**Con título/descripción custom:**

```typescript
<DeleteConfirmationDialog
  open={showDeleteDialog}
  onOpenChange={setShowDeleteDialog}
  onConfirm={handleDelete}
  itemName={item.name}
  title="¿Estás seguro?"
  description="Esta acción eliminará permanentemente el registro y no se puede revertir."
  isDeleting={isDeleting}
/>
```

### Estado de loading

- **`isDeleting={true}`** - Deshabilita botones y muestra "Eliminando..."
- **`isDeleting={false}`** - Estado normal, muestra "Eliminar"

---

## ErrorAlert Component

**Ubicación:** `src/components/ErrorAlert.tsx`

### Propósito

Muestra errores inline (validación, formularios) usando shadcn Alert. Recibe `ApiError` del errorHandler y muestra mensaje + errores de validación.

### Props

```typescript
interface ErrorAlertProps {
  error: ApiError | null;
  onDismiss?: () => void;
  className?: string;
}
```

### Comportamiento

- **Filtra errores automáticamente** - Filtra internamente `error.errors` para mostrar solo los que NO tienen `propertyName`
- **Retorna `null` si no hay errores globales** - No renderiza nada si no hay errores o todos tienen `propertyName`
- **Lista múltiples errores** - Si hay varios, los muestra en lista con bullets

### Ejemplo de uso

**En form modals (patrón moderno):**

```typescript
const createMutation = useCreateAccount();
const updateMutation = useUpdateAccount();
const activeMutation = mode === "create" ? createMutation : updateMutation;

const apiError = activeMutation.error as ApiError | null;

// En JSX
<Form>
  {apiError && <ErrorAlert error={apiError} />}
  {/* Form fields... */}
</Form>
```

**Con dismiss (opcional):**

```typescript
const handleDismiss = () => {
  activeMutation.reset(); // Limpia el error de la mutation
};

<ErrorAlert error={apiError} onDismiss={handleDismiss} />
```

**Ver [frontend-error-handling](../frontend-error-handling/SKILL.md) para patterns completos de manejo de errores.**

---

## PlaceholderPage Component

**Ubicación:** `src/components/PlaceholderPage.tsx`

### Propósito

Página placeholder para features que se implementarán en fases futuras del roadmap.

### Props

```typescript
interface PlaceholderPageProps {
  title: string;
  description?: string; // Default: 'Funcionalidad disponible en Fase 3'
}
```

### Ejemplo de uso

**En rutas no implementadas:**

```typescript
// router/AppRouter.tsx
<Route
  path="/dashboard"
  element={<PlaceholderPage title="Dashboard" description="Disponible en Fase 2" />}
/>
```

### Styling

- Fondo gradient (`from-slate-900 via-sp-blue-900 to-slate-900`)
- Centrado vertical y horizontal
- Tipografía clara y legible

---

## shadcn/ui Components

**Ubicación:** `src/components/ui/`

### Qué es shadcn/ui

shadcn/ui NO es una library tradicional. Son componentes copiables basados en Radix UI que se instalan directamente en tu proyecto. Puedes customizarlos completamente.

### Componentes instalados

| Componente     | Uso                                |
| -------------- | ---------------------------------- |
| `button`       | Botones con variantes              |
| `dialog`       | Modals y dialogs                   |
| `alert-dialog` | Confirmaciones críticas            |
| `alert`        | Notificaciones inline              |
| `input`        | Campos de texto                    |
| `textarea`     | Campos de texto multilínea         |
| `select`       | Dropdowns                          |
| `form`         | Form context (react-hook-form)     |
| `label`        | Labels accesibles                  |
| `card`         | Contenedores con padding/border    |
| `badge`        | Tags pequeñas                      |
| `checkbox`     | Checkboxes                         |
| `skeleton`     | Loading placeholders               |
| `sonner`       | Toast notifications (wraps Sonner) |

### Instalar nuevos componentes

```bash
# Ver lista completa
npx shadcn@latest add

# Instalar componente específico
npx shadcn@latest add [component-name]

# Ejemplos
npx shadcn@latest add tabs
npx shadcn@latest add accordion
npx shadcn@latest add tooltip
```

### Customización

Los componentes se instalan en `src/components/ui/`. Puedes editarlos directamente:

```typescript
// components/ui/button.tsx
// ✅ Puedes agregar variantes custom
const buttonVariants = cva("...", {
  variants: {
    variant: {
      default: "...",
      destructive: "...",
      success: "bg-green-600 hover:bg-green-700", // ✅ Custom variant
    },
  },
});
```

---

## Patterns de Uso

### Componentes reutilizables siempre exportan named exports

```typescript
// ✅ BIEN
export function IconBox(props: IconBoxProps) {}
export function DeleteConfirmationDialog(props: DeleteConfirmationDialogProps) {}

// ❌ MAL
export default IconBox;
```

### Props typing con interface

```typescript
// ✅ Usar interface para props públicas
interface IconBoxProps {
  icon: IconDTO;
  size?: IconSize;
}

export function IconBox(props: IconBoxProps) {}
```

### Props opcionales con defaults

```typescript
// ✅ Destructure con defaults
export function IconBox({
  size = "sm",
  shape = "rounded",
  backgroundOpacity = 20,
  showBackground = true,
}: IconBoxProps) {}
```

### Composición sobre custom variants

```typescript
// ✅ PREFERIR: Componer componentes existentes
<DeleteConfirmationDialog
  itemName={name}
  itemType="cuenta"
  onConfirm={handleDelete}
/>

// ❌ EVITAR: Crear variant custom del AlertDialog cada vez
<AlertDialog>
  <AlertDialogTitle>¿Eliminar cuenta?</AlertDialogTitle>
  {/* ... código repetido */}
</AlertDialog>
```

---

## See Also

- **[frontend-component-architecture](../frontend-component-architecture/SKILL.md)** - Estructura general, naming, best practices
- **[frontend-financial-display](../frontend-financial-display/SKILL.md)** - Patterns visuales financieros
- **[frontend-forms](../frontend-forms/SKILL.md)** - React Hook Form + validación

---
