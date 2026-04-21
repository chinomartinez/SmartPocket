---
name: frontend-development
description: Overview de desarrollo React 19 de SmartPocket e índice de skills. Lista skills especializados disponibles para data fetching, forms, testing, routing, architecture patterns, y visual/financial display. Usar para preguntas generales de frontend o descubrir qué skill especializado usar.
---

# SmartPocket - Frontend Development

Índice de skills especializadas y overview del stack frontend.

---

## Available Specialized Skills

SmartPocket usa skills modulares. Copilot cargará la skill correcta automáticamente según tu pregunta:

### **frontend-data-fetching**

TanStack Query patterns (queries, mutations, cache, service layer)

- Crear API calls con `useQuery` / `useMutation`
- Query key factories
- Cache invalidation
- Patterns `mutate` vs `mutateAsync`

### **frontend-forms**

React Hook Form + Zod validation

- Schemas y validación
- Form submission con mutations
- Display de errores (client + API)
- Dynamic fields, conditional validation

### **frontend-error-handling**

Manejo centralizado de errores

- Toast automático (Sonner)
- ErrorBoundary setup
- Try-catch patterns
- RFC 7807 Problem Details structure

### **frontend-component-architecture**

Estructura y best practices

- Feature-first organization
- Naming conventions
- Code quality (KISS, early returns)
- Empty states, accessibility basics
- Performance patterns

### **frontend-testing**

Vitest testing patterns

- Unit tests, integration tests
- Mocking services y hooks
- Coverage requirements (60% MVP)
- Test organization

### **frontend-routing**

React Router v7 navigation

- Route constants
- `<Link>` vs `<NavLink>` vs `useNavigate`
- URL params, query strings
- Active states

### **frontend-financial-display**

Patterns visuales reutilizables

- Color semántico (ingreso/gasto/transferencia)
- Glassmorphism effects (`.glass-card`, `.glass-card-hover`)
- Typography financiera (`font-mono`, number glow)
- Formateo de montos y símbolos de moneda
- Hover states, timing de animaciones

### **frontend-reusable-components**

Componentes reutilizables compartidos

- IconBox (iconos con color/tamaño consistente)
- DeleteConfirmationDialog (UX de eliminación)
- ErrorAlert (errores inline)
- PlaceholderPage (features futuras)
- iconMap (registro de iconos)
- shadcn/ui vs custom components

---

## Stack Crítico

**Runtime:**

- React 19.1.1 + TypeScript 5.8.3 (strict mode)
- Vite 7.1.2

**Styling:**

- Tailwind CSS v4 (⚠️ nueva API: `@theme`, `@import "tailwindcss"`, formato `oklch`)
- shadcn/ui + Radix UI
- 📖 Ver `.github/instructions/tailwind.instructions.md`

**Data & State:**

- TanStack Query 5.90.6 (server state - PRIMARY)
- Axios 1.13.1 (HTTP client)
- Zustand 5.0.8 (client state - OPCIONAL)

**Forms & Validation:**

- React Hook Form 7.71.1 + Zod 4.3.6

**Routing:**

- React Router 7.9.5

**Testing:**

- Vitest + Testing Library
- Coverage mínimo: 60% MVP

**TypeScript:**

- Strict mode habilitado
- Named exports ONLY (NO default exports)
- 📖 Ver `.github/instructions/typescript.instructions.md`

---

## Quick Navigation

**Para preguntas específicas sobre:**

- API calls / data fetching → **frontend-data-fetching**
- Formularios / validación → **frontend-forms**
- Errores / toasts → **frontend-error-handling**
- Estructura / organización → **frontend-component-architecture**
- Tests → **frontend-testing**
- Navegación / rutas → **frontend-routing**
- **Estilos financieros / colores / glassmorphism → frontend-financial-display**
- TypeScript rules → `.github/instructions/typescript.instructions.md`
- Tailwind v4 → `.github/instructions/tailwind.instructions.md`

---

## Project Context

Ver `.github/copilot-instructions.md` para reglas generales del proyecto (scope de IA, convenciones, decisiones arquitectónicas).

---
