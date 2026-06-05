/**
 * TransferList Component
 * Componente de listado de transferencias agrupadas por fecha
 */

import { IconBox } from "@/components/iconBoxes/IconBox";
import { ErrorAlert } from "@/components/ErrorAlert";
import { formatCurrency } from "@/utils/formatters";
import { formatDateLocal } from "@/utils/dateHelpers";
import { ArrowRight } from "lucide-react";
import type { TransferListItemDTO } from "@/api/services/transfers/transferTypes";
import type { ApiError } from "@/api/types";

// ============================================================================
// Types
// ============================================================================

interface TransferListProps {
  transfers: TransferListItemDTO[];
  isLoading: boolean;
  error: ApiError | null;
  onTransferClick: (id: number) => void;
}

interface TransferGroup {
  date: string;
  transfers: TransferListItemDTO[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Agrupa transferencias por fecha (effectiveDate)
 */
function groupTransfersByDate(transfers: TransferListItemDTO[]): TransferGroup[] {
  const grouped = transfers.reduce(
    (acc, transfer) => {
      // Formatear la fecha para usarla como clave de agrupación
      const formattedDate = formatDateLocal(transfer.effectiveDate);

      if (!acc[formattedDate]) {
        acc[formattedDate] = [];
      }
      acc[formattedDate].push(transfer);
      return acc;
    },
    {} as Record<string, TransferListItemDTO[]>,
  );

  // Convertir a array y ordenar por fecha descendente (más recientes primero)
  return Object.entries(grouped)
    .map(([date, txs]) => ({ date, transfers: txs }))
    .sort((a, b) => {
      // Comparar las fechas del primer elemento de cada grupo
      const dateA = new Date(a.transfers[0].effectiveDate);
      const dateB = new Date(b.transfers[0].effectiveDate);
      return dateB.getTime() - dateA.getTime(); // Descendente
    });
}

// ============================================================================
// Component
// ============================================================================

export function TransferList({ transfers, isLoading, error, onTransferClick }: TransferListProps) {
  // ========================================================================
  // Loading State
  // ========================================================================

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Skeleton para las transferencias */}
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

  if (!transfers.length) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <div className="text-6xl mb-6">🔄</div>
        <h3 className="text-2xl font-semibold text-foreground mb-4">No hay transferencias</h3>
        <p className="text-text-quaternary">
          Intenta cambiar el periodo seleccionado o crea una nueva transferencia
        </p>
      </div>
    );
  }

  // ========================================================================
  // Data Rendering
  // ========================================================================

  const groupedTransfers = groupTransfersByDate(transfers);

  return (
    <div className="space-y-4">
      {groupedTransfers.map((group) => (
        <div key={group.date}>
          {/* Date Header */}
          <div className="mb-2">
            <h3 className="text-base font-semibold text-foreground">{group.date}</h3>
          </div>

          {/* Transfers del día */}
          <div className="space-y-2">
            {group.transfers.map((transfer) => {
              return (
                <div
                  key={transfer.id}
                  onClick={() => onTransferClick(transfer.id)}
                  className="glass-card group/item flex items-center justify-between p-4 rounded-xl hover:bg-hover-muted hover:scale-[1.01] transition-all cursor-pointer"
                >
                  {/* Left: Cuentas (Origen → Destino) */}
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* Cuenta Origen */}
                    <IconBox
                      icon={transfer.originAccount.icon}
                      size="sm"
                      shape="rounded"
                      backgroundOpacity={20}
                      animated
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-foreground font-medium text-sm">
                          {transfer.originAccount.name}
                        </p>
                        <ArrowRight className="h-3 w-3 text-text-quaternary flex-shrink-0" />
                        <p className="text-foreground font-medium text-sm">
                          {transfer.destinationAccount.name}
                        </p>
                      </div>
                      {transfer.description && (
                        <p className="text-text-quaternary text-xs mt-1">{transfer.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount (neutral color) */}
                  <div className="text-right ml-3">
                    <p className="text-sm font-semibold whitespace-nowrap text-foreground">
                      {formatCurrency(transfer.amount, transfer.originAccount.currencyCode)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
