/**
 * Formatea un monto con un código ISO 4217, por ejemplo ARS, USD o EUR.
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = "ARS",
  locale: string = "es-AR",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: currencyCode === "ARS" ? 0 : 2,
  }).format(amount);
}

/**
 * Formatea un monto compacto con un código ISO 4217.
 */
export function formatCompactCurrency(
  amount: number,
  currencyCode: string = "ARS",
  locale: string = "es-AR",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Formatea un monto con signo usando un código ISO 4217.
 */
export function formatSignedCurrency(
  amount: number,
  isIncome: boolean,
  currencyCode: string = "ARS",
  locale: string = "es-AR",
): string {
  const sign = isIncome ? "+" : "-";
  return `${sign}${formatCurrency(Math.abs(amount), currencyCode, locale)}`;
}
