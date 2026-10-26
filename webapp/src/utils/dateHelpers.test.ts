import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AddCurrentTimeToDate, formatDateToISO } from "./dateHelpers";

// En CI (Linux/macOS) fuerza ART para que el test detecte corrimientos de día.
// En Windows Node no aplica cambios de TZ en runtime, pero el round-trip con
// fechas locales sigue validando el comportamiento.
process.env.TZ = "America/Argentina/Buenos_Aires";

describe("AddCurrentTimeToDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("conserva el día local elegido y le aplica la hora actual", () => {
    vi.setSystemTime(new Date(2026, 9, 21, 14, 0, 0));

    const result = AddCurrentTimeToDate("2026-10-21");

    expect(formatDateToISO(new Date(result))).toBe("2026-10-21");
    expect(new Date(result).getHours()).toBe(14);
  });

  it("conserva el día local cuando la hora cae en el día UTC siguiente", () => {
    vi.setSystemTime(new Date(2026, 9, 21, 22, 30, 0));

    const result = AddCurrentTimeToDate("2026-10-21");

    expect(formatDateToISO(new Date(result))).toBe("2026-10-21");
    expect(new Date(result).getHours()).toBe(22);
    expect(new Date(result).getMinutes()).toBe(30);
  });
});

describe("formatDateToISO", () => {
  it("devuelve la fecha local en formato YYYY-MM-DD", () => {
    expect(formatDateToISO(new Date(2026, 9, 21, 23, 30))).toBe("2026-10-21");
  });

  it("devuelve vacío para una fecha inválida", () => {
    expect(formatDateToISO(new Date("no-es-una-fecha"))).toBe("");
  });
});
