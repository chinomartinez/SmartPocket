export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return diffInMinutes <= 1 ? "Ahora" : `Hace ${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? "Hace 1h" : `Hace ${diffInHours}h`;
  } else if (diffInDays === 1) {
    return "Ayer";
  } else if (diffInDays < 7) {
    return `Hace ${diffInDays}d`;
  } else {
    return date.toLocaleDateString("es-AR", {
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

/**
 * Formatea un monto como moneda con signo (+ o -) según tipo de transacción
 * @param amount - Monto a formatear (siempre valor absoluto)
 * @param isIncome - Si es ingreso (true = +) o gasto (false = -)
 * @param currencySymbol - Símbolo de la moneda (ej: "$", "€", "£")
 * @param locale - Locale para el formato (default: undefined = navegador)
 * @returns String formateado con signo, símbolo y decimales
 * @example
 * formatSignedCurrency(1234.56, true, "$") // "+$ 1,234.56"
 * formatSignedCurrency(500, false, "$") // "-$ 500.00"
 */
export function formatSignedCurrency(
  amount: number,
  isIncome: boolean,
  currencySymbol: string = "$",
  locale?: string,
): string {
  const sign = isIncome ? "+" : "-";
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount)); // Asegurar valor absoluto

  return `${sign}${currencySymbol} ${formatted}`;
}
