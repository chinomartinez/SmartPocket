/**
 * Date Helpers
 * Adaptador único para fechas de calendario (date-only).
 */

export interface DateRange {
  from: string; // YYYY-MM-DD (DateOnly)
  to: string; // YYYY-MM-DD (DateOnly)
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Formatea una fecha sin hora (YYYY-MM-DD) sin convertirla entre zonas horarias.
 */
export function formatDateOnlyLabel(
  dateString: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!dateString) return "";

  const [year, month, day] = dateString.slice(0, 10).split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(
    "es-AR",
    options || {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );
}

/**
 * Formatea la fecha local de un Date como YYYY-MM-DD, sin convertirla a UTC.
 * @param date Fecha a formatear
 * @returns Fecha local en formato YYYY-MM-DD, o "" si la fecha es inválida
 */
export function toDateOnly(date: Date): string {
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formatea la fecha UTC de un Date como YYYY-MM-DD.
 * Se usa sólo para cálculos que deben ser independientes de la zona horaria.
 */
export function toDateOnlyUtc(date: Date): string {
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Devuelve la fecha local de hoy como YYYY-MM-DD.
 */
export function todayDateOnly(): string {
  return toDateOnly(new Date());
}

/**
 * Formatea la fecha de calendario de forma relativa: "Hoy", "Ayer",
 * "Hace Nd" para la última semana y la fecha corta para el resto.
 */
export function formatRelativeDateOnly(dateOnly: string): string {
  const days = daysBetweenDateOnly(dateOnly, todayDateOnly());

  if (Number.isNaN(days)) return "";
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days > 1 && days < 7) return `Hace ${days}d`;

  return formatDateOnlyLabel(dateOnly, { day: "numeric", month: "short" });
}

/**
 * Valida que un string sea una fecha de calendario real en formato YYYY-MM-DD.
 */
export function isValidDateOnly(value: string): boolean {
  if (!DATE_ONLY_PATTERN.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  );
}

/**
 * Compara dos fechas date-only (YYYY-MM-DD).
 * @returns -1 si a < b, 1 si a > b, 0 si son iguales
 */
export function compareDateOnly(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/**
 * Cantidad de días de calendario entre dos fechas date-only (to - from).
 * @returns Días de diferencia, o NaN si alguna fecha es inválida
 */
export function daysBetweenDateOnly(from: string, to: string): number {
  const fromMs = dateOnlyToUtcMs(from);
  const toMs = dateOnlyToUtcMs(to);

  if (fromMs === null || toMs === null) return Number.NaN;
  return Math.round((toMs - fromMs) / MS_PER_DAY);
}

/**
 * Obtiene el rango de fechas para el día actual
 * @returns DateRange con from y to del día actual
 */
function getTodayRange(): DateRange {
  const today = new Date();
  const from = toDateOnly(today);
  const to = toDateOnly(today);
  return { from, to };
}

/**
 * Obtiene el rango de fechas para la semana actual
 * @returns DateRange con from (lunes) y to (domingo)
 */
function getWeekRange(): DateRange {
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
    from: toDateOnly(firstDay),
    to: toDateOnly(lastDay),
  };
}

/**
 * Obtiene el rango de fechas para el mes actual
 * @returns DateRange con from (primer día del mes) y to (último día del mes)
 */
function getMonthRange(): DateRange {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Primer día del mes
  const firstDay = new Date(year, month, 1);

  // Último día del mes
  const lastDay = new Date(year, month + 1, 0);

  return {
    from: toDateOnly(firstDay),
    to: toDateOnly(lastDay),
  };
}

/**
 * Obtiene el rango desde el primer día del mes actual hasta hoy.
 * @returns DateRange con from (primer día del mes) y to (hoy)
 */
export function getCurrentMonthToDateRange(): DateRange {
  const today = new Date();

  return {
    from: toDateOnly(new Date(today.getFullYear(), today.getMonth(), 1)),
    to: toDateOnly(today),
  };
}

/**
 * Obtiene el rango de fechas para el año actual
 * @returns DateRange con from (1 de enero) y to (31 de diciembre)
 */
function getYearRange(): DateRange {
  const today = new Date();
  const year = today.getFullYear();

  // Primer día del año
  const firstDay = new Date(year, 0, 1);

  // Último día del año
  const lastDay = new Date(year, 11, 31);

  return {
    from: toDateOnly(firstDay),
    to: toDateOnly(lastDay),
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

function dateOnlyToUtcMs(value: string): number | null {
  if (!DATE_ONLY_PATTERN.test(value.slice(0, 10))) return null;

  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}
