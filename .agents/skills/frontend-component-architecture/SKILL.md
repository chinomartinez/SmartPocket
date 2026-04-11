---
name: frontend-component-architecture
description: "Component structure and best practices for SmartPocket React app. **Use when** organizing features, naming files/folders, implementing code quality patterns (KISS, early returns, DRY), handling empty states, conditional rendering, accessibility basics, or troubleshooting re-renders and structure issues. Includes performance anti-patterns and React.memo patterns."
argument-hint: 'Component name or area (e.g., "AccountCard" or "empty states")'
---

# SmartPocket - Component Architecture & Best Practices

Estructura de componentes, naming conventions, code quality principles, y accessibility basics para SmartPocket React app.

---

## When to Use This Skill

- Organizar features y componentes
- Naming conventions (files, folders, variables)
- Feature-first architecture
- Code quality patterns (KISS, early returns, DRY)
- Empty states y conditional rendering
- Accessibility basics (semantic HTML, ARIA)
- Performance optimization (memo, callbacks)
- Troubleshooting re-renders o structure issues

---

## Feature-First Structure (Flat by Default)

### Filosofía

**Mantener FLAT por defecto**. Solo organizar en subcarpetas si el conteo de archivos dificulta navegación visual (>10 archivos).

```
src/features/{feature}/
  ├── ComponentName.tsx       # PascalCase
  ├── useEntity.ts            # camelCase (hooks)
  ├── entityTypes.ts          # camelCase (types/interfaces)
  ├── entityService.ts        # camelCase (API service)
  ├── entitySchema.ts         # camelCase (Zod schemas)
  └── helpers.ts              # camelCase (utils específicos)
```

**Ejemplo real:**

```
src/features/accounts/
  ├── AccountCard.tsx
  ├── AccountForm.tsx
  ├── AccountList.tsx
  ├── useAccounts.ts
  ├── accountTypes.ts
  ├── accountService.ts
  ├── accountSchema.ts
  └── formatAccountBalance.ts
```

### Cuándo crear subcarpetas

Si feature crece >10 archivos, organizar por tipo:

```
src/features/transactions/
  ├── components/
  │   ├── TransactionCard.tsx
  │   ├── TransactionForm.tsx
  │   └── TransactionFilters.tsx
  ├── hooks/
  │   ├── useTransactions.ts
  │   └── useTransactionFilters.ts
  ├── types/
  │   └── transactionTypes.ts
  └── utils/
      └── formatTransaction.ts
```

**Regla:** Refactorizar cuando sea necesario, NO en anticipación.

---

## Naming Conventions

| Elemento             | Convención               | Ejemplo                    | Razón                 |
| -------------------- | ------------------------ | -------------------------- | --------------------- |
| **Components**       | PascalCase               | `AccountCard.tsx`          | React convention      |
| **Hooks**            | camelCase + `use` prefix | `useAccounts.ts`           | React convention      |
| **Types/Interfaces** | PascalCase               | `ApiError`, `Account`      | TypeScript convention |
| **Functions**        | camelCase                | `formatCurrency()`         | JavaScript convention |
| **Variables**        | camelCase                | `accountBalance`           | JavaScript convention |
| **Constants**        | UPPER_SNAKE_CASE         | `MAX_ITEMS`, `API_TIMEOUT` | Distinguir magias     |
| **Files**            | camelCase                | `accountService.ts`        | Consistencia          |
| **Folders**          | camelCase                | `src/features/accounts/`   | Consistencia          |

---

## Code Quality Principles

### KISS (Keep It Simple, Stupid)

**Filosofía:** Solución más simple que funciona es la mejor.

**Reglas KISS:**

- NO abstraer hasta que haya 3+ casos de uso similares
- NO crear clases si functions bastan
- NO patterns complejos (Factory, Builder) para app personal
- Refactorizar cuando duele, NO en anticipación

```typescript
// ✅ Simple function > clase compleja
function createAccount(data: AccountFormValues): Account {
  return { ...data, createdAt: new Date() };
}
```

### Early Returns

Evitar nesting profundo. Salir temprano para casos edge.

```typescript
// ✅ Early returns - limpio y legible
function AccountCard({ account }: { account?: Account }) {
  if (!account) return <Skeleton />;
  if (!account.isActive) return <InactiveAccountBadge />;
  if (account.balance === 0) return <ZeroBalanceWarning />;

  return <div>{account.name}</div>;
}
```

**Pattern para components:**

```typescript
function Component() {
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorAlert error={error} />;
  if (!data) return null;
  if (!data.length) return <EmptyState />;

  return <SuccessView data={data} />;
}
```

### No Magic Numbers

Usar constants con nombres descriptivos.

```typescript
// ✅ Constants nombradas
const MAX_VISIBLE_TRANSACTIONS = 10;
const TRANSACTION_LIMIT_WARNING = 50;

function TransactionList() {
  const slice = transactions.slice(0, MAX_VISIBLE_TRANSACTIONS);
  if (transactions.length > TRANSACTION_LIMIT_WARNING) {
    // Claro que es un límite de warning
  }
}
```

---

## Empty States & Conditional Rendering

**SIEMPRE manejar:**

- Loading states (`isLoading`)
- Error states (`error`)
- Empty data (`!data`, `data.length === 0`)
- Null/undefined (`!item`)

### Pattern completo

```typescript
function AccountList() {
  const { data: accounts, isLoading, error } = useAccounts();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorAlert error={error} />;
  if (!accounts) return null; // Defensive - no debería pasar
  if (accounts.length === 0) return <EmptyState />;

  return (
    <div>
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
    </div>
  );
}
```

### Empty State component

```typescript
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-muted-foreground mt-2">{description}</p>}
      {action && <Button onClick={action.onClick} className="mt-4">{action.label}</Button>}
    </div>
  );
}
```

### Safe access con optional chaining

```typescript
// ❌ MAL - crash si account es undefined
const name = account.name;
const balance = account.currency.symbol;
```

```typescript
// ✅ BIEN - safe access
const name = account?.name;
const balance = account?.currency?.symbol ?? "$"; // Con fallback
```

---

## Accessibility (Básico MVP)

### Semantic HTML

Usar elementos HTML semánticos, NO `<div>` genérico para todo.

```typescript
// ❌ MAL - divs genéricos
<div onClick={handleClick}>Click me</div>
<div className="nav">
  <div onClick={() => navigate('/accounts')}>Accounts</div>
</div>
```

```typescript
// ✅ BIEN - elementos semánticos
<button onClick={handleClick}>Click me</button>
<nav>
  <Link to="/accounts">Accounts</Link>
</nav>
```

**Elementos clave:**

- `<nav>` - Navegación principal
- `<main>` - Contenido principal
- `<article>` - Contenido independiente (posts, cards)
- `<section>` - Secciones temáticas
- `<button>` - Acciones interactivas
- `<a>` / `<Link>` - Navegación

### Button vs Link

**Regla clara:**

- **`<button>`** - Acciones que NO cambian URL (submit, modal, toggle, delete)
- **`<Link>`** - Navegación que CAMBIA URL (ir a otra página)

```typescript
// ✅ Button para acciones
<button onClick={() => setModalOpen(true)}>Open Modal</button>
<button onClick={handleDelete}>Delete</button>
<button type="submit">Submit Form</button>

// ✅ Link para navegación
<Link to="/accounts">View Accounts</Link>
<Link to={`/transactions/${id}`}>View Details</Link>
```

### Alt text para imágenes

```typescript
// ❌ MAL - sin alt
<img src={icon} />

// ✅ BIEN - alt descriptivo
<img src={icon} alt={`${account.name} icon`} />
<img src={logo} alt="SmartPocket logo" />
```

### ARIA labels (cuando sea necesario)

```typescript
// Para iconos sin texto
<button aria-label="Delete account" onClick={handleDelete}>
  <TrashIcon />
</button>

// Para modals
<Dialog aria-labelledby="modal-title" aria-describedby="modal-description">
  <DialogTitle id="modal-title">Create Account</DialogTitle>
  <DialogDescription id="modal-description">
    Enter account details below
  </DialogDescription>
</Dialog>
```

---

## Anti-Patterns Críticos

Ver [Anti-Patterns detallados](./references/anti-patterns.md) para ejemplos completos y explicaciones profundas.

**Quick reference:**

- ❌ **Non-null assertions sin validación** - `account!.name` crash si undefined
- ❌ **Uso de `any` type** - Rompe type safety completamente
- ❌ **Inline function props** - Re-renders innecesarios en lists
- ❌ **Missing React.memo** - Components expensive sin optimización
- ❌ **Destructuring excesivo** - Dificulta debug y lectura
- ❌ **Mutation de state** - React no detecta cambios

```typescript
// ✅ Safe access pattern
const account = accounts.find((a) => a.id === id);
if (!account) return null;
return account.name;

// ✅ React.memo para expensive components
export const ExpensiveCard = memo(function ExpensiveCard({ account }: Props) {
  return <div>{/* ... */}</div>;
});
```

---

## Troubleshooting

| Problema                              | Causa                          | Solución                                |
| ------------------------------------- | ------------------------------ | --------------------------------------- |
| Re-renders excesivos                  | Inline functions, missing memo | Extract callbacks, usar `useCallback`   |
| "Cannot read property of undefined"   | Acceso directo sin check       | Optional chaining `?.` o early return   |
| Component no actualiza                | Mutation de state              | Crear nuevo object/array (immutability) |
| Key warning en console                | Falta `key` prop en list       | Agregar `key={item.id}`                 |
| TypeScript error "possibly undefined" | No manejar null/undefined      | Agregar check: `if (!data) return null` |
| Accesibilidad warning                 | Div con onClick                | Cambiar a `<button>`                    |

---

## Component Composition Patterns

Ver [Component Patterns](./references/component-patterns.md) para patterns avanzados de composición.

**Patterns disponibles:**

- **Container/Presentational** - Separar lógica (data fetching) de UI
- **Compound Components** - Composición flexible (shadcn pattern)
- **Render Props** - Control de render vía función
- **HOC** (legacy) - Preferir hooks en código nuevo

---

## References

- [React Docs - Components](https://react.dev/learn/your-first-component)
- [React Docs - Accessibility](https://react.dev/learn/accessibility)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- SmartPocket: [Feature structure](webapp/src/features/accounts/)

---
