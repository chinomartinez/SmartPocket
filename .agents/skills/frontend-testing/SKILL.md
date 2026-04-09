---
name: frontend-testing
description: Vitest testing patterns for SmartPocket React app. Use when writing tests, mocking services, testing hooks, coverage requirements, or setting up test organization. Includes mock patterns for TanStack Query and toast libraries.
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

### Service Mocking (API calls)

```typescript
// src/features/accounts/AccountList.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { accountService } from "@/api/services/accounts/accountService";
import { AccountList } from "./AccountList";

// Mock del service
vi.mock("@/api/services/accounts/accountService", () => ({
  accountService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("AccountList", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Limpiar mocks entre tests
  });

  it("renders accounts from API", async () => {
    const mockAccounts = [
      { id: 1, name: "Savings", balance: 1000 },
      { id: 2, name: "Checking", balance: 500 },
    ];

    // Configurar mock response
    vi.mocked(accountService.getAll).mockResolvedValue(mockAccounts);

    render(<AccountList />);

    // Assertions
    expect(await screen.findByText("Savings")).toBeInTheDocument();
    expect(await screen.findByText("Checking")).toBeInTheDocument();
    expect(accountService.getAll).toHaveBeenCalledTimes(1);
  });

  it("shows error when API fails", async () => {
    vi.mocked(accountService.getAll).mockRejectedValue(new Error("API Error"));

    render(<AccountList />);

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });
});
```

### Hook Testing (useTanStackQuery)

```typescript
// src/features/accounts/useAccounts.test.ts
import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAccounts } from "./useAccounts";
import { accountService } from "@/api/services/accounts/accountService";

vi.mock("@/api/services/accounts/accountService");

// Helper para wrappear hooks con QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }, // Deshabilitar retry en tests
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useAccounts", () => {
  it("fetches accounts successfully", async () => {
    const mockAccounts = [{ id: 1, name: "Savings", balance: 1000 }];
    vi.mocked(accountService.getAll).mockResolvedValue(mockAccounts);

    const { result } = renderHook(() => useAccounts(), {
      wrapper: createWrapper(),
    });

    // Esperar a que query complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockAccounts);
    expect(accountService.getAll).toHaveBeenCalledTimes(1);
  });

  it("handles errors", async () => {
    vi.mocked(accountService.getAll).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useAccounts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
```

### Toast Mocking (Sonner)

```typescript
// Si tests manuales de toast (raro - toast automático se testea en integration)
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

import { toast } from "sonner";

it("shows success toast after create", async () => {
  // ... test logic ...
  expect(toast.success).toHaveBeenCalledWith("Account created");
});
```

### TanStack Query MutationCache Mock (global error handling)

```typescript
// Testear que error handling global funciona
import { QueryCache, QueryClient } from "@tanstack/react-query";

it("shows toast on query error (global handler)", async () => {
  const queryCache = new QueryCache({
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const queryClient = new QueryClient({ queryCache });

  // ... render with queryClient ...
  // ... trigger error ...

  expect(toast.error).toHaveBeenCalledWith("Failed to fetch data");
});
```

---

## Testing Utilities

### Pure Functions (easiest)

```typescript
// src/utils/formatCurrency.test.ts
import { describe, it, expect } from "vitest";
import { formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
  it("formats positive numbers correctly", () => {
    expect(formatCurrency(1000)).toBe("$1,000.00");
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats negative numbers with minus sign", () => {
    expect(formatCurrency(-500)).toBe("-$500.00");
  });

  it("handles decimals", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("uses custom currency symbol", () => {
    expect(formatCurrency(100, "€")).toBe("€100.00");
  });
});
```

### Components con user interaction

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

    // Fill form
    await user.type(screen.getByLabelText(/name/i), "Savings Account");
    await user.type(screen.getByLabelText(/balance/i), "1000");

    // Submit
    await user.click(screen.getByRole("button", { name: /create/i }));

    // Assert
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Savings Account",
      balance: 1000,
    });
  });

  it("shows validation error for empty name", async () => {
    const user = userEvent.setup();
    render(<AccountForm />);

    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });
});
```

---

## Test Helpers

### Setup file (`test/setup.ts`)

```typescript
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest matchers
expect.extend(matchers);

// Cleanup después de cada test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

### Mock factories (reusable)

```typescript
// test/factories/accountFactory.ts
import type { Account } from "@/api/services/accounts/types";

export function createMockAccount(overrides?: Partial<Account>): Account {
  return {
    id: 1,
    name: "Savings Account",
    balance: 1000,
    currencyId: 1,
    currency: { id: 1, code: "USD", symbol: "$" },
    iconId: 1,
    colorHex: "#3B82F6",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// Uso
const account = createMockAccount({ balance: 5000 });
```

---

## Integration Tests

Para flows complejos (ej: create account → shows in list):

```typescript
// src/features/accounts/accounts.integration.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AccountsPage } from "./AccountsPage";
import { accountService } from "@/api/services/accounts/accountService";

vi.mock("@/api/services/accounts/accountService");

describe("Accounts integration", () => {
  it("creates account and shows in list", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Mock inicial: lista vacía
    vi.mocked(accountService.getAll).mockResolvedValue([]);

    render(
      <QueryClientProvider client={queryClient}>
        <AccountsPage />
      </QueryClientProvider>
    );

    // Empty state
    expect(await screen.findByText(/no accounts/i)).toBeInTheDocument();

    // Open create form
    await user.click(screen.getByRole("button", { name: /create account/i }));

    // Fill form
    await user.type(screen.getByLabelText(/name/i), "Savings");
    await user.type(screen.getByLabelText(/balance/i), "1000");

    // Mock create success
    const newAccount = { id: 1, name: "Savings", balance: 1000 };
    vi.mocked(accountService.create).mockResolvedValue(newAccount);

    // Mock getAll después de create
    vi.mocked(accountService.getAll).mockResolvedValue([newAccount]);

    // Submit
    await user.click(screen.getByRole("button", { name: /submit/i }));

    // Esperar a que aparezca en lista
    await waitFor(() => {
      expect(screen.getByText("Savings")).toBeInTheDocument();
    });

    expect(accountService.create).toHaveBeenCalledWith({
      name: "Savings",
      balance: 1000,
    });
  });
});
```

---

## Anti-Patterns Críticos

### ❌ No limpiar mocks entre tests

```typescript
// ❌ MAL - mocks persisten entre tests
describe("Tests", () => {
  it("test 1", () => {
    vi.mocked(service.get).mockResolvedValue(data1);
    // ...
  });

  it("test 2", () => {
    // service.get TODAVÍA retorna data1 del test anterior
  });
});
```

```typescript
// ✅ BIEN - limpiar en beforeEach
describe("Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("test 1", () => {
    vi.mocked(service.get).mockResolvedValue(data1);
    // ...
  });

  it("test 2", () => {
    vi.mocked(service.get).mockResolvedValue(data2); // Independiente
    // ...
  });
});
```

### ❌ Testing implementation details

```typescript
// ❌ MAL - testear useState interno
expect(component.state.isOpen).toBe(true);
```

```typescript
// ✅ BIEN - testear output visible
expect(screen.getByRole("dialog")).toBeInTheDocument();
```

### ❌ Snapshot tests excesivos

```typescript
// ❌ MAL - snapshot frágil, poco útil
expect(container).toMatchSnapshot();
```

```typescript
// ✅ BIEN - assertions específicas
expect(screen.getByText("Savings Account")).toBeInTheDocument();
expect(screen.getByText("$1,000.00")).toBeInTheDocument();
```

### ❌ No esperar async operations

```typescript
// ❌ MAL - assertion antes de que data cargue
render(<AccountList />);
expect(screen.getByText("Savings")).toBeInTheDocument(); // Falla
```

```typescript
// ✅ BIEN - esperar con findBy o waitFor
render(<AccountList />);
expect(await screen.findByText("Savings")).toBeInTheDocument();
```

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

## Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "test/",
        "**/*.test.{ts,tsx}",
        "**/*.config.{ts,js}",
        "**/types.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

---

## Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run coverage report
npm run test:coverage

# Run specific file
npm run test AccountList.test.tsx

# Run tests matching pattern
npm run test -- --grep "creates account"
```

---

## References

- [Vitest Docs](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- SmartPocket: [Example test](webapp/src/features/accounts/AccountList.test.tsx)

---
