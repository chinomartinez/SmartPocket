import { z } from "zod";

const dayRangeSchema = z.object({
  startDay: z.number().int().min(1).max(31),
  endDay: z.number().int().min(1).max(31),
});

export const creditCardSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
  icon: z.object({
    code: z.string().min(1, "Seleccioná un ícono"),
    colorHex: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "Ingresá un color hexadecimal válido"),
  }),
  currencyCode: z.string().length(3, "Usá un código de 3 letras, por ejemplo ARS"),
  creditLimit: z.number().min(0, "El límite no puede ser negativo"),
  statementClosingRange: dayRangeSchema,
  paymentDueRange: dayRangeSchema,
});

export type CreditCardFormValues = z.infer<typeof creditCardSchema>;
