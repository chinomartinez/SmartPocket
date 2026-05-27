/**
 * Date Helpers
 * Utilidades para manejo de fechas ISO 8601 UTC
 */

export interface DateRange {
  from: string; // ISO 8601 date string (YYYY-MM-DD)
  to: string; // ISO 8601 date string (YYYY-MM-DD)
}

/**
 * Formatea una fecha ISO 8601 UTC a string local legible
 * @param isoString - Fecha en formato ISO 8601 (UTC)
 * @param options - Opciones de formato Intl.DateTimeFormat
 * @returns String formateado en zona horaria local
 * @example
 * formatDateLocal('2024-01-15T10:30:00Z') // "15/1/2024"
 * formatDateLocal('2024-01-15T10:30:00Z', { dateStyle: 'long' }) // "15 de enero de 2024"
 */
export function formatDateLocal(isoString: string, options?: Intl.DateTimeFormatOptions): string {
  if (!isoString) return "";

  const date = new Date(isoString);

  // Validar fecha válida
  if (isNaN(date.getTime())) {
    console.error(`Invalid date string: ${isoString}`);
    return "";
  }

  // Opciones por defecto: formato corto
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  };

  // undefined = usar locale del navegador automáticamente
  return date.toLocaleDateString(undefined, options || defaultOptions);
}

/**
 * Formatea una fecha a formato ISO 8601 (YYYY-MM-DD)
 * @param date Fecha a formatear
 * @returns String en formato ISO 8601 (YYYY-MM-DD)
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Convierte un string ISO 8601 a objeto Date
 * @param isoString String en formato ISO 8601 (YYYY-MM-DD)
 * @returns Objeto Date
 */
export function parseDateFromISO(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Obtiene el rango de fechas para el día actual
 * @returns DateRange con from y to del día actual
 */
export function getTodayRange(): DateRange {
  const today = new Date();
  const from = formatDateToISO(today);
  const to = formatDateToISO(today);
  return { from, to };
}

/**
 * Obtiene el rango de fechas para la semana actual
 * @returns DateRange con from (lunes) y to (domingo)
 */
export function getWeekRange(): DateRange {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Ajuste para que lunes sea inicio

  // Primer día de la semana (lunes)
  const firstDay = new Date(today);
  firstDay.setDate(today.getDate() - diff);

  // Último día de la semana (domingo)
  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);

  return {
    from: formatDateToISO(firstDay),
    to: formatDateToISO(lastDay),
  };
}

/**
 * Obtiene el rango de fechas para el mes actual
 * @returns DateRange con from (primer día del mes) y to (último día del mes)
 */
export function getMonthRange(): DateRange {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Primer día del mes
  const firstDay = new Date(year, month, 1);

  // Último día del mes
  const lastDay = new Date(year, month + 1, 0);

  return {
    from: formatDateToISO(firstDay),
    to: formatDateToISO(lastDay),
  };
}

/**
 * Obtiene el rango de fechas para el año actual
 * @returns DateRange con from (1 de enero) y to (31 de diciembre)
 */
export function getYearRange(): DateRange {
  const today = new Date();
  const year = today.getFullYear();

  // Primer día del año
  const firstDay = new Date(year, 0, 1);

  // Último día del año
  const lastDay = new Date(year, 11, 31);

  return {
    from: formatDateToISO(firstDay),
    to: formatDateToISO(lastDay),
  };
}

/**
 * Obtiene el rango de fechas según el tipo de periodo seleccionado
 * @param period Tipo de periodo ("today" | "week" | "month" | "year" | "custom")
 * @param customRange Rango personalizado (requerido si period === "custom")
 * @returns DateRange con from y to calculados
 */
export function getPeriodRange(
  period: "today" | "week" | "month" | "year" | "custom",
  customRange?: DateRange,
): DateRange {
  switch (period) {
    case "today":
      return getTodayRange();
    case "week":
      return getWeekRange();
    case "month":
      return getMonthRange();
    case "year":
      return getYearRange();
    case "custom":
      if (!customRange) {
        throw new Error("Custom range is required when period is 'custom'");
      }
      return customRange;
    default:
      return getMonthRange(); // Default: mes actual
  }
}

export function AddCurrentTimeToDate(effectiveDate: string): string {
  const currentTime = new Date();

  const date = new Date(effectiveDate);
  date.setHours(
    currentTime.getHours(),
    currentTime.getMinutes(),
    currentTime.getSeconds(),
    currentTime.getMilliseconds(),
  );

  return date.toISOString();
}
