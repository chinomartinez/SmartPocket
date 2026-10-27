import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  compareDateOnly,
  compareInstants,
  dateOnlyFromInstant,
  dateOnlyFromDateTime,
  daysBetweenDateOnly,
  formatDateOnlyLabel,
  isValidDateOnly,
  parseInstant,
  toDateOnly,
  toDateOnlyUtc,
  todayDateOnly,
  withCurrentTime,
} from "./dateHelpers";

// En CI (Linux/macOS) fuerza ART para que el test detecte corrimientos de día.
// En Windows Node no aplica cambios de TZ en runtime, pero el round-trip con
// fechas locales sigue validando el comportamiento.
process.env.TZ = "America/Argentina/Buenos_Aires";

describe("withCurrentTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("conserva el día local elegido y le aplica la hora actual", () => {
    vi.setSystemTime(new Date(2026, 9, 21, 14, 0, 0));

    const result = withCurrentTime("2026-10-21");

    expect(toDateOnly(new Date(result))).toBe("2026-10-21");
    expect(new Date(result).getHours()).toBe(14);
  });

  it("conserva el día local cuando la hora cae en el día UTC siguiente", () => {
    vi.setSystemTime(new Date(2026, 9, 21, 22, 30, 0));

    const result = withCurrentTime("2026-10-21");

    expect(toDateOnly(new Date(result))).toBe("2026-10-21");
    expect(new Date(result).getHours()).toBe(22);
    expect(new Date(result).getMinutes()).toBe(30);
  });
});

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

describe("dateOnlyFromDateTime", () => {
  it("extrae el día de un DateTime del backend", () => {
    expect(dateOnlyFromDateTime("2026-10-21T00:00:00Z")).toBe("2026-10-21");
  });

  it("devuelve vacío para valores vacíos o inválidos", () => {
    expect(dateOnlyFromDateTime("")).toBe("");
    expect(dateOnlyFromDateTime("sin-fecha")).toBe("");
  });
});

describe("dateOnlyFromInstant", () => {
  it("convierte un instante al día local, incluso a las 22:30", () => {
    const instant = new Date(2026, 9, 21, 22, 30).toISOString();

    expect(dateOnlyFromInstant(instant)).toBe("2026-10-21");
  });

  it("devuelve vacío para un instante inválido", () => {
    expect(dateOnlyFromInstant("sin-fecha")).toBe("");
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

describe("compareInstants", () => {
  it("ordena instantes", () => {
    expect(compareInstants("2026-10-21T10:00:00Z", "2026-10-21T11:00:00Z")).toBe(-1);
    expect(compareInstants("2026-10-21T11:00:00Z", "2026-10-21T10:00:00Z")).toBe(1);
    expect(compareInstants("2026-10-21T10:00:00Z", "2026-10-21T10:00:00Z")).toBe(0);
  });

  it("devuelve 0 si algún instante es inválido", () => {
    expect(compareInstants("no-es-fecha", "2026-10-21T10:00:00Z")).toBe(0);
  });
});

describe("parseInstant", () => {
  it("parsea un timestamp ISO 8601", () => {
    expect(parseInstant("2026-10-21T10:30:00Z").toISOString()).toBe("2026-10-21T10:30:00.000Z");
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
