/**
 * Icon Map - Registro centralizado de iconos
 * Mapa unificado de todos los iconos disponibles (cuentas + categorías)
 */

// ============================================================================
// Types
// ============================================================================

export interface IconOption {
  code: string;
  symbol: string;
  label: string;
}

// ============================================================================
// Icon Registry
// ============================================================================

/**
 * Mapa completo de iconos disponibles en la aplicación
 * Incluye iconos de cuentas, categorías y otros usos
 */
export const ICON_MAP: Record<string, IconOption> = {
  // ============================================================================
  // Iconos de Cuentas
  // ============================================================================
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

  // ============================================================================
  // Iconos de Categorías - Gastos
  // ============================================================================
  shopping: { code: "shopping", symbol: "🛒", label: "Compras" },
  home: { code: "home", symbol: "🏠", label: "Vivienda" },
  transport: { code: "transport", symbol: "🚗", label: "Transporte" },
  health: { code: "health", symbol: "💊", label: "Salud" },
  food: { code: "food", symbol: "🍔", label: "Comida" },
  entertainment: { code: "entertainment", symbol: "🎮", label: "Ocio" },
  clothing: { code: "clothing", symbol: "👔", label: "Ropa" },
  education: { code: "education", symbol: "📚", label: "Educación" },
  services: { code: "services", symbol: "💡", label: "Servicios" },
  restaurant: { code: "restaurant", symbol: "🍽️", label: "Restaurante" },

  // ============================================================================
  // Iconos de Categorías - Ingresos
  // ============================================================================
  salary: { code: "salary", symbol: "💰", label: "Salario" },
  investment: { code: "investment", symbol: "📈", label: "Inversiones" },
  gift: { code: "gift", symbol: "🎁", label: "Regalo" },
  freelance: { code: "freelance", symbol: "💼", label: "Freelance" },
  bonus: { code: "bonus", symbol: "🎉", label: "Bonificación" },

  // ============================================================================
  // Iconos por defecto
  // ============================================================================
  others: { code: "others", symbol: "❓", label: "Otros" },
  default: { code: "default", symbol: "⚪", label: "Sin icono" },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Obtener todas las opciones de iconos como array
 */
export function getAllIcons(): IconOption[] {
  return Object.values(ICON_MAP);
}

/**
 * Obtener el símbolo de un icono por su código
 * @param code - Código del icono
 * @returns Símbolo emoji del icono o default
 */
export function getIconSymbol(code: string, fallbackCode: string = "default"): string {
  return ICON_MAP[code]?.symbol ?? ICON_MAP[fallbackCode]?.symbol ?? ICON_MAP.default.symbol;
}

/**
 * Obtener la opción completa de un icono por su código
 * @param code - Código del icono
 * @returns Objeto IconOption completo o default
 */
export function getIconOption(code: string, fallbackCode: string = "default"): IconOption {
  return ICON_MAP[code] ?? ICON_MAP[fallbackCode] ?? ICON_MAP.default;
}

/**
 * Obtener solo iconos de cuentas
 * @returns Array de iconos para cuentas
 */
export function getAccountIcons(): IconOption[] {
  const accountCodes = [
    "money-bag",
    "credit-card",
    "bank",
    "dollar",
    "money-wings",
    "coin",
    "diamond",
    "atm",
    "mobile",
    "target",
    "house",
    "car",
  ];
  return accountCodes.map((code) => ICON_MAP[code]);
}

/**
 * Obtener iconos de categorías filtrados por tipo
 * @param isIncome - true para ingresos, false para gastos
 * @returns Array de iconos de categorías del tipo especificado
 */
export function getCategoryIcons(isIncome: boolean): IconOption[] {
  if (isIncome) {
    // Iconos de ingresos
    const incomeCodes = ["salary", "investment", "gift", "freelance", "bonus", "other"];
    return incomeCodes.map((code) => ICON_MAP[code]);
  } else {
    // Iconos de gastos
    const expenseCodes = [
      "shopping",
      "home",
      "transport",
      "health",
      "food",
      "entertainment",
      "clothing",
      "education",
      "services",
      "restaurant",
      "other",
    ];
    return expenseCodes.map((code) => ICON_MAP[code]);
  }
}
