/**
 * Icon Helpers
 * Utilidades para manejo de iconos de cuentas
 */

// ============================================================================
// Constants
// ============================================================================

interface IconOption {
  code: string;
  symbol: string;
  label: string;
}

/**
 * Mapa de iconos disponibles para cuentas
 */
export const ICON_MAP: Record<string, IconOption> = {
  "money-bag": { code: "money-bag", symbol: "💰", label: "Bolsa de dinero" },
  "credit-card": { code: "credit-card", symbol: "💳", label: "Tarjeta" },
  bank: { code: "bank", symbol: "🏦", label: "Banco" },
  dollar: { code: "dollar", symbol: "💵", label: "Dólar" },
  "money-wings": { code: "money-wings", symbol: "💸", label: "Dinero volando" },
  coin: { code: "coin", symbol: "🪙", label: "Moneda" },
  diamond: { code: "diamond", symbol: "💎", label: "Diamante" },
  atm: { code: "atm", symbol: "🏧", label: "Cajero" },
  mobile: { code: "mobile", symbol: "📱", label: "Móvil" },
  target: { code: "target", symbol: "🎯", label: "Objetivo" },
  house: { code: "house", symbol: "🏠", label: "Casa" },
  car: { code: "car", symbol: "🚗", label: "Auto" },
  default: { code: "default", symbol: "⚪", label: "SIN ICONO" },
};

// ============================================================================
// Helpers
// ============================================================================

/**
 * Obtiene el símbolo emoji correspondiente a un code
 * Maneja:
 * 1. Code válido en ICON_MAP (ej: "money-bag" -> "💰")
 * 2. Legacy emoji directo (ej: "💰" -> "💰")
 * 3. Fallback a icono por defecto
 *
 * @param code - Código del icono o emoji directo
 * @returns Símbolo emoji a mostrar
 */
export function getIconSymbol(code: string): string {
  // 1. Buscar por code en el mapa
  if (code in ICON_MAP) {
    return ICON_MAP[code].symbol;
  }

  // 2. Si es emoji directo (legacy: 1-2 chars), retornar tal cual
  if (code.length <= 2) {
    return code;
  }

  // 3. Fallback a icono por defecto
  return getIconSymbol("default");
}

export function getAllIconOptions(): IconOption[] {
  return Object.values(ICON_MAP);
}

export function getOrDefaultIconOption(code: string): IconOption {
  if (code in ICON_MAP) return ICON_MAP[code];

  var find = Object.values(ICON_MAP).find((icon) => icon.symbol === code);

  if (find) return find;

  return ICON_MAP["default"];
}
