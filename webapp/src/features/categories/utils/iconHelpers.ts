/**
 * Icon Helpers para Categorías
 * Gestión de iconos (emojis) para categorías financieras
 */

// ============================================================================
// Types
// ============================================================================

export interface IconOption {
  code: string;
  symbol: string;
  label: string;
  type: "income" | "expense" | "both";
}

// ============================================================================
// Icon Map
// ============================================================================

/**
 * Mapa de iconos disponibles para categorías
 * Incluye emojis relevantes para transacciones financieras
 */
export const ICON_MAP: Record<string, IconOption> = {
  // Default (categoría del sistema)
  other: {
    code: "other",
    symbol: "❓",
    label: "Otros",
    type: "both",
  },

  // Gastos - Categorías comunes
  shopping: {
    code: "shopping",
    symbol: "🛒",
    label: "Compras",
    type: "expense",
  },
  home: {
    code: "home",
    symbol: "🏠",
    label: "Vivienda",
    type: "expense",
  },
  transport: {
    code: "transport",
    symbol: "🚗",
    label: "Transporte",
    type: "expense",
  },
  health: {
    code: "health",
    symbol: "💊",
    label: "Salud",
    type: "expense",
  },
  food: {
    code: "food",
    symbol: "🍔",
    label: "Comida",
    type: "expense",
  },
  entertainment: {
    code: "entertainment",
    symbol: "🎮",
    label: "Ocio",
    type: "expense",
  },
  clothing: {
    code: "clothing",
    symbol: "👔",
    label: "Ropa",
    type: "expense",
  },
  education: {
    code: "education",
    symbol: "📚",
    label: "Educación",
    type: "expense",
  },
  services: {
    code: "services",
    symbol: "💡",
    label: "Servicios",
    type: "expense",
  },
  restaurant: {
    code: "restaurant",
    symbol: "🍽️",
    label: "Restaurante",
    type: "expense",
  },

  // Ingresos - Categorías comunes
  salary: {
    code: "salary",
    symbol: "💰",
    label: "Salario",
    type: "income",
  },
  investment: {
    code: "investment",
    symbol: "📈",
    label: "Inversiones",
    type: "income",
  },
  gift: {
    code: "gift",
    symbol: "🎁",
    label: "Regalo",
    type: "income",
  },
  freelance: {
    code: "freelance",
    symbol: "💼",
    label: "Freelance",
    type: "income",
  },
  bonus: {
    code: "bonus",
    symbol: "🎉",
    label: "Bonificación",
    type: "income",
  },
};

/**
 * Icono por defecto (cuando no existe el código)
 */
const DEFAULT_ICON: IconOption = ICON_MAP.other;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Obtener todas las opciones de iconos como array
 * Útil para renderizar selectores de iconos
 */
export function getAllIconOptions(): IconOption[] {
  return Object.values(ICON_MAP);
}

/**
 * Obtener iconos filtrados por tipo (ingreso/gasto)
 * Retorna iconos del tipo especificado + iconos "both"
 *
 * @param isIncome - true para ingresos, false para gastos
 * @returns Array de iconos del tipo especificado
 */
export function getIconsByType(isIncome: boolean): IconOption[] {
  const filterType = isIncome ? "income" : "expense";
  return Object.values(ICON_MAP).filter((icon) => icon.type === filterType || icon.type === "both");
}

/**
 * Obtener el símbolo (emoji) de un icono por su código
 * Retorna el emoji default si el código no existe
 *
 * @param code - Código del icono (ej: "shopping", "salary")
 * @returns Símbolo emoji del icono
 */
export function getIconSymbol(code: string): string {
  const icon = ICON_MAP[code];
  return icon ? icon.symbol : DEFAULT_ICON.symbol;
}

/**
 * Obtener la opción completa de un icono por su código
 * Retorna el icono default si el código no existe
 *
 * @param code - Código del icono
 * @returns Objeto IconOption completo
 */
export function getOrDefaultIconOption(code: string): IconOption {
  return ICON_MAP[code] || DEFAULT_ICON;
}
