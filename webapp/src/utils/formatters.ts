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
