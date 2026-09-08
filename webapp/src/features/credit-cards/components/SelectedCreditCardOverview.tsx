import { CreditCard, Info, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiError } from "@/api/types";
import type {
  CreditCardListItemDTO,
  CreditCardOverviewDTO,
} from "@/api/services/credit-cards/creditCardTypes";
import { formatCurrencyByCode } from "@/utils/formatters";

interface SelectedCreditCardOverviewProps {
  card: CreditCardListItemDTO;
  overview?: CreditCardOverviewDTO;
  isLoading: boolean;
  error: unknown;
  onEdit: () => void;
}

export function SelectedCreditCardOverview({
  card,
  overview,
  isLoading,
  error,
  onEdit,
}: SelectedCreditCardOverviewProps) {
  const usage =
    overview && overview.creditLimit > 0
      ? Math.round((overview.pendingAmount / overview.creditLimit) * 100)
      : 0;

  return (
    <section
      className="rounded-2xl border border-border-subtle bg-surface-container-low/70 p-5 md:p-6"
      aria-labelledby="selected-card-title"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-sp-blue-500/15 text-sp-blue-400">
            <CreditCard className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="selected-card-title" className="text-xl font-semibold text-foreground">
                {card.name}
              </h2>
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              >
                Activa
              </Badge>
            </div>
            <p className="mt-1 text-sm text-text-quaternary">
              Registro manual · moneda base {card.currencyCode}
            </p>
          </div>
        </div>
        {error ? <ErrorAlert error={error as ApiError} className="lg:max-w-sm" /> : null}
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
          <div>
            <p
              className="flex items-center gap-1 text-xs text-text-quaternary"
              title="Estimación basada en los registros pendientes de SmartPocket. No representa el disponible real informado por el banco."
            >
              Pendiente registrado <Info className="size-3.5" />
            </p>
            {isLoading ? (
              <Skeleton className="mt-2 h-6 w-28" />
            ) : (
              <p className="mt-1 font-semibold text-foreground">
                  {formatCurrencyByCode(overview?.pendingAmount ?? 0, card.currencyCode)}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-text-quaternary">Disponible estimado</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-6 w-28" />
            ) : (
              <p className="mt-1 font-semibold text-emerald-400">
                  {formatCurrencyByCode(overview?.estimatedAvailableAmount ?? 0, card.currencyCode)}
              </p>
            )}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs text-text-quaternary">Uso estimado del límite</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-sp-blue-400"
                  style={{ width: `${Math.min(usage, 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-foreground">{usage}%</span>
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end border-t border-border-subtle pt-4">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="size-4" /> Editar tarjeta
          </Button>
        </div>
      </div>
    </section>
  );
}
