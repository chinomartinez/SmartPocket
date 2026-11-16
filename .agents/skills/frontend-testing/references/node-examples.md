# Ejemplos de tests node

Patrones concretos para el setup actual: Vitest en `node`, sin DOM.

## Service: `accountService`

```typescript
import { describe, expect, it, vi } from "vitest";
import type { ApiResponse } from "@/api/types";
import type { PagedListResponse } from "@/api/services/shared/sharedTypes";
import { spApiClient } from "@/api/spApiClient";
import { accountService } from "./accountService";
import type { AccountCreateCommand, AccountGetDTO } from "./accountTypes";

vi.mock("@/api/spApiClient", () => ({
  spApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const account: AccountGetDTO = {
  id: 1,
  name: "Caja",
  icon: { code: "wallet", colorHex: "#FFFFFF" },
  currency: { code: "ARS", name: "Peso argentino", symbol: "$" },
  balance: 1000,
  includeInBalanceGlobal: true,
  createdAt: "2026-01-01",
  isPrincipal: true,
};

describe("accountService", () => {
  it("getAll devuelve el array de la respuesta paginada", async () => {
    // Arrange
    const response: ApiResponse<PagedListResponse<AccountGetDTO>> = {
      data: { page: 1, pageSize: 10, totalCount: 1, data: [account] },
      status: 200,
      statusText: "OK",
      headers: {},
    };
    vi.mocked(spApiClient.get).mockResolvedValue(response);

    // Act
    const result = await accountService.getAll();

    // Assert
    expect(spApiClient.get).toHaveBeenCalledWith("/accounts");
    expect(result).toEqual([account]);
  });

  it("create envía el comando y devuelve el id", async () => {
    // Arrange
    const command: AccountCreateCommand = {
      name: "Caja",
      icon: { code: "wallet", colorHex: "#FFFFFF" },
      currencyCode: "ARS",
      balance: 0,
      includeInBalanceGlobal: true,
    };
    const response: ApiResponse<{ id: number }> = {
      data: { id: 7 },
      status: 201,
      statusText: "Created",
      headers: {},
    };
    vi.mocked(spApiClient.post).mockResolvedValue(response);

    // Act
    const result = await accountService.create(command);

    // Assert
    expect(spApiClient.post).toHaveBeenCalledWith("/accounts", command);
    expect(result).toEqual({ id: 7 });
  });

  it("delete llama al endpoint con el id", async () => {
    // Arrange
    const response: ApiResponse<void> = {
      data: undefined,
      status: 204,
      statusText: "No Content",
      headers: {},
    };
    vi.mocked(spApiClient.delete).mockResolvedValue(response);

    // Act
    await accountService.delete(5);

    // Assert
    expect(spApiClient.delete).toHaveBeenCalledWith("/accounts/5");
  });
});
```

## Error handler: función pura

```typescript
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { describe, expect, it } from "vitest";
import { handleApiError } from "./errorHandler";

function createResponse(status: number, data: unknown): AxiosResponse {
  return {
    status,
    statusText: "",
    data,
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };
}

describe("handleApiError", () => {
  it("mapea un 400 con errores de validación", () => {
    // Arrange
    const error = new AxiosError(
      "Validation",
      "400",
      undefined,
      undefined,
      createResponse(400, { errors: { name: ["Requerido"] } }),
    );

    // Act
    const result = handleApiError(error);

    // Assert
    expect(result.statusCode).toBe(400);
    expect(result.errors).toEqual({ name: ["Requerido"] });
  });

  it("mapea un error de red desconocido", () => {
    // Arrange
    const error = new Error("boom");

    // Act
    const result = handleApiError(error);

    // Assert
    expect(result).toEqual({ message: "Ocurrió un error inesperado." });
  });
});
```

No uses `as any`; si el tipo de Axios es incómodo, un helper tipado evita el cast en cada test.

## Utilidades con `it.each`

```typescript
import { describe, expect, it } from "vitest";
import { formatCurrency } from "./formatters";

describe("formatCurrency", () => {
  it.each([
    [0, "$ 0"],
    [1000, "$ 1.000"],
    [123.456, "$ 123"],
  ])("formatea %s como %s", (amount, expected) => {
    expect(formatCurrency(amount)).toBe(expected);
  });
});
```

## Fechas con timers falsos

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { todayDateOnly } from "./dateHelpers";

describe("todayDateOnly", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("devuelve el día local a las 22:30", () => {
    vi.setSystemTime(new Date(2026, 9, 21, 22, 30, 0));

    expect(todayDateOnly()).toBe("2026-10-21");
  });
});
```

## Schema Zod

```typescript
import { describe, expect, it } from "vitest";
import { accountSchema } from "./accountSchema";

describe("accountSchema", () => {
  it("rechaza un nombre vacío", () => {
    // Arrange
    const input = {
      name: "",
      icon: { code: "wallet", colorHex: "#FFFFFF" },
      currencyCode: "ARS",
      balance: 0,
      includeInBalanceGlobal: true,
    };

    // Act
    const result = accountSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "name")).toBe(true);
    }
  });
});
```

## Mock de una librería externa

Si el código bajo prueba dispara un toast, mockeá la librería y verificá el contrato:

```typescript
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
```

Esto se vuelve relevante cuando existan tests de hooks o componentes; hoy no hay stack DOM.

## Reglas de higiene

- `vi.mock` va arriba; Vitest lo hoistea.
- Si necesitás una variable compartida en el factory, usá `vi.hoisted`.
- `vi.clearAllMocks()` en `beforeEach` si reutilizás mocks.
- `vi.useRealTimers()` en `afterEach` si usás fake timers.
- No mockees `axios` directamente: mockeá `spApiClient`.
- No testees la implementación de `spApiClient` desde un service.
