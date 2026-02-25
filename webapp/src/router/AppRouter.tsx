/**
 * AppRouter Component
 *
 * Configuración principal de React Router.
 * Define todas las rutas de la aplicación.
 */

import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import Dashboard from "@/features/dashboard/Dashboard";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { AccountsList } from "@/features/accounts/components/AccountsList";
import { CategoriesList } from "@/features/categories/components/CategoriesList";
import { TestErrors } from "@/components/TestErrors";
import { ROUTES } from "./routes";
import SmartPocketLayout from "@/layout/SmartPocketLayout";

export function AppRouter() {
  return (
    <BrowserRouter>
      <SmartPocketLayout>
        <Routes>
          {/* Ruta raíz: redirect a dashboard */}
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />

          {/* Dashboard */}
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />

          {/* Accounts - Gestión de Cuentas */}
          <Route path={ROUTES.ACCOUNTS} element={<AccountsList />} />

          {/* Placeholder: Transactions (Fase 3) */}
          <Route path={ROUTES.TRANSACTIONS} element={<PlaceholderPage title="Transacciones" />} />

          {/* Categories - Gestión de Categorías */}
          <Route path={ROUTES.CATEGORIES} element={<CategoriesList />} />

          {/* Placeholder: Reports (Fase 3) */}
          <Route path={ROUTES.REPORTS} element={<PlaceholderPage title="Reportes" />} />

          {/* Placeholder: Settings (Fase 3) */}
          <Route path={ROUTES.SETTINGS} element={<PlaceholderPage title="Configuración" />} />

          {/* TEMPORAL: Test de errores (eliminar después) */}
          <Route path={ROUTES.TEST_ERRORS} element={<TestErrors />} />

          {/* 404 - Not Found */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-sp-blue-900 to-slate-900">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                  <p className="text-slate-300 mb-6">Página no encontrada</p>
                  <Link
                    to={ROUTES.DASHBOARD}
                    className="inline-block px-6 py-3 bg-sp-blue-600 text-white rounded-lg hover:bg-sp-blue-700 transition-colors duration-200"
                  >
                    Volver al Dashboard
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </SmartPocketLayout>
    </BrowserRouter>
  );
}
