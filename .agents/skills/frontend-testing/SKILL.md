---
name: frontend-testing
description: Patrones de testing con Vitest 4 para la app React de SmartPocket en entorno node: funciones puras, schemas Zod, formateo de montos y fechas, manejo de errores y services con vi.mock. Úsala al escribir tests, mockear el cliente HTTP, usar it.each, organizar tests o decidir qué no testear. No cubre tests de componentes ni hooks porque el stack DOM no está instalado.
---

# Testing del frontend (Vitest)

Guía del setup real de `webapp/`: Vitest 4 en entorno `node`, sin jsdom ni Testing Library.

## Cuándo usar esta skill

- Escribir tests de utilidades, schemas o helpers.
- Testear un service con `vi.mock` del cliente HTTP.
- Mockear `sonner`, `errorLogger` o dependencias externas.
- Usar `it.each` para casos tabulados.
- Decidir si un test vale la pena.
- Organizar archivos de test.
- Depurar tests que fallan solo al correr toda la suite.

## Estado actual

- `vitest.config.ts` usa `environment: "node"`.
- No están instalados `jsdom`, `happy-dom`, `@testing-library/react`, `@testing-library/user-event` ni `@testing-library/jest-dom`.
- Los tests existentes prueban funciones puras: `utils`, `errorHandler`, `paymentHelpers`.
- No hay tests de componentes, hooks ni rutas.
- `globals: true` está configurado, pero los tests importan explícitamente desde `vitest`. Mantené esa convención.

## Comandos

```text
pnpm test                              # modo watch
pnpm test -- --run                     # una sola corrida
pnpm test -- src/utils/formatters.test.ts
```

`pnpm run test:coverage` **no funciona hoy**: falta instalar `@vitest/coverage-v8` o `@vitest/coverage-istanbul`. No lo documentes como si estuviera configurado.

## Organización

Los tests viven junto al archivo que prueban, con sufijo `.test.ts`:

```text
src/utils/formatters.ts
src/utils/formatters.test.ts

src/api/services/accounts/accountService.ts
src/api/services/accounts/accountService.test.ts
```

No crear una carpeta `__tests__/` separada. Los tests de componentes, si algún día se agregan, usan `.test.tsx`.

## Qué testear

Prioridad para una app personal:

1. **Funciones puras con reglas de negocio**: montos, redondeo, monedas, fechas, `DateOnly`, schemas Zod.
2. **Manejo de errores**: mapeo de RFC 7807 a mensajes y `ErrorDetail`.
3. **Services**: URL, parámetros, método HTTP y mapeo de la respuesta.
4. **Formularios**: solo si un bug real justifica montar el stack DOM.
5. **Componentes y hooks**: no ahora; se cubren levantando la app o con Playwright.

## Qué no testear

- Estilos, clases de Tailwind o glassmorphism.
- Componentes puramente presentacionales.
- Detalles internos de React (estado, props, hooks).
- Librerías de terceros.
- Snapshots grandes.
- Cobertura por cobertura: un test que solo ejecuta líneas no aporta.

## Arrange-Act-Assert

```typescript
import { describe, expect, it } from "vitest";
import { formatCurrency } from "./formatters";

describe("formatCurrency", () => {
  it("redondea montos en ARS", () => {
    // Arrange
    const amount = 123.456;

    // Act
    const result = formatCurrency(amount);

    // Assert
    expect(result).toBe("$ 123");
  });
});
```

Reglas:

- Un `Act` por test.
- Un comportamiento por test.
- Assertions específicas, no snapshots.
- Descripciones en español; identificadores en inglés.
- `describe("nombreDeLaFuncion")`, `it("describe el comportamiento")`.

## `it.each` (equivalente a `[Theory]`)

```typescript
it.each([
  [0, "$ 0"],
  [1000, "$ 1.000"],
  [99.99, "$ 100"],
])("formatea %s como %s", (amount, expected) => {
  expect(formatCurrency(amount)).toBe(expected);
});
```

- Usalo cuando cambia el dato, no el comportamiento.
- Si el assert o el setup cambian por caso, usá tests separados.

## Services con `vi.mock`

Los services son una capa fina sobre `spApiClient`. Testealos mockeando el cliente, no Axios:

```typescript
import { describe, expect, it, vi } from "vitest";
import type { ApiResponse } from "@/api/types";
import type { PagedListResponse } from "@/api/services/shared/sharedTypes";
import { spApiClient } from "@/api/spApiClient";
import { accountService } from "./accountService";
import type { AccountGetDTO } from "./accountTypes";

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

const response: ApiResponse<PagedListResponse<AccountGetDTO>> = {
  data: { page: 1, pageSize: 10, totalCount: 1, data: [account] },
  status: 200,
  statusText: "OK",
  headers: {},
};

describe("accountService", () => {
  it("getAll devuelve los datos paginados", async () => {
    // Arrange
    vi.mocked(spApiClient.get).mockResolvedValue(response);

    // Act
    const result = await accountService.getAll();

    // Assert
    expect(spApiClient.get).toHaveBeenCalledWith("/accounts");
    expect(result).toEqual([account]);
  });

  it("create envía el comando y devuelve el id", async () => {
    // Arrange
    const created = { id: 7 };
    vi.mocked(spApiClient.post).mockResolvedValue({
      data: created,
      status: 201,
      statusText: "Created",
      headers: {},
    });

    // Act
    const result = await accountService.create({
      name: "Caja",
      icon: { code: "wallet", colorHex: "#FFFFFF" },
      currencyCode: "ARS",
      balance: 0,
      includeInBalanceGlobal: true,
    });

    // Assert
    expect(spApiClient.post).toHaveBeenCalledWith("/accounts", expect.any(Object));
    expect(result).toEqual(created);
  });
});
```

Reglas:

- `vi.mock` se hoistea: declaralo antes de los imports que lo usan, o usá `vi.hoisted` si necesitás variables compartidas.
- Mockeá el borde HTTP (`spApiClient`), no Axios ni la red.
- Verificá la URL y el payload, no la implementación interna del service.
- Un service no debería testear la validación de formularios; eso va en el schema.

## Manejo de errores

`handleApiError` es una función pura: testeala directo con `AxiosError`, sin mocks de red.

```typescript
import { AxiosError } from "axios";
import { handleApiError } from "./errorHandler";

it("mapea un 400 a un mensaje de validación", () => {
  // Arrange
  const error = new AxiosError("Validation", "400", undefined, undefined, {
    status: 400,
    statusText: "Bad Request",
    data: { errors: { name: ["Requerido"] } },
    headers: {},
    config: { headers: {} },
  } as never);

  // Act
  const result = handleApiError(error);

  // Assert
  expect(result.statusCode).toBe(400);
  expect(result.errors).toEqual({ name: ["Requerido"] });
});
```

No uses `as any`. Si el tipo de Axios es difícil de construir, extraé un helper tipado en el test.

## Fechas y timers

Para lógica que depende de "hoy" o de la hora:

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it("devuelve el día local", () => {
  vi.setSystemTime(new Date(2026, 9, 21, 22, 30, 0));
  expect(todayDateOnly()).toBe("2026-10-21");
});
```

- Siempre restaurá los timers en `afterEach`.
- No dependas de la zona horaria de la máquina; fijala o usá fechas locales explícitas.
- Para `DateOnly`, no uses `toISOString().slice(0, 10)`.

## Limpieza de mocks

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

- `clearAllMocks`: limpia llamadas y resultados; conserva implementaciones.
- `resetAllMocks`: limpia también implementaciones.
- `restoreAllMocks`: restaura spies originales.

Elegí uno y sé consistente. Para `vi.fn()` alcanza con `clearAllMocks`; para `vi.spyOn`, usá `restoreAllMocks`.

## Si algún día agregás tests DOM

No es necesario para la app actual. Si aparece un bug de formulario o un flujo que justifique testear componentes:

1. Instalar `jsdom` (o `happy-dom`), `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom` y `@vitest/coverage-v8`.
2. Configurar un proyecto `dom` en `vitest.config.ts` o usar `// @vitest-environment jsdom` por archivo.
3. Agregar `webapp/test/setup.ts` con `@testing-library/jest-dom/vitest` y limpieza.
4. Testear por rol y label (`getByRole`, `getByLabelText`), con `userEvent.setup()` por test.
5. Usar `await screen.findBy*()` para estados asíncronos.

No agregues esas dependencias "por si acaso". Se instalan cuando hay un test concreto que las necesita.

## Anti-patterns

```text
No testear implementación interna        → testear input/output
No usar `any` en tests                   → tipos reales o helpers
No mockear Axios en un service           → mockear spApiClient
No usar snapshots grandes                → assertions específicas
No depender del reloj real               → vi.setSystemTime
No dejar timers o mocks sucios           → afterEach
No testear estilos                       → revisión visual / Playwright
No perseguir 60% de cobertura            → priorizar lógica de negocio
```

## Troubleshooting

| Problema | Causa | Solución |
|---|---|---|
| `Cannot find module '@/...'` | Alias no resuelto | Revisar `resolve.alias` en `vitest.config.ts` |
| `import.meta.env` falla | Entorno Vite no inicializado | Mockear `spApiClient`, no importar el cliente real |
| Un mock no aplica | `vi.mock` después del import | Moverlo arriba o usar `vi.hoisted` |
| Tests pasan solos, fallan juntos | Mocks o timers sucios | `beforeEach`/`afterEach` |
| `document is not defined` | Test DOM en entorno node | No hay stack DOM; usar Playwright o instalarlo |
| `test:coverage` falla | Falta proveedor de coverage | Instalar `@vitest/coverage-v8` cuando se necesite |

## Checklist

- [ ] El test está junto al archivo, con `.test.ts`.
- [ ] Tiene Arrange, Act y Assert.
- [ ] Prueba comportamiento, no implementación.
- [ ] Los mocks se limpian entre tests.
- [ ] No usa `any`.
- [ ] No depende del reloj ni de la zona horaria real.
- [ ] Si es un service, mockea `spApiClient`.
- [ ] Si es un error de API, prueba `handleApiError` como función pura.
- [ ] No agrega dependencias DOM sin un caso concreto.

## References

- [Ejemplos node: services, utilidades y errores](./references/node-examples.md)
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/) (solo si se instala el stack DOM)
- [Playwright CLI](../playwright-cli/SKILL.md) para E2E
