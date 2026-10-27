import { describe, expect, it } from "vitest";
import { getInstallmentDate } from "./paymentHelpers";

describe("getInstallmentDate", () => {
  it("devuelve la fecha de la primera cuota", () => {
    expect(getInstallmentDate("2026-10-21", 1)).toBe("2026-10-21");
  });

  it("suma un mes por cada cuota", () => {
    expect(getInstallmentDate("2026-10-21", 3)).toBe("2026-12-21");
  });

  it("normaliza el overflow de fin de mes igual que el backend", () => {
    expect(getInstallmentDate("2026-01-31", 2)).toBe("2026-03-03");
    expect(getInstallmentDate("2026-01-31", 3)).toBe("2026-03-31");
  });
});
