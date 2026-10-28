import { describe, expect, it } from "vitest";
import { formatCurrency, formatSignedCurrency } from "./formatters";

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
