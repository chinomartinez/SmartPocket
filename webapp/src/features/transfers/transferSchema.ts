/**
 * Transfer Validation Schema
 * Schema de validación con Zod para formularios de transferencias
 */

import { z } from "zod";

/**
 * Schema de validación para crear/editar transferencias
 */
export const transferSchema = z
  .object({
    // Cuenta origen
    originAccountId: z
      .number("Debe seleccionar una cuenta de origen válida")
      .int("Debe ser un número entero")
      .positive("Debe seleccionar una cuenta de origen válida"),

    // Cuenta destino
    destinationAccountId: z
      .number("Debe seleccionar una cuenta de destino válida")
      .int("Debe ser un número entero")
      .positive("Debe seleccionar una cuenta de destino válida"),

    // Monto de la transferencia
    amount: z.number("El monto debe ser un número válido").positive("El monto debe ser mayor a 0"),

    // Fecha efectiva de la transferencia
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
  })
  .refine((data) => data.originAccountId !== data.destinationAccountId, {
    message: "La cuenta de origen y destino deben ser diferentes",
    path: ["destinationAccountId"], // Mostrar error en el campo destino
  });

/**
 * Tipo inferido del schema para usar en formularios
 */
export type TransferFormValues = z.infer<typeof transferSchema>;
