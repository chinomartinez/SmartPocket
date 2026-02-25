export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return diffInMinutes <= 1 ? "Now" : `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? "1h ago" : `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
}

/**
 * Formatea un monto como moneda
 * @param amount - Monto a formatear
 * @param currencySymbol - Símbolo de la moneda (ej: "$", "€", "£")
 * @param locale - Locale para el formato (default: undefined = navegador)
 * @returns String formateado con símbolo y decimales
 * @example
 * formatCurrency(1234.56, "$") // "$ 1,234.56"
 * formatCurrency(-500, "€") // "€ -500.00"
 */
export function formatCurrency(
  amount: number,
  currencySymbol: string = "$",
  locale?: string,
): string {
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${currencySymbol} ${formatted}`;
}
