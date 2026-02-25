# SmartPocket - Copilot Rules

Manual técnico para GitHub Copilot. React 19 + TypeScript + Tailwind v4.

---

## Índice

1. [Descripción](#descripción)
2. [Stack](#stack)
3. [Arquitectura](#arquitectura)
4. [Data Fetching](#data-fetching)
5. [Testing](#testing)
6. [Error Handling](#error-handling)
7. [Design System](#design-system)
8. [Convenciones](#convenciones)

---

## Descripción

Aplicación de gestión financiera personal con React 19, TypeScript strict mode y Tailwind CSS v4.

**Features**: Dashboard financiero, gestión de cuentas, categorización de transacciones, historial con filtros.

**Prioridades**: (1) UX excepcional, (2) Código mantenible, (3) Interfaz atractiva, (4) Performance.

---

## Stack

- **Core**: React 19, TypeScript (strict), Vite
- **Styles**: Tailwind CSS v4 + shadcn/ui + glassmorphism
- **State**: Zustand + TanStack Query
- **Routing**: React Router v7
- **HTTP**: Axios + interceptors
- **Errors**: Sonner (toasts) + ErrorBoundary + errorLogger
- **Backend**: API .NET separada (REST)

---

## Arquitectura

### Estructura de Carpetas

```
src/
├── api/              # HTTP client + services por entidad + errorHandler
├── components/       # UI reutilizable (ErrorAlert, ErrorBoundary) + ui/ (shadcn)
├── features/         # Módulos feature-first (dashboard, accounts, transactions, categories)
├── hooks/            # Custom hooks compartidos
├── layout/           # Header, Sidebar, Layout principal
├── router/           # AppRouter, PrivateRoute, routes.ts
├── store/            # Zustand stores
└── utils/            # Helpers puros (formatters, errorLogger)
```

### Flujo de Datos

```
Component → Hook (TanStack Query) → Service → spApiClient → API
```

**Regla crítica**: Componentes SOLO llaman hooks, NUNCA services directamente.

### Feature-First Architecture

Cada feature es un módulo autocontenido en `src/features/{feature}/` con todos sus recursos (componentes, hooks, types, utils). Reduce acoplamiento, facilita mantenimiento y permite trabajo en paralelo.

---

## Data Fetching

### Services Layer

**Ubicación**: `src/api/services/{entity}/`

**Patrón**: Objeto literal con métodos async

```typescript
import { spApiClient } from "@/api/spApiClient";
import type { Account, AccountCreateCommand } from "./accountTypes";
import type { PagedListResponse } from "../shared/sharedTypes";

export const accountService = {
  getAll: async () => {
    const response = await spApiClient.get<PagedListResponse<Account>>("/accounts");
    return response.data.data; // Acceso a payload de ApiResponse<T>
  },

  create: async (data: AccountCreateCommand) => {
    const response = await spApiClient.post<Account>("/accounts", data);
    return response.data;
  },
  // También: getById, update, delete (mismo patrón)
};
```

**Reglas**:

- `spApiClient` retorna `ApiResponse<T>` con `{ data, status, headers }`
- Services extraen `response.data` para retornar solo el payload
- Named export del objeto
- Métodos async con arrow functions

### Custom Hooks con TanStack Query

**Ubicación**: `src/features/{feature}/hooks/` o `src/hooks/` (compartidos)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountService } from "@/api/services/accounts/accountService";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: accountService.getAll,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });
}
```

**Reglas**:

- Un hook por operación
- Query keys: `['entity']` o `['entity', id]`
- Invalidar queries en `onSuccess`
- Componentes usan hooks (NO services)

**Uso en componentes**:

```typescript
// En el componente
const createMutation = useCreateAccount();

// Usar mutate (NO mutateAsync) con callbacks
const onSubmit = (data: FormData) => {
  setApiError(null);

  createMutation.mutate(data, {
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
    },
    onError: (error: ApiError) => {
      setApiError(error);
    },
  });
};

// isLoading/isPending
const isLoading = createMutation.isPending || updateMutation.isPending;
```

**Por qué `mutate` sobre `mutateAsync`**:

- Más declarativo y limpio
- Callbacks se ejecutan después de los del hook
- No requiere `try/catch` explícito
- Solo usar `mutateAsync` si necesitas flujo imperativo complejo (raro en UI)

---

## Testing

**Mock de Services** (Vitest):

```typescript
vi.mock("@/api/services/accounts/accountService", () => ({
  accountService: { getAll: vi.fn(), create: vi.fn() },
}));
vi.mocked(accountService.getAll).mockResolvedValue([mockAccount]);
```

---

## Error Handling

### Flujo

```
API Error → errorHandler → spApiClient → TanStack Query → onCentralError → Toast (TODOS)
React Crash → ErrorBoundary → errorLogger → Fallback UI
```

### Estructura de Errores (RFC 7807)

**Tipos** (`src/api/types.ts`):

- `ApiError`: `message`, `statusCode`, `errors[]`, `problemDetails`
- `ErrorDetail`: `message`, `severity`, `propertyName?` (separar general vs campo)
- `ProblemDetails`: Estándar RFC 7807

### Decisiones

**Toast Centralizado** (`main.tsx`): TODOS los errores TanStack Query muestran toast automático (configurado en `QueryCache` y `MutationCache` con `onCentralError`).

**errorHandler** (`src/api/errorHandler.ts`): Transforma errores Axios en `ApiError` user-friendly con diccionarios de mensajes.

**Separación UI**:

- Sin `propertyName` → `ErrorAlert` (componente inline)
- Con `propertyName` → Debajo del input específico (pendiente implementar)

### Componentes

| Componente          | Propósito                            | Automático   |
| ------------------- | ------------------------------------ | ------------ |
| `ErrorAlert.tsx`    | Alert inline para errores generales  | Manual       |
| `ErrorBoundary.tsx` | Captura crashes React                | Sí           |
| `ui/sonner.tsx`     | Toast notifications                  | Centralizado |
| `errorLogger.ts`    | Logging (DEV: console, PROD: Sentry) | Manual       |

**Reglas de uso**:

1. NO manejar toast manualmente (ya centralizado)
2. Usar `ErrorAlert` en formularios para errores generales 400
3. Implementar field errors con filtrado por `propertyName`

---

## Design System

### Colores

| Color       | Hex      | Uso                             | Clases                                   |
| ----------- | -------- | ------------------------------- | ---------------------------------------- |
| `sp-blue`   | `1e40af` | Primario (confianza financiera) | `bg-sp-blue-600`, `text-sp-blue-400`     |
| `sp-purple` | `8b5cf6` | Acento (innovación)             | `bg-sp-purple-500`, `text-sp-purple-400` |
| `emerald`   | `10b981` | Positivo (ingresos)             | `bg-emerald-500`, `text-emerald-400`     |
| `slate`     | `4b5563` | Neutrales                       | `bg-slate-800`, `text-slate-400`         |
| `red`       | `f43f5e` | Destructivo (gastos)            | `bg-red-500`, `text-red-400`             |

**Custom colors**: Namespace `sp-` con escalas 50-900, formato `oklch` en `src/index.css`.  
**Built-in colors**: Usar directamente (emerald, slate, red), NO crear custom.  
**Variables shadcn/ui**: NO modificar (`--background`, `--primary`, `--card`, etc.).

### Glassmorphism & Animaciones

**Clases custom** en `src/index.css` (`@layer utilities`):

- `.glass-card`: Base para cards estándar
- `.glass-card-strong`: Opacidad mayor (Sidebar, Header)
- `.glass-card-hover`: Efectos hover, combinar con `.glass-card`

**Timing**: `duration-200` (hover rápido), `duration-300` (transiciones estándar)

**Hover effects**: Cards con `group-hover:scale-105`, iconos con `group-hover:scale-110` o `group-hover:translate-x-0.5`

```tsx
<Card className="glass-card glass-card-hover group">
  <Icon className="group-hover:scale-110 transition-transform duration-200" />
</Card>
```

### Responsive (Mobile-First)

| Breakpoint | Ancho  | Uso     | Ejemplo                     |
| ---------- | ------ | ------- | --------------------------- |
| `md`       | 768px  | Tablet  | `md:grid-cols-3`, `md:px-6` |
| `lg`       | 1024px | Desktop | `lg:grid-cols-5`, `lg:px-8` |

**Patrones**: `px-4 md:px-6 lg:px-8`, `grid-cols-1 md:grid-cols-3`, `mb-6 md:mb-8`

**Grids**: `grid-cols-1 md:grid-cols-5` con `md:col-span-3` + `md:col-span-2` (proporciones 60/40)

**Spacing progresivo**: `gap-4 md:gap-6`

```tsx
// Correcto: Base mobile, mejoras en breakpoints
<div className="px-4 md:px-6 lg:px-8">

// Incorrecto: Base desktop, reducir en mobile
<div className="px-8 md:px-4">
```

---

## Convenciones

### TypeScript

- Strict mode habilitado
- Named exports (NO default exports)
- NO usar `any` (usar `unknown`)
- Preferir union types sobre enums

```typescript
// Correcto
export function Card({ title }: CardProps) {
  /* ... */
}
type Status = "pending" | "completed";

// Incorrecto
export default function Card(props: any) {
  /* ... */
}
```

### Imports

- Alias `@/` para absolutos desde `src/`
- Relativos `./` dentro del módulo
- Orden: externos → `@/` → `./`

```typescript
import { useState } from "react";
import { formatCurrency } from "@/utils";
import { Transaction } from "./transaction";
```

### Navegación

**Regla**: Usar `<Link>` de React Router para navegación.

| Acción       | Elemento                 | Por qué                      |
| ------------ | ------------------------ | ---------------------------- |
| Cambiar ruta | `<Link>`                 | Routing real + accesibilidad |
| Submit form  | `<button type="submit">` | No es navegación             |
| Abrir modal  | `<button>`               | No es navegación             |

```tsx
// Correcto
import { Link } from 'react-router-dom';
<Link to="/transactions">Ver todas</Link>

// Incorrecto
<button onClick={() => navigate('/transactions')}>Ver todas</button>
```

### Naming

| Tipo                | Convención | Ejemplo                               |
| ------------------- | ---------- | ------------------------------------- |
| Componentes/Tipos   | PascalCase | `RecentTransactions.tsx`, `CardProps` |
| Funciones/Variables | camelCase  | `formatCurrency()`, `isLoading`       |
| Carpetas            | camelCase  | `recentTransactions/`                 |
| CSS Classes         | kebab-case | `.glass-card`                         |

### Estilos

- Solo Tailwind CSS (NO CSS modules)
- Utility-first con composition
- Custom utilities en `@layer utilities`
- Variables CSS solo para colores `oklch`

### Component Module Pattern

Para componentes complejos (3+ interfaces o mock >10 líneas):

- Carpeta con `ComponentName.tsx`, `componentTypes.ts`, `mockData.ts`
- Imports relativos `./` dentro del módulo, alias `@/` para externos

---

**Referencia roadmap**: Ver [roadmap.md](./roadmap.md) para estado del proyecto.
