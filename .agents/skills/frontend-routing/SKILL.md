---
name: frontend-routing
description: Patrones de navegación con React Router v7 para SmartPocket. Usar al implementar navegación, rutas, links, estados activos, constantes de rutas, o trabajar con React Router. Incluye anti-patterns de Link vs button.
---

# SmartPocket - Routing (React Router v7)

Patrones de navegación con React Router 7.9.5 para SmartPocket React app.

---

## When to Use This Skill

- Configurar rutas (route definitions)
- Navegación entre páginas (`<Link>`, `useNavigate`)
- Active state en navegación
- Route constants (centralización)
- Nested routes (layouts)
- Protected routes (authentication - post-MVP)
- Programmatic navigation
- Query params y URL state
- Troubleshooting routing issues

---

## Route Constants (Centralizado)

**SIEMPRE definir rutas como constants.** NO hardcodear strings.

```typescript
// src/router/routes.ts
export const ROUTES = {
  HOME: "/",
  ACCOUNTS: "/accounts",
  ACCOUNT_DETAIL: "/accounts/:id",
  TRANSACTIONS: "/transactions",
  TRANSACTION_DETAIL: "/transactions/:id",
  CATEGORIES: "/categories",
  SETTINGS: "/settings",
} as const;
```

**Beneficios:**

- Type-safe (autocompletado en IDE)
- Refactoring fácil (cambiar en un solo lugar)
- Evita typos (`/accoutns` → error en tiempo de compilación)
- Búsqueda global funciona (cmd+click en IDE)

---

## Navigation Patterns

### `<Link>` para navegación (default)

**Regla:** SIEMPRE usar `<Link>` para cambios de URL.

```typescript
import { Link } from "react-router-dom";
import { ROUTES } from "@/router/routes";

function Sidebar() {
  return (
    <nav>
      <Link to={ROUTES.HOME}>Home</Link>
      <Link to={ROUTES.ACCOUNTS}>Accounts</Link>
      <Link to={ROUTES.TRANSACTIONS}>Transactions</Link>
    </nav>
  );
}
```

**Con parámetros dinámicos:**

```typescript
<Link to={`/accounts/${account.id}`}>View Account</Link>

// O con constant template
<Link to={ROUTES.ACCOUNT_DETAIL.replace(":id", String(account.id))}>
  View Account
</Link>
```

### `useNavigate` para navegación programática

Solo usar cuando navegación **NO es acción directa del usuario** (ej: redirect después de submit).

```typescript
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/router/routes";

function AccountForm() {
  const navigate = useNavigate();
  const createMutation = useCreateAccount();

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data, {
      onSuccess: (account) => {
        // ✅ Redirect programático después de crear
        navigate(ROUTES.ACCOUNT_DETAIL.replace(":id", String(account.id)));
      },
    });
  };
}
```

### ❌ Anti-Pattern: Button + navigate para links

```typescript
// ❌ MAL - button con navigate para link
<button onClick={() => navigate("/accounts")}>Go to Accounts</button>
```

**Por qué está mal:**

- Rompe semántica: buttons son para acciones, NO navegación
- Rompe UX: No permite cmd/ctrl+click to open in new tab
- Rompe accessibility: screen readers esperan `<a>` para links
- Rompe SEO: crawlers no siguen onClick events

```typescript
// ✅ BIEN - usar Link
<Link to={ROUTES.ACCOUNTS}>Go to Accounts</Link>

// ✅ O button SI hay acción adicional
<Button
  onClick={() => {
    saveData(); // Acción primero
    navigate(ROUTES.ACCOUNTS); // Luego navegar
  }}
>
  Save & Go to Accounts
</Button>
```

---

## Active State (NavLink)

Para mostrar qué ruta está activa (ej: sidebar).

```typescript
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/router/routes";

function Sidebar() {
  return (
    <nav>
      <NavLink
        to={ROUTES.ACCOUNTS}
        className={({ isActive }) =>
          cn("nav-link", isActive && "nav-link-active bg-blue-100 font-semibold")
        }
      >
        Accounts
      </NavLink>

      <NavLink
        to={ROUTES.TRANSACTIONS}
        className={({ isActive }) =>
          cn("nav-link", isActive && "nav-link-active bg-blue-100 font-semibold")
        }
      >
        Transactions
      </NavLink>
    </nav>
  );
}
```

**Key points:**

- `NavLink` recibe `isActive` boolean en className callback
- Usar `cn()` helper para conditional classes
- `isActive` es `true` si URL matches exactamente

---

## Route Configuration

```typescript
// src/router/AppRouter.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "@/layout/RootLayout";
import { ROUTES } from "./routes";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />, // Layout con Outlet
    children: [
      { path: ROUTES.HOME, element: <HomePage /> },
      { path: ROUTES.ACCOUNTS, element: <AccountsPage /> },
      { path: ROUTES.ACCOUNT_DETAIL, element: <AccountDetailPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
```

### Nested Routes (Layout)

```typescript
// src/layout/RootLayout.tsx
import { Outlet } from "react-router-dom";

export function RootLayout() {
  return (
    <>
      <Header />
      <Sidebar />
      <main>
        <Outlet /> {/* Routes hijos renderizan aquí */}
      </main>
    </>
  );
}
```

---

## URL Params & Query Strings

### URL Params (`:id`)

```typescript
// Route definition
{
  path: "/accounts/:id",
  element: <AccountDetailPage />,
}

// Leer param en component
import { useParams } from "react-router-dom";

function AccountDetailPage() {
  const { id } = useParams<{ id: string }>(); // Siempre string

  const accountId = Number(id); // Convertir a number si necesario
  const { data: account } = useAccount(accountId);

  return <div>{account?.name}</div>;
}
```

### Query Strings (`?filter=active`)

```typescript
import { useSearchParams } from "react-router-dom";

function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Leer params
  const filter = searchParams.get("filter"); // "active" | null
  const page = searchParams.get("page") ?? "1";

  // Actualizar params
  const updateFilter = (newFilter: string) => {
    setSearchParams({ filter: newFilter, page: "1" });
  };
}
```

---

## Programmatic Navigation Patterns

### Redirect después de acción

```typescript
function DeleteAccountButton({ accountId }: { accountId: number }) {
  const navigate = useNavigate();
  const deleteMutation = useDeleteAccount();

  const handleDelete = () => {
    deleteMutation.mutate(accountId, {
      onSuccess: () => {
        navigate(ROUTES.ACCOUNTS); // Volver a lista
        toast.success("Account deleted");
      },
    });
  };

  return <Button onClick={handleDelete}>Delete</Button>;
}
```

### Navigate con state (pasar data entre rutas)

```typescript
// Enviar state
navigate("/accounts/123", { state: { from: "create-flow" } });

// Leer state
import { useLocation } from "react-router-dom";
const location = useLocation();
const from = location.state?.from; // "create-flow"
```

### Navigate back (history)

```typescript
function BackButton() {
  const navigate = useNavigate();

  return <Button onClick={() => navigate(-1)}>Back</Button>;
}
```

---

## Protected Routes (Post-MVP)

Para authentication (diferido post-MVP):

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

---

## Anti-Patterns Críticos

### ❌ Button + navigate para links

```typescript
// ❌ MAL
<button onClick={() => navigate("/accounts")}>Go to Accounts</button>
```

```typescript
// ✅ BIEN
<Link to={ROUTES.ACCOUNTS}>Go to Accounts</Link>
```

### ❌ Hardcoded route strings

```typescript
// ❌ MAL - typo difícil de detectar
<Link to="/accoutns">Accounts</Link>

// ✅ BIEN - type-safe
<Link to={ROUTES.ACCOUNTS}>Accounts</Link>
```

### ❌ Usar `<a>` en vez de `<Link>`

```typescript
// ❌ MAL - full page reload
<a href="/accounts">Accounts</a>

// ✅ BIEN - SPA navigation
<Link to={ROUTES.ACCOUNTS}>Accounts</Link>
```

### ❌ State en URL sin search params

```typescript
// ❌ MAL - state local, se pierde en refresh
const [filter, setFilter] = useState("active");

// ✅ BIEN - state en URL, persistente
const [searchParams, setSearchParams] = useSearchParams();
const filter = searchParams.get("filter") ?? "all";
```

### ❌ Navigate en render (infinite loop)

```typescript
// ❌ MAL - navigate en render causa loop
function AccountDetail() {
  const { id } = useParams();
  if (!id) navigate(ROUTES.ACCOUNTS); // ❌ Cada render
}

// ✅ BIEN - navigate en useEffect
function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) navigate(ROUTES.ACCOUNTS);
  }, [id, navigate]);
}
```

---

## Troubleshooting

| Problema                       | Causa                           | Solución                              |
| ------------------------------ | ------------------------------- | ------------------------------------- |
| Full page reload en navegación | Usar `<a>` en vez de `<Link>`   | Cambiar a `<Link>`                    |
| Route no matchea               | Path string incorrecto          | Usar `ROUTES` constants               |
| Active state no funciona       | Usar `Link` en vez de `NavLink` | Cambiar a `NavLink`                   |
| Params undefined               | Acceso antes de router ready    | Agregar check: `if (!id) return null` |
| Query params no actualizan     | Modificar estado directo        | Usar `setSearchParams()`              |
| Navigate causa infinite loop   | Navigate en render              | Mover a `useEffect` o event handler   |

---

## Best Practices

1. **Centralizar routes** en `routes.ts`
2. **Usar `<Link>` por default**, `useNavigate` solo para programmatic
3. **`NavLink` para sidebar/nav** (active state)
4. **Query params para filtros/pagination** (URL shareable)
5. **Validate params** (`if (!id) return null`) para evitar crashes
6. **Layout con Outlet** para estructura consistente

---

## References

- [React Router v7 Docs](https://reactrouter.com/)
- [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)
- SmartPocket: [AppRouter.tsx](webapp/src/router/AppRouter.tsx)
- SmartPocket: [routes.ts](webapp/src/router/routes.ts)

---
