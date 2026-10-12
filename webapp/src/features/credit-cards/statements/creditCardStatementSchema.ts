import { z } from "zod";

export const creditCardStatementSchema = z
  .object({
    description: z.string().trim().min(1, "La descripción es obligatoria.").max(200),
    closingDate: z.string().min(1, "La fecha de cierre es obligatoria."),
    dueDate: z.string().min(1, "La fecha de vencimiento es obligatoria."),
    selectedItemsCount: z
      .number()
      .int()
      .min(1, "Incluí al menos una cuota o un cargo de suscripción en el resumen."),
  })
  .refine((values) => values.dueDate > values.closingDate, {
    path: ["dueDate"],
    message: "El vencimiento debe ser posterior al cierre.",
  });

export type CreditCardStatementFormValues = z.infer<typeof creditCardStatementSchema>;
