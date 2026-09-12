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
import { formatCurrency } from "@/utils/formatters";

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
          <div className="relative min-w-0 flex-1 pr-20 lg:pr-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="selected-card-title" className="text-xl font-semibold text-foreground">
                {card.name}
              </h2>
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              >
                Activa
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-0 top-0 h-8 px-2.5 text-xs lg:static"
                onClick={onEdit}
              >
                <Pencil className="size-3.5" /> Editar
              </Button>
            </div>
            <p className="mt-1 text-sm text-text-quaternary">Moneda base {card.currencyCode}</p>
          </div>
        </div>
        {error ? <ErrorAlert error={error as ApiError} className="lg:max-w-sm" /> : null}
        <div className="grid grid-cols-3 gap-x-3 gap-y-3 sm:gap-x-8">
          <div className="min-w-0">
            <p
              className="min-h-8 flex items-start gap-1 text-xs leading-tight text-text-quaternary"
              title="Estimación basada en los registros pendientes de SmartPocket. No representa el disponible real informado por el banco."
            >
              <span>Pendiente registrado</span>{" "}
              <Info className="mt-0.5 hidden size-3.5 shrink-0 sm:block" />
            </p>
            {isLoading ? (
              <Skeleton className="mt-2 h-6 w-full max-w-28" />
            ) : (
              <p className="mt-1 text-sm font-semibold text-foreground sm:text-base">
                {formatCurrency(overview?.pendingAmount ?? 0, card.currencyCode)}
              </p>
            )}
          </div>
          <div className="min-w-0">
            <p className="min-h-8 text-xs leading-tight text-text-quaternary">
              Disponible estimado
            </p>
            {isLoading ? (
              <Skeleton className="mt-2 h-6 w-full max-w-28" />
            ) : (
              <p className="mt-1 text-sm font-semibold text-emerald-400 sm:text-base">
                {formatCurrency(overview?.estimatedAvailableAmount ?? 0, card.currencyCode)}
              </p>
            )}
          </div>
          <div className="min-w-0">
            <p className="min-h-8 text-xs leading-tight text-text-quaternary">
              Uso estimado del límite
            </p>
            <div className="mt-2 flex min-w-0 items-center gap-1.5 sm:gap-2">
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-sp-blue-400"
                  style={{ width: `${Math.min(usage, 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-foreground">{usage}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
