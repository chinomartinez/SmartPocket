import { describe, expect, it } from "vitest";
import { dateOnlySchema } from "./dateSchema";

describe("dateOnlySchema", () => {
  it("acepta fechas date-only válidas", () => {
    expect(dateOnlySchema.safeParse("2026-10-21").success).toBe(true);
    expect(dateOnlySchema.safeParse("2024-02-29").success).toBe(true);
  });

  it("rechaza timestamps", () => {
    expect(dateOnlySchema.safeParse("2026-10-21T00:00:00Z").success).toBe(false);
  });

  it("rechaza formatos inválidos y fechas inexistentes", () => {
    expect(dateOnlySchema.safeParse("21/10/2026").success).toBe(false);
    expect(dateOnlySchema.safeParse("2026-02-30").success).toBe(false);
    expect(dateOnlySchema.safeParse("").success).toBe(false);
  });
});
