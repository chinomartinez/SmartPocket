import { describe, expect, it } from "vitest";
import { getNumericInputValue } from "./numericInput";

describe("getNumericInputValue", () => {
  it("renders an empty value as an empty input", () => {
    expect(getNumericInputValue(undefined)).toBe("");
  });

  it("can render an initial zero as empty", () => {
    expect(getNumericInputValue(0, true)).toBe("");
  });

  it("preserves numeric values", () => {
    expect(getNumericInputValue(900, true)).toBe(900);
  });
});
