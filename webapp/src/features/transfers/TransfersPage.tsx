/**
 * Transfers Page
 * Página principal de gestión de transferencias entre cuentas
 */

import { useState } from "react";
import { TransferFormModal } from "./TransferFormModal";
import { TransferFilters } from "./TransferFilters";
import { TransferList } from "./TransferList";
import { useAccounts } from "@/api/services/accounts/useAccounts";
import { useTransferFilters } from "./useTransferFilters";
import { useTransferList } from "@/api/services/transfers/useTransfers";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================================================
// Component
// ============================================================================

export function TransfersPage() {
  // ========================================================================
  // State
  // ========================================================================

  const [selectedTransferId, setSelectedTransferId] = useState<number | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ========================================================================
  // Data Fetching
  // ========================================================================

  // Obtener cuentas para validar que existan mínimo 2
  const { data: accounts = [], isLoading: isLoadingAccounts } = useAccounts();

  // Inicializar filtros (solo periodo, sin cuenta)
  const { filters, handlers, request } = useTransferFilters();

  // Obtener transferencias con filtros aplicados
  const { data: transfers = [], isLoading: isLoadingTransfers, error } = useTransferList(request);

  // ========================================================================
  // Handlers
  // ========================================================================

  const handleCreateTransfer = () => {
    setSelectedTransferId(undefined);
    setIsModalOpen(true);
  };

  const handleEditTransfer = (id: number) => {
    setSelectedTransferId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTransferId(undefined);
    setIsModalOpen(false);
  };

  // ========================================================================
  // Render
  // ========================================================================

  // Loading state para cuentas
  if (isLoadingAccounts) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="glass-card rounded-2xl border border-white/10 p-8 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <div className="h-40 bg-muted rounded" />
        </div>
      </div>
    );
  }

  // Validar que existan al menos 2 cuentas
  if (accounts.length < 2) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="text-6xl mb-6">🏦</div>
          <h3 className="text-2xl font-semibold text-foreground mb-4">
            Necesitas al menos 2 cuentas
          </h3>
          <p className="text-text-quaternary">
            Las transferencias requieren una cuenta de origen y una de destino. Crea al menos 2
            cuentas para comenzar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Contenedor principal con padding-bottom para no tapar con FAB */}
      <div className="max-w-5xl mx-auto pb-20 md:pb-0">
        {/* Filtros de Transferencias */}
        <TransferFilters filters={filters} handlers={handlers} />

        {/* Listado de Transferencias */}
        <TransferList
          transfers={transfers}
          isLoading={isLoadingTransfers}
          error={error}
          onTransferClick={handleEditTransfer}
        />
      </div>

      {/* Floating Action Button - Nueva Transferencia */}
      <Button
        onClick={handleCreateTransfer}
        variant="success"
        size="icon"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-50"
        title="Nueva Transferencia"
      >
        <Plus className="h-5 w-5 md:h-6 md:w-6" />
      </Button>

      {/* Modal de crear/editar transferencia */}
      {isModalOpen && (
        <TransferFormModal
          transferId={selectedTransferId}
          open={isModalOpen}
          onOpenChange={(open) => {
            if (!open) handleCloseModal();
          }}
        />
      )}
    </>
  );
}
