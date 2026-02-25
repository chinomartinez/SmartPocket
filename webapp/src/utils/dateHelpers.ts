/**
 * Date Helpers
 * Utilidades para manejo de fechas ISO 8601 UTC
 */

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
