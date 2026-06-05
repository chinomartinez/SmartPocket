/**
 * AppRouter Component
 *
 * Configuración principal de React Router.
 * Define todas las rutas de la aplicación.
 */

import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import DashboardPage from "@/features/dashboard/DashboardPage";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { AccountsPage } from "@/features/accounts/AccountsPage";
import { CategoriesPage } from "@/features/categories/CategoriesPage";
import { TransactionsPage } from "@/features/transactions/TransactionsPage";
import { TransfersPage } from "@/features/transfers/TransfersPage";
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
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

          {/* Accounts - Gestión de Cuentas */}
          <Route path={ROUTES.ACCOUNTS} element={<AccountsPage />} />

          {/* Transactions - Gestión de Transacciones */}
          <Route path={ROUTES.TRANSACTIONS} element={<TransactionsPage />} />

          {/* Transfers - Gestión de Transferencias */}
          <Route path={ROUTES.TRANSFERS} element={<TransfersPage />} />

          {/* Categories - Gestión de Categorías */}
          <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />

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
              <div className="flex items-center justify-center min-h-screen bg-slate-900">
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
