export const CREDIT_CARD_ACTIVITY_TYPES = {
  PURCHASE: "Purchase",
  SUBSCRIPTION: "Subscription",
} as const;

export type CreditCardActivityType =
  (typeof CREDIT_CARD_ACTIVITY_TYPES)[keyof typeof CREDIT_CARD_ACTIVITY_TYPES];
