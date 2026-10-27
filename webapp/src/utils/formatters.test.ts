import { describe, expect, it } from "vitest";
import { formatCurrency, formatRelativeTime, formatSignedCurrency } from "./formatters";

const normalizeSpaces = (value: string) => value.replace(/\u00a0/g, " ");

describe("formatCurrency", () => {
  it("formatea montos positivos en ARS sin decimales", () => {
    expect(normalizeSpaces(formatCurrency(1000))).toBe("$ 1.000");
    expect(normalizeSpaces(formatCurrency(50.5))).toBe("$ 51");
  });

  it("formatea montos negativos", () => {
    expect(normalizeSpaces(formatCurrency(-1000))).toBe("-$ 1.000");
  });

  it("formatea cero correctamente", () => {
    expect(normalizeSpaces(formatCurrency(0))).toBe("$ 0");
  });

  it("redondea los decimales en ARS", () => {
    expect(normalizeSpaces(formatCurrency(123.456))).toBe("$ 123");
    expect(normalizeSpaces(formatCurrency(99.99))).toBe("$ 100");
  });

  it("conserva dos decimales para monedas extranjeras", () => {
    expect(normalizeSpaces(formatCurrency(1234.5, "USD"))).toBe("US$ 1.234,50");
  });
});

describe("formatSignedCurrency", () => {
  it("antepone el signo según el tipo", () => {
    expect(normalizeSpaces(formatSignedCurrency(1000, true))).toBe("+$ 1.000");
    expect(normalizeSpaces(formatSignedCurrency(-1000, false))).toBe("-$ 1.000");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date();

  it('muestra "Ahora" para menos de 1 minuto', () => {
    const recent = new Date(now.getTime() - 30 * 1000);
    expect(formatRelativeTime(recent)).toBe("Ahora");
  });

  it("muestra minutos para menos de 1 hora", () => {
    const minutes15 = new Date(now.getTime() - 15 * 60 * 1000);
    expect(formatRelativeTime(minutes15)).toBe("Hace 15m");
  });

  it("muestra horas para menos de 24 horas", () => {
    const hours5 = new Date(now.getTime() - 5 * 60 * 60 * 1000);
    expect(formatRelativeTime(hours5)).toBe("Hace 5h");
  });

  it('muestra "Ayer" para 1 día atrás', () => {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(yesterday)).toBe("Ayer");
  });

  it("muestra días para menos de 1 semana", () => {
    const days3 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(days3)).toBe("Hace 3d");
  });

  it("muestra la fecha corta para más de 1 semana", () => {
    const weekAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(weekAgo)).toBe(
      weekAgo.toLocaleDateString("es-AR", { month: "short", day: "numeric" }),
    );
  });
});
