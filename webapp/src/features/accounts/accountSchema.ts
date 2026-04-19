/**
 * Account Validation Schema
 * Schema de validación con Zod para formularios de cuenta
 */

import { z } from "zod";

/**
 * Schema de validación para crear/editar cuenta
 */
export const accountSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede superar 50 caracteres"),

  icon: z.object({
    code: z.string().min(1, "El código de ícono es requerido"),
    colorHex: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Debe ser un color hexadecimal válido (ej: #FF5733)"),
  }),

  currencyCode: z
    .string("Debe seleccionar una moneda válida")
    .min(1, "Debe seleccionar una moneda")
    .refine(
      (code) => /^[A-Z]{3}$/.test(code),
      "El código de moneda debe ser de 3 letras mayúsculas (ej: USD)",
    ),

  balance: z.number("El saldo debe ser un número"),

  includeInBalanceGlobal: z.boolean(),
});

/**
 * Tipo inferido del schema
 */
export type AccountFormValues = z.infer<typeof accountSchema>;
