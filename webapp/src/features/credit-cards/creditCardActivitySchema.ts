import { z } from "zod";

const commonActivityFields = {
  categoryId: z.number().int().positive("Seleccioná una categoría"),
  description: z.string().min(1, "La descripción es obligatoria").max(200),
  effectiveDate: z.string().min(1, "La fecha es obligatoria"),
  currencyCode: z
    .string()
    .length(3, "Usá un código de 3 letras")
    .transform((value) => value.toUpperCase()),
};

export const creditCardPurchaseActivitySchema = z.object({
  ...commonActivityFields,
  amount: z.number().positive("El importe debe ser mayor que cero"),
  installments: z.number().int().positive("Las cuotas deben ser mayores que cero"),
});

export const creditCardSubscriptionActivitySchema = z.object({
  ...commonActivityFields,
  amount: z.number().positive("El importe debe ser mayor que cero"),
});

export type CreditCardPurchaseActivityFormValues = z.infer<typeof creditCardPurchaseActivitySchema>;

export type CreditCardSubscriptionActivityFormValues = z.infer<
  typeof creditCardSubscriptionActivitySchema
>;
