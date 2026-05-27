/**
 * TransactionList Component
 * Componente de listado de transacciones agrupadas por fecha + resumen total
 */

import { IconBox } from "@/components/iconBoxes/IconBox";
import { ErrorAlert } from "@/components/ErrorAlert";
import { formatSignedCurrency } from "@/utils/formatters";
import { formatDateLocal } from "@/utils/dateHelpers";
import type { TransactionListItemDTO } from "@/api/services/transactions/transactionTypes";
import type { ApiError } from "@/api/types";

// ============================================================================
// Types
// ============================================================================

interface TransactionListProps {
  transactions: TransactionListItemDTO[];
  isLoading: boolean;
  error: ApiError | null;
  isIncome: boolean; // Para mostrar el total según tipo seleccionado
  onTransactionClick: (id: number) => void;
}

interface TransactionGroup {
  date: string;
  transactions: TransactionListItemDTO[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Agrupa transacciones por fecha (effectiveDate)
 */
function groupTransactionsByDate(transactions: TransactionListItemDTO[]): TransactionGroup[] {
  const grouped = transactions.reduce(
    (acc, tx) => {
      // Formatear la fecha para usarla como clave de agrupación
      const formattedDate = formatDateLocal(tx.effectiveDate);

      if (!acc[formattedDate]) {
        acc[formattedDate] = [];
      }
      acc[formattedDate].push(tx);
      return acc;
    },
    {} as Record<string, TransactionListItemDTO[]>,
  );

  // Convertir a array y ordenar por fecha descendente (más recientes primero)
  return Object.entries(grouped)
    .map(([date, txs]) => ({ date, transactions: txs }))
    .sort((a, b) => {
      // Comparar las fechas del primer elemento de cada grupo
      const dateA = new Date(a.transactions[0].effectiveDate);
      const dateB = new Date(b.transactions[0].effectiveDate);
      return dateB.getTime() - dateA.getTime(); // Descendente
    });
}

/**
 * Calcula el total de transacciones según tipo
 */
function calculateTotal(transactions: TransactionListItemDTO[], isIncome: boolean): number {
  return transactions
    .filter((tx) => tx.isIncome === isIncome)
    .reduce((sum, tx) => sum + tx.money.amount, 0);
}

// ============================================================================
// Component
// ============================================================================

export function TransactionList({
  transactions,
  isLoading,
  error,
  isIncome,
  onTransactionClick,
}: TransactionListProps) {
  // ========================================================================
  // Loading State
  // ========================================================================

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Skeleton para el total */}
        <div className="glass-card rounded-xl border border-white/10 py-3 px-4 mb-4 animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3" />
        </div>
        {/* Skeleton para las transacciones */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
            <div className="h-5 bg-muted rounded w-1/4 mb-3" />
            <div className="space-y-2">
              {[1, 2].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                  <div className="h-4 bg-muted rounded w-20" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ========================================================================
  // Error State
  // ========================================================================

  if (error) {
    return <ErrorAlert error={error} />;
  }

  // ========================================================================
  // Empty State
  // ========================================================================

  if (!transactions.length) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h3 className="text-2xl font-semibold text-foreground mb-4">No hay transacciones</h3>
        <p className="text-text-quaternary">
          Intenta cambiar los filtros o el periodo seleccionado
        </p>
      </div>
    );
  }

  // ========================================================================
  // Data Rendering
  // ========================================================================

  const groupedTransactions = groupTransactionsByDate(transactions);
  const totalAmount = calculateTotal(transactions, isIncome);

  // Obtener símbolo de moneda de la primera transacción
  // Asumimos que todas las transacciones tienen la misma moneda
  const currencySymbol = transactions[0]?.money.currencyCode || "$";

  return (
    <>
      {/* ====================================================================== */}
      {/* Transaction Summary - Total compacto */}
      {/* ====================================================================== */}
      <div className="glass-card rounded-xl border border-white/10 py-1.5 px-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            Total {isIncome ? "ingresos" : "gastos"}
          </span>
          <span className={`text-lg font-bold ${isIncome ? "text-emerald-400" : "text-red-400"}`}>
            {formatSignedCurrency(totalAmount, isIncome, currencySymbol)}
          </span>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* Transaction List - Agrupada por fecha */}
      {/* ====================================================================== */}
      <div className="space-y-4">
        {groupedTransactions.map((group) => (
          <div key={group.date}>
            {/* Date Header */}
            <div className="mb-2">
              <h3 className="text-base font-semibold text-foreground">{group.date}</h3>
            </div>

            {/* Transactions del día */}
            <div className="space-y-2">
              {group.transactions.map((transaction) => {
                return (
                  <div
                    key={transaction.id}
                    onClick={() => onTransactionClick(transaction.id)}
                    className="glass-card group/item flex items-center justify-between p-4 rounded-xl hover:bg-hover-muted hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    {/* Left: Icon + Description */}
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <IconBox
                        icon={transaction.category.icon}
                        size="sm"
                        shape="rounded"
                        backgroundOpacity={20}
                        animated
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium text-sm truncate">
                          {transaction.category.name}
                        </p>
                        <p className="text-text-quaternary text-xs">
                          {transaction.description ?? ""}
                        </p>
                      </div>
                    </div>

                    {/* Right: Amount */}
                    <div className="text-right ml-3">
                      <p
                        className={`text-sm font-semibold whitespace-nowrap ${
                          transaction.isIncome ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {formatSignedCurrency(
                          transaction.money.amount,
                          transaction.isIncome,
                          transaction.money.currencyCode,
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
