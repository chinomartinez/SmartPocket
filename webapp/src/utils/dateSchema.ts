import { z } from "zod";
import { isValidDateOnly } from "@/utils/dateHelpers";

/**
 * Valida una fecha de calendario en formato YYYY-MM-DD (DateOnly).
 * Rechaza timestamps, formatos inválidos y fechas inexistentes.
 */
export const dateOnlySchema = z
  .string()
  .min(1, "La fecha es obligatoria")
  .refine(isValidDateOnly, "La fecha debe ser válida (YYYY-MM-DD)");
