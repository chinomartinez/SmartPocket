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
import { PlusIcon } from "@heroicons/react/24/outline";
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

  const pageHeader = (
    <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Transferencias</h1>
        <p className="mt-1 text-sm text-text-quaternary">
          Gestiona las transferencias entre tus cuentas
        </p>
      </div>
      <Button
        onClick={handleCreateTransfer}
        className="flex items-center gap-2"
        aria-label="Agregar transferencia"
      >
        <PlusIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Agregar transferencia</span>
      </Button>
    </div>
  );

  // Loading state para cuentas
  if (isLoadingAccounts) {
    return (
      <div className="max-w-5xl mx-auto">
        {pageHeader}
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
        {pageHeader}
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
      <div className="max-w-5xl mx-auto">
        {pageHeader}
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
