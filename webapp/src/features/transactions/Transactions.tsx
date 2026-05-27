/**
 * Transactions Page
 * Página principal de gestión de transacciones
 */

import { useState } from "react";
import { TransactionFormModal } from "./TransactionFormModal";
import { TransactionFilters } from "./TransactionFilters";
import { TransactionList } from "./TransactionList";
import { useAccounts } from "@/features/accounts/useAccounts";
import { useTransactionFilters } from "./useTransactionFilters";
import { useTransactionList } from "./useTransactions";

// ============================================================================
// Component
// ============================================================================

export function Transactions() {
  // ========================================================================
  // State
  // ========================================================================

  const [selectedTransactionId, setSelectedTransactionId] = useState<number | undefined>();

  // ========================================================================
  // Data Fetching
  // ========================================================================

  // Obtener cuentas para el filtro
  const { data: accounts = [], isLoading: isLoadingAccounts } = useAccounts();

  // Inicializar filtros con la primera cuenta como default
  const defaultAccountId = accounts[0]?.id || 0;
  const { filters, handlers, request } = useTransactionFilters(defaultAccountId);

  // Obtener transacciones con filtros aplicados
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    error,
  } = useTransactionList(request);

  // ========================================================================
  // Handlers
  // ========================================================================

  const handleEditTransaction = (id: number) => {
    setSelectedTransactionId(id);
  };

  const handleCloseModal = () => {
    setSelectedTransactionId(undefined);
  };

  // ========================================================================
  // Render
  // ========================================================================

  // Loading state para cuentas (necesarias para inicializar filtros)
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

  // No accounts error
  if (!accounts.length) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="text-6xl mb-6">🏦</div>
          <h3 className="text-2xl font-semibold text-foreground mb-4">No hay cuentas</h3>
          <p className="text-text-quaternary">Crea una cuenta primero para ver transacciones</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Filtros de Transacciones */}
      <TransactionFilters filters={filters} handlers={handlers} accounts={accounts} />

      {/* Listado de Transacciones + Total */}
      <TransactionList
        transactions={transactions}
        isLoading={isLoadingTransactions}
        error={error}
        isIncome={filters.isIncome}
        onTransactionClick={handleEditTransaction}
      />

      {/* Modal de edición de transacción */}
      {selectedTransactionId && (
        <TransactionFormModal
          transactionId={selectedTransactionId}
          open={true}
          onOpenChange={(open) => {
            if (!open) handleCloseModal();
          }}
        />
      )}
    </div>
  );
}
