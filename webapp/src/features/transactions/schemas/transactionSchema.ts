/**
 * Transaction Validation Schema
 * Schema de validación con Zod para formularios de transacciones
 */

import { z } from "zod";

/**
 * Schema de validación para crear/editar transacciones
 */
export const transactionSchema = z.object({
  // Tipo de transacción (ingreso o gasto)
  isIncome: z.boolean(),

  // Cuenta asociada
  accountId: z
    .number("Debe seleccionar una cuenta válida")
    .int("Debe ser un número entero")
    .positive("Debe seleccionar una cuenta válida"),

  // Categoría asociada
  categoryId: z
    .number("Debe seleccionar una categoría válida")
    .int("Debe ser un número entero")
    .positive("Debe seleccionar una categoría válida"),

  // Monto de la transacción
  amount: z.number("El monto debe ser un número válido").positive("El monto debe ser mayor a 0"),

  // Código de moneda (se infiere de la cuenta seleccionada)
  currencyCode: z
    .string()
    .min(1, "El código de moneda es requerido")
    .refine(
      (code) => /^[A-Z]{3}$/.test(code),
      "El código de moneda debe ser de 3 letras mayúsculas (ej: USD)",
    ),

  // Fecha efectiva de la transacción
  effectiveDate: z
    .string()
    .min(1, "La fecha es requerida")
    .refine((date) => !isNaN(Date.parse(date)), "La fecha debe ser válida (formato ISO 8601)"),

  // Descripción opcional
  description: z
    .string()
    .max(200, "La descripción no puede superar 200 caracteres")
    .optional()
    .or(z.literal("")), // Permitir string vacío

  // Tags opcionales (solo UI - backend no soporta aún)
  // NO se envía al backend en MVP
  tags: z.array(z.string()).optional(),
});

/**
 * Tipo inferido del schema para usar en formularios
 */
export type TransactionFormValues = z.infer<typeof transactionSchema>;
