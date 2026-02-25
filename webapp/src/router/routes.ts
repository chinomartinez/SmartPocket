/**
 * Routes Configuration
 * 
 * Define todas las rutas de la aplicación como constantes.
 * Usar estas constantes en lugar de strings hardcodeados.
 */

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ACCOUNTS: '/accounts',
  TRANSACTIONS: '/transactions',
  CATEGORIES: '/categories',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  TEST_ERRORS: '/test-errors', // TEMPORAL - Eliminar después de pruebas
} as const;

// Type helper para rutas
export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
