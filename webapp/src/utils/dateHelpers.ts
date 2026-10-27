/**
 * Date Helpers
 * Adaptador único para fechas de calendario (date-only) e instantes (local/UTC).
 */

export interface DateRange {
  from: string; // YYYY-MM-DD (DateOnly)
  to: string; // YYYY-MM-DD (DateOnly)
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Formatea un instante ISO 8601 como string local legible.
 * @param isoString - Instante en formato ISO 8601 (UTC u offset)
 * @param options - Opciones de formato Intl.DateTimeFormat
 * @returns String formateado en zona horaria local
 * @example
 * formatInstantLabel('2024-01-15T10:30:00Z') // "15/1/2024"
 * formatInstantLabel('2024-01-15T10:30:00Z', { dateStyle: 'long' }) // "15 de enero de 2024"
 */
export function formatInstantLabel(
  isoString: string,
  options?: Intl.DateTimeFormatOptions,
): string {
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
 * Extrae el día de calendario de un DateTime serializado por el backend.
 * Puente temporal mientras los contratos de resúmenes y pagos sigan en DateTime.
 * @param value - DateTime ISO 8601 (por ejemplo "2026-10-21T00:00:00Z")
 * @returns El día en formato YYYY-MM-DD, o "" si no es válido
 */
export function dateOnlyFromDateTime(value: string): string {
  if (!value) return "";

  const dateOnly = value.slice(0, 10);
  return DATE_ONLY_PATTERN.test(dateOnly) ? dateOnly : "";
}

/**
 * Convierte un instante ISO 8601 al día de calendario local (YYYY-MM-DD).
 * Puente temporal mientras Transaction/Transfer sigan enviando DateTime.
 */
export function dateOnlyFromInstant(instant: string): string {
  return toDateOnly(new Date(instant));
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
 * Compara dos instantes ISO 8601.
 * @returns -1 si a < b, 1 si a > b, 0 si son iguales o alguno es inválido
 */
export function compareInstants(a: string, b: string): number {
  const aTime = Date.parse(a);
  const bTime = Date.parse(b);

  if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;
  if (aTime === bTime) return 0;
  return aTime < bTime ? -1 : 1;
}

/**
 * Parsea un instante ISO 8601. Reservado para timestamps técnicos y de auditoría.
 */
export function parseInstant(instant: string): Date {
  return new Date(instant);
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
export function getTodayRange(): DateRange {
  const today = new Date();
  const from = toDateOnly(today);
  const to = toDateOnly(today);
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
    from: toDateOnly(firstDay),
    to: toDateOnly(lastDay),
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
export function getYearRange(): DateRange {
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

/**
 * Convierte una fecha date-only en un instante ISO con la hora local actual.
 * Puente temporal mientras Transaction/Transfer sigan enviando DateTime.
 */
export function withCurrentTime(effectiveDate: string): string {
  const currentTime = new Date();

  // Sin la "Z" el string fecha+hora se interpreta como hora local. Un string
  // solo fecha se interpretaría como UTC y correría el día en offsets negativos.
  const date = new Date(`${effectiveDate.slice(0, 10)}T00:00:00`);
  date.setHours(
    currentTime.getHours(),
    currentTime.getMinutes(),
    currentTime.getSeconds(),
    currentTime.getMilliseconds(),
  );

  return date.toISOString();
}

function dateOnlyToUtcMs(value: string): number | null {
  if (!DATE_ONLY_PATTERN.test(value.slice(0, 10))) return null;

  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}
