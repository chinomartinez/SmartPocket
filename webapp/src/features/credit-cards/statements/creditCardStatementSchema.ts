import { z } from "zod";

export const creditCardStatementSchema = z
  .object({
    description: z.string().trim().min(1, "La descripción es obligatoria.").max(200),
    closingDate: z.string().min(1, "La fecha de cierre es obligatoria."),
    dueDate: z.string().min(1, "La fecha de vencimiento es obligatoria."),
  })
  .refine((values) => values.dueDate > values.closingDate, {
    path: ["dueDate"],
    message: "El vencimiento debe ser posterior al cierre.",
  });

export type CreditCardStatementFormValues = z.infer<typeof creditCardStatementSchema>;
