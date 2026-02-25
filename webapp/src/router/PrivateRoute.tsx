/**
 * PrivateRoute Component
 * 
 * Wrapper para rutas protegidas que requieren autenticación.
 * Por ahora solo renderiza el children (sin auth implementada).
 * 
 * TODO (Futuro): Agregar lógica de autenticación
 * - Verificar si usuario está autenticado
 * - Redirigir a /login si no está autenticado
 * - Implementar Zustand store para auth state
 */

import type { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  // TODO: Implementar lógica de autenticación cuando sea necesario
  // const { isAuthenticated } = useAuthStore();
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  return <>{children}</>;
}
