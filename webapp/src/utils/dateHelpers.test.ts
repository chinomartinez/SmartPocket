import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  compareDateOnly,
  daysBetweenDateOnly,
  formatDateOnlyLabel,
  formatRelativeDateOnly,
  isValidDateOnly,
  toDateOnly,
  toDateOnlyUtc,
  todayDateOnly,
} from "./dateHelpers";

// En CI (Linux/macOS) fuerza ART para que el test detecte corrimientos de día.
// En Windows Node no aplica cambios de TZ en runtime, pero el round-trip con
// fechas locales sigue validando el comportamiento.
process.env.TZ = "America/Argentina/Buenos_Aires";

describe("toDateOnly", () => {
  it("devuelve la fecha local en formato YYYY-MM-DD", () => {
    expect(toDateOnly(new Date(2026, 9, 21, 23, 30))).toBe("2026-10-21");
  });

  it("devuelve vacío para una fecha inválida", () => {
    expect(toDateOnly(new Date("no-es-una-fecha"))).toBe("");
  });
});

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

describe("toDateOnlyUtc", () => {
  it("devuelve la fecha en UTC sin convertir a local", () => {
    expect(toDateOnlyUtc(new Date("2026-10-21T23:30:00-03:00"))).toBe("2026-10-22");
  });

  it("devuelve vacío para una fecha inválida", () => {
    expect(toDateOnlyUtc(new Date("no-es-una-fecha"))).toBe("");
  });
});

describe("isValidDateOnly", () => {
  it("acepta fechas reales en formato YYYY-MM-DD", () => {
    expect(isValidDateOnly("2026-10-21")).toBe(true);
    expect(isValidDateOnly("2024-02-29")).toBe(true);
  });

  it("rechaza timestamps, formatos inválidos y fechas inexistentes", () => {
    expect(isValidDateOnly("2026-10-21T00:00:00Z")).toBe(false);
    expect(isValidDateOnly("2026-2-3")).toBe(false);
    expect(isValidDateOnly("2026-02-30")).toBe(false);
    expect(isValidDateOnly("")).toBe(false);
  });
});

describe("compareDateOnly", () => {
  it("ordena fechas date-only", () => {
    expect(compareDateOnly("2026-10-21", "2026-10-22")).toBe(-1);
    expect(compareDateOnly("2026-10-22", "2026-10-21")).toBe(1);
    expect(compareDateOnly("2026-10-21", "2026-10-21")).toBe(0);
  });
});

describe("daysBetweenDateOnly", () => {
  it("cuenta días de calendario, también a través de fin de mes", () => {
    expect(daysBetweenDateOnly("2026-10-21", "2026-11-05")).toBe(15);
    expect(daysBetweenDateOnly("2026-11-05", "2026-10-21")).toBe(-15);
    expect(daysBetweenDateOnly("2026-10-21", "2026-10-21")).toBe(0);
  });

  it("devuelve NaN para fechas inválidas", () => {
    expect(Number.isNaN(daysBetweenDateOnly("", "2026-10-21"))).toBe(true);
    expect(Number.isNaN(daysBetweenDateOnly("2026-10-21", "sin-fecha"))).toBe(true);
  });
});

describe("formatDateOnlyLabel", () => {
  it("formatea sin corrimiento de día", () => {
    expect(formatDateOnlyLabel("2026-10-21")).toBe("21/10/2026");
    expect(formatDateOnlyLabel("2026-10-21", { day: "2-digit", month: "short" })).toContain("21");
  });

  it("devuelve vacío para una fecha inválida", () => {
    expect(formatDateOnlyLabel("")).toBe("");
  });
});

describe("formatRelativeDateOnly", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 21, 22, 30, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('devuelve "Hoy" para la fecha local actual', () => {
    expect(formatRelativeDateOnly("2026-10-21")).toBe("Hoy");
  });

  it('devuelve "Ayer" para el día anterior', () => {
    expect(formatRelativeDateOnly("2026-10-20")).toBe("Ayer");
  });

  it("devuelve días para la última semana", () => {
    expect(formatRelativeDateOnly("2026-10-18")).toBe("Hace 3d");
  });

  it("devuelve la fecha corta para más de una semana", () => {
    expect(formatRelativeDateOnly("2026-10-13")).toBe(
      formatDateOnlyLabel("2026-10-13", { day: "numeric", month: "short" }),
    );
  });

  it("devuelve vacío para una fecha inválida", () => {
    expect(formatRelativeDateOnly("sin-fecha")).toBe("");
    expect(formatRelativeDateOnly("")).toBe("");
  });
});
