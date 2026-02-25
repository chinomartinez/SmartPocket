/**
 * Category Schema
 * Esquema de validación con Zod para formularios de categorías
 */
import { z } from "zod";

/**
 * Schema de validación para crear/editar categorías
 */
export const categorySchema = z.object({
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

  isIncome: z.boolean(),
});

/**
 * Type inferido del schema para usar en formularios
 */
export type CategoryFormValues = z.infer<typeof categorySchema>;
