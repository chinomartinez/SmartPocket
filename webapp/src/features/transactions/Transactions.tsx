/**
 * Transactions Page
 * Página principal de gestión de transacciones
 * TODO: Implementar listado completo cuando backend exponga GET /transactions (FR15-17)
 */

import { useState } from "react";
import { TransactionFormModal } from "./components/TransactionFormModal";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";

export function Transactions() {
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="mb-6 md:mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Transacciones</h2>
          <p className="text-slate-400">Gestiona tus ingresos y gastos</p>
        </div>
        <Button
          onClick={() => setTransactionModalOpen(true)}
          className="gap-2 bg-sp-blue-600 hover:bg-sp-blue-500"
        >
          <Plus className="h-4 w-4" />
          Nueva Transacción
        </Button>
      </div>

      {/* Empty State - Placeholder para futuro listado */}
      <div className="glass-card rounded-2xl p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-6">💳</div>
          <h3 className="text-2xl font-semibold text-white mb-4">
            Listado de Transacciones Próximamente
          </h3>
          <p className="text-slate-400 mb-6">
            La funcionalidad completa de listado, filtros y búsqueda de transacciones estará
            disponible cuando el backend exponga el endpoint GET /transactions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass-card rounded-lg p-4">
              <Search className="h-8 w-8 text-sp-blue-400 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-white mb-1">Búsqueda</h4>
              <p className="text-xs text-slate-500">Búsqueda en tiempo real</p>
            </div>
            <div className="glass-card rounded-lg p-4">
              <Filter className="h-8 w-8 text-sp-purple-400 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-white mb-1">Filtros</h4>
              <p className="text-xs text-slate-500">Por fecha, cuenta, categoría</p>
            </div>
            <div className="glass-card rounded-lg p-4">
              <div className="text-2xl mx-auto mb-2">📊</div>
              <h4 className="text-sm font-medium text-white mb-1">Historial</h4>
              <p className="text-xs text-slate-500">Ordenado por fecha</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Mientras tanto, puedes crear y editar transacciones usando el botón de arriba.
          </p>
        </div>
      </div>

      {/* TODO: Implementar cuando backend esté listo */}
      {/* <TransactionFilters /> */}
      {/* <TransactionList /> */}

      {/* Modal de creación de transacción */}
      <TransactionFormModal
        mode="create"
        open={transactionModalOpen}
        onOpenChange={setTransactionModalOpen}
      />
    </>
  );
}
