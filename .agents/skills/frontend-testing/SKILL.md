---
name: frontend-testing
description: Patrones de testing con Vitest para SmartPocket React app. Usar al escribir tests, mockear servicios, testear hooks, configurar coverage, u organizar tests. Incluye patterns de mock para TanStack Query y toast libraries.
---

# SmartPocket - Testing (Vitest)

Patrones de testing con Vitest para SmartPocket React app.

---

## When to Use This Skill

- Escribir unit tests
- Escribir integration tests
- Mocking services (API, TanStack Query)
- Testing hooks personalizados
- Coverage requirements y CI setup
- Debugging test failures
- Test organization (dónde poner tests)

---

## Test Organization

**Regla:** Tests viven **junto al archivo** que testean, con sufijo `.test.ts(x)`.

```
src/utils/formatters.ts
src/utils/formatters.test.ts  ← Test aquí

src/features/accounts/AccountCard.tsx
src/features/accounts/AccountCard.test.tsx  ← Test aquí
```

**NO crear carpeta `__tests__/` separada**. Co-location facilita navegación.

---

## Coverage Requirements

**Mínimo MVP:** 60% coverage global

**Prioridades por tipo:**

| Tipo              | Coverage Mínimo | Razón                                           |
| ----------------- | --------------- | ----------------------------------------------- |
| **Utils/Helpers** | 80%+            | Funciones puras, fácil testear, alto impacto    |
| **Services**      | 70%+            | Lógica crítica de API                           |
| **Hooks**         | 60%+            | Data fetching, menos crítico con TanStack Query |
| **Components**    | 50%+            | UI menos crítico en MVP, costoso testear        |

**Comando:**

```bash
npm run test:coverage
```

---

## Mock Patterns

### Patrón Universal: Service + Hook + Component

Ejemplo integral que muestra el flujo completo de testing con TanStack Query:

```typescript
// src/features/accounts/AccountList.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { accountService } from "@/api/services/accounts/accountService";
import { AccountList } from "./AccountList";
import { useAccounts } from "./useAccounts";

// 1. Mock del service
vi.mock("@/api/services/accounts/accountService", () => ({
  accountService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// 2. Helper para QueryClient (reusable en todos los tests)
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("AccountList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 3. Test component - happy path
  it("renders accounts from API", async () => {
    const mockAccounts = [
      { id: 1, name: "Savings", balance: 1000 },
      { id: 2, name: "Checking", balance: 500 },
    ];
    vi.mocked(accountService.getAll).mockResolvedValue(mockAccounts);

    render(<AccountList />, { wrapper: createWrapper() });

    expect(await screen.findByText("Savings")).toBeInTheDocument();
    expect(await screen.findByText("Checking")).toBeInTheDocument();
  });

  // 4. Test component - error case
  it("shows error when API fails", async () => {
    vi.mocked(accountService.getAll).mockRejectedValue(new Error("API Error"));
    render(<AccountList />, { wrapper: createWrapper() });
    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  // 5. Test hook directly
  it("hook fetches data successfully", async () => {
    const mockAccounts = [{ id: 1, name: "Savings", balance: 1000 }];
    vi.mocked(accountService.getAll).mockResolvedValue(mockAccounts);

    const { result } = renderHook(() => useAccounts(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockAccounts);
  });
});
```

**Para toast mocking:**

```typescript
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
import { toast } from "sonner";

it("shows success toast", async () => {
  // ... trigger action ...
  expect(toast.success).toHaveBeenCalledWith("Account created");
});
```

---

## Testing Utilities

### Pure Functions

```typescript
// src/utils/formatCurrency.test.ts
import { describe, it, expect } from "vitest";
import { formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
  it("formats positive numbers", () => {
    expect(formatCurrency(1000)).toBe("$1,000.00");
  });

  it("formats negative numbers", () => {
    expect(formatCurrency(-500)).toBe("-$500.00");
  });

  it("handles custom currency", () => {
    expect(formatCurrency(100, "€")).toBe("€100.00");
  });
});
```

### Components con User Interaction

```typescript
// src/features/accounts/AccountForm.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountForm } from "./AccountForm";

describe("AccountForm", () => {
  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AccountForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/name/i), "Savings Account");
    await user.type(screen.getByLabelText(/balance/i), "1000");
    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Savings Account",
      balance: 1000,
    });
  });

  it("shows validation errors", async () => {
    const user = userEvent.setup();
    render(<AccountForm />);
    await user.click(screen.getByRole("button", { name: /create/i }));
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });
});
```

---

## Test Helpers

**Setup file (`test/setup.ts`):**

```typescript
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

**Mock factories (optional):**

```typescript
// test/factories/accountFactory.ts
export function createMockAccount(overrides?: Partial<Account>): Account {
  return { id: 1, name: "Savings", balance: 1000, ...overrides };
}
```

---

## Integration Tests

Para flows end-to-end complejos, ver [ejemplos avanzados](./references/advanced-examples.md).

**Pattern básico:**

```typescript
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

render(
  <QueryClientProvider client={queryClient}>
    <Page />
  </QueryClientProvider>
);

// Interactuar con UI, verificar cambios en estado
await user.click(screen.getByRole("button", { name: /create/i }));
expect(await screen.findByText("Success")).toBeInTheDocument();
```

---

## Anti-Patterns Críticos

| ❌ Anti-Pattern                | ✅ Solución                                           | Razón                                             |
| ------------------------------ | ----------------------------------------------------- | ------------------------------------------------- |
| No limpiar mocks entre tests   | `beforeEach(() => vi.clearAllMocks())`                | Mocks persisten entre tests causando side effects |
| Testing implementation details | Testear output visible (`screen.getByRole("dialog")`) | No testear state/props internos                   |
| Snapshot tests excesivos       | Assertions específicas (`getByText`, `getByRole`)     | Snapshots frágiles, poco útiles                   |
| No await async ops             | `await screen.findBy*()` o `waitFor()`                | Evitar race conditions                            |
| Mock después de import         | Mover `vi.mock()` antes de imports                    | Hoisting de mocks necesario                       |
| No wrappear con QueryClient    | Crear `wrapper` con `QueryClientProvider`             | TanStack Query requiere provider                  |

---

## Troubleshooting

| Problema                                   | Causa                        | Solución                                        |
| ------------------------------------------ | ---------------------------- | ----------------------------------------------- |
| "Cannot find module" en tests              | Path alias no configurado    | Configurar `vitest.config.ts` con resolve.alias |
| Tests pasan individualmente, fallan juntos | Mocks no limpiados           | Agregar `vi.clearAllMocks()` en `beforeEach`    |
| "Act" warning                              | Async state update sin await | Usar `await screen.findBy*()` o `waitFor()`     |
| Mock no funciona                           | Mock después de import       | Mover `vi.mock()` antes de imports              |
| QueryClient error en tests                 | No wrappear con provider     | Crear wrapper con `QueryClientProvider`         |
| Coverage bajo en components                | UI no es crítico             | Priorizar utils/services, no forzar 100%        |

---

## Configuración

Ver [vitest.config.ts](../../../webapp/vitest.config.ts) para la configuración completa del proyecto.

---

## References

- [Vitest Docs](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- SmartPocket: Ver tests existentes en `webapp/src/features/`

**Comandos:** `npm run test`, `npm run test:coverage`, `npm run test:watch`

---
