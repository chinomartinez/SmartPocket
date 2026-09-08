export type CardTheme = "violet" | "blue" | "amber";

export const themeClasses: Record<CardTheme, string> = {
  violet: "from-[#30206e] via-[#4c2a91] to-[#1d1749]",
  blue: "from-[#123b67] via-[#17618c] to-[#112847]",
  amber: "from-[#71441e] via-[#a2632a] to-[#3b2418]",
};

export function themeForCard(id: number): CardTheme {
  return (["violet", "blue", "amber"] as const)[id % 3];
}

export function formatAmount(amount: number, currency = "ARS") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "ARS" ? 0 : 2,
  }).format(amount);
}
