---
name: frontend-development
description: SmartPocket React 19 development overview and skill index. Lists available specialized skills for data fetching, forms, testing, routing, and architecture patterns. Use this for general frontend questions or to discover which specialized skill to use.
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
- TypeScript rules → `.github/instructions/typescript.instructions.md`
- Tailwind v4 → `.github/instructions/tailwind.instructions.md`

---

## Project Context

Ver `.github/copilot-instructions.md` para reglas generales del proyecto (scope de IA, convenciones, decisiones arquitectónicas).

---
