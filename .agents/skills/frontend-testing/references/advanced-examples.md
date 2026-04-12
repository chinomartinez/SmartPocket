# Integration Test Examples

Ejemplos completos de tests end-to-end para flows complejos en SmartPocket.

---

## Create Account → Shows in List

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
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });

    // Mock: empty list initially
    vi.mocked(accountService.getAll).mockResolvedValue([]);

    render(
      <QueryClientProvider client={queryClient}>
        <AccountsPage />
      </QueryClientProvider>
    );

    // Verify empty state
    expect(await screen.findByText(/no accounts/i)).toBeInTheDocument();

    // Open create form
    await user.click(screen.getByRole("button", { name: /create account/i }));

    // Fill form
    await user.type(screen.getByLabelText(/name/i), "Savings");
    await user.type(screen.getByLabelText(/balance/i), "1000");

    // Mock create success + updated list
    const newAccount = { id: 1, name: "Savings", balance: 1000 };
    vi.mocked(accountService.create).mockResolvedValue(newAccount);
    vi.mocked(accountService.getAll).mockResolvedValue([newAccount]);

    // Submit form
    await user.click(screen.getByRole("button", { name: /submit/i }));

    // Verify account appears in list
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

## Mutation with Optimistic Update

```typescript
// src/features/transactions/createTransaction.integration.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TransactionForm } from "./TransactionForm";
import { transactionService } from "@/api/services/transactions/transactionService";
import { toast } from "sonner";

vi.mock("@/api/services/transactions/transactionService");
vi.mock("sonner");

describe("Transaction creation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("shows success toast and invalidates cache", async () => {
    const user = userEvent.setup();
    const mockTransaction = { id: 1, amount: 100, description: "Groceries" };

    vi.mocked(transactionService.create).mockResolvedValue(mockTransaction);

    render(
      <QueryClientProvider client={queryClient}>
        <TransactionForm />
      </QueryClientProvider>
    );

    // Fill form
    await user.type(screen.getByLabelText(/amount/i), "100");
    await user.type(screen.getByLabelText(/description/i), "Groceries");
    await user.click(screen.getByRole("button", { name: /save/i }));

    // Verify mutation called
    await waitFor(() => {
      expect(transactionService.create).toHaveBeenCalledWith({
        amount: 100,
        description: "Groceries",
      });
    });

    // Verify success toast shown
    expect(toast.success).toHaveBeenCalledWith("Transaction created");
  });

  it("shows error toast on failure", async () => {
    const user = userEvent.setup();

    vi.mocked(transactionService.create).mockRejectedValue(
      new Error("Network error")
    );

    render(
      <QueryClientProvider client={queryClient}>
        <TransactionForm />
      </QueryClientProvider>
    );

    await user.type(screen.getByLabelText(/amount/i), "100");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Network error");
    });
  });
});
```

---

## Global Error Handler Test

```typescript
// test/queryClient.integration.test.tsx
import { describe, it, expect, vi } from "vitest";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

vi.mock("sonner");

describe("QueryClient global error handling", () => {
  it("shows toast on query error", async () => {
    const queryCache = new QueryCache({
      onError: (error) => {
        toast.error(error.message);
      },
    });

    const queryClient = new QueryClient({ queryCache });

    // Trigger error manually
    const mockError = new Error("Failed to fetch data");
    queryCache.config.onError?.(mockError, {} as any);

    expect(toast.error).toHaveBeenCalledWith("Failed to fetch data");
  });
});
```
