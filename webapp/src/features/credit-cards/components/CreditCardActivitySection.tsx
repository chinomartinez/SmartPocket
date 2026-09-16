import { useState } from "react";
import { ChevronLeft, ChevronRight, Ellipsis, Filter, Plus, Search } from "lucide-react";
import { ErrorAlert } from "@/components/ErrorAlert";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { IconBox } from "@/components/iconBoxes/IconBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useCancelCreditCardSubscription,
  useCreditCardActivities,
  useDeleteCreditCardPurchase,
  useDeleteCreditCardSubscription,
} from "@/api/services/credit-cards/useCreditCards";
import type {
  CreditCardActivityListItemDTO,
  CreditCardActivityType,
} from "@/api/services/credit-cards/creditCardTypes";
import { formatCurrency } from "@/utils/formatters";
import { CreditCardPurchaseFormDialog } from "../CreditCardPurchaseFormDialog";
import { CreditCardSubscriptionFormDialog } from "../CreditCardSubscriptionFormDialog";
import { CREDIT_CARD_ACTIVITY_TYPES } from "../creditCardActivityConstants";

type ActivityFilter = "Todos" | CreditCardActivityType;

const PAGE_SIZE = 10;

const ACTIVITY_FILTER_OPTIONS = [
  "Todos",
  CREDIT_CARD_ACTIVITY_TYPES.PURCHASE,
  CREDIT_CARD_ACTIVITY_TYPES.SUBSCRIPTION,
] as const;

const ACTIVITY_TYPE_LABELS: Record<CreditCardActivityType, string> = {
  [CREDIT_CARD_ACTIVITY_TYPES.PURCHASE]: "Compras",
  [CREDIT_CARD_ACTIVITY_TYPES.SUBSCRIPTION]: "Suscripciones",
};

type ActivityDialogState =
  | { mode: "create"; type: CreditCardActivityType }
  | { mode: "edit"; activity: CreditCardActivityListItemDTO }
  | null;

const statusLabels = {
  InProgress: "En proceso",
  Paid: "Pagada",
  Finished: "Finalizada",
  Active: "Activa",
  Cancelled: "Cancelada",
} as const;

function getStatusClass(activity: CreditCardActivityListItemDTO) {
  if (activity.status === "Paid") return "border-emerald-500/30 text-emerald-400";
  if (activity.status === "Finished") return "border-slate-400/30 text-slate-300";
  if (activity.status === "Cancelled") return "border-red-400/30 text-red-300";
  if (activity.type === CREDIT_CARD_ACTIVITY_TYPES.SUBSCRIPTION)
    return "border-violet-400/30 text-violet-300";
  return "border-amber-400/30 text-amber-300";
}

function getActivityDetails(activity: CreditCardActivityListItemDTO) {
  if (activity.type === CREDIT_CARD_ACTIVITY_TYPES.SUBSCRIPTION) {
    return activity.chargeCount === null ? "Suscripción" : `${activity.chargeCount} cargos`;
  }

  return activity.installmentsCount === null ? "Compra" : `${activity.installmentsCount} cuotas`;
}

interface CreditCardActivitySectionProps {
  cardId: number;
  cardName: string;
  currencyCode: string;
}

export function CreditCardActivitySection({
  cardId,
  cardName,
  currencyCode,
}: CreditCardActivitySectionProps) {
  const [filter, setFilter] = useState<ActivityFilter>("Todos");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [dialogState, setDialogState] = useState<ActivityDialogState>(null);
  const [deleteActivity, setDeleteActivity] = useState<CreditCardActivityListItemDTO>();
  const [openActionActivity, setOpenActionActivity] =
    useState<CreditCardActivityListItemDTO>();
  const deletePurchaseMutation = useDeleteCreditCardPurchase();
  const deleteSubscriptionMutation = useDeleteCreditCardSubscription();
  const cancelSubscriptionMutation = useCancelCreditCardSubscription();

  const activityQuery = useCreditCardActivities(cardId, {
    page,
    pageSize: PAGE_SIZE,
    type: filter === "Todos" ? undefined : filter,
    search: search.trim() || undefined,
  });

  const activities = activityQuery.data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((activityQuery.data?.totalCount ?? 0) / PAGE_SIZE));

  const updateFilter = (nextFilter: ActivityFilter) => {
    setFilter(nextFilter);
    setPage(1);
  };

  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <section className="min-w-0 space-y-4" aria-labelledby="activity-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="activity-title" className="text-xl font-semibold text-foreground">
            Compras y suscripciones
          </h2>
          <p className="mt-1 text-sm text-text-quaternary">Actividad de {cardName}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-label="Agregar compra"
            onClick={() =>
              setDialogState({ mode: "create", type: CREDIT_CARD_ACTIVITY_TYPES.PURCHASE })
            }
          >
            <Plus className="size-4" /> <span>Compra</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Agregar suscripción"
            onClick={() =>
              setDialogState({ mode: "create", type: CREDIT_CARD_ACTIVITY_TYPES.SUBSCRIPTION })
            }
          >
            <Plus className="size-4" /> <span>Suscripción</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface-container-low/50 p-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-quaternary" />
          <input
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            className="h-9 w-full rounded-lg border border-border-subtle bg-background/50 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-text-quaternary focus:border-sp-blue-400/60"
            placeholder="Buscar consumo..."
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <Filter className="mt-2 size-4 shrink-0 text-text-quaternary" />
          {ACTIVITY_FILTER_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => updateFilter(item)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === item ? "bg-sp-blue-500/15 text-sp-blue-400" : "text-text-quaternary hover:bg-hover-muted hover:text-foreground"}`}
            >
              {item === "Todos" ? item : ACTIVITY_TYPE_LABELS[item]}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-container-low/40">
        <div className="hidden grid-cols-[minmax(0,1.7fr)_110px_130px_110px_32px] gap-4 border-b border-border-subtle px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-quaternary md:grid">
          <span>Consumo</span>
          <span className="text-center">Fecha</span>
          <span className="text-center">Importe</span>
          <span className="text-center">Estado</span>
          <span />
        </div>
        {activityQuery.isLoading ? (
          <div className="px-5 py-10 text-center text-sm text-text-quaternary">
            Cargando actividad...
          </div>
        ) : activityQuery.error ? (
          <ErrorAlert error={activityQuery.error} className="m-4" />
        ) : activities.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-text-quaternary">
            No hay actividades para los filtros seleccionados.
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={`${activity.type}-${activity.id}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-3 border-b border-border-subtle px-4 py-4 last:border-0 md:grid-cols-[minmax(0,1.7fr)_110px_130px_110px_32px] md:items-center md:gap-4 md:px-5"
            >
              <div className="col-span-2 row-start-1 flex min-w-0 items-center gap-3 md:col-auto md:row-auto">
                <IconBox
                  icon={activity.category.icon}
                  size="sm"
                  shape="rounded"
                  className="shrink-0"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {activity.description}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-quaternary">
                    <span>{activity.category.name}</span>
                    <span className="size-1 rounded-full bg-text-quaternary/50" />
                    <span>{getActivityDetails(activity)}</span>
                  </div>
                </div>
              </div>
              <div className="col-start-1 row-start-2 text-xs text-text-quaternary md:col-auto md:row-auto md:justify-self-center">
                {activity.effectiveDate}
              </div>
              <div className="col-start-1 row-start-3 flex items-center justify-start md:col-auto md:row-auto md:justify-self-center">
                <span className="whitespace-nowrap text-sm font-semibold text-foreground">
                  {formatCurrency(activity.amount, activity.currencyCode || currencyCode)}
                </span>
              </div>
              <div className="col-start-2 row-start-2 justify-self-end md:col-auto md:row-auto md:justify-self-center">
                <Badge
                  variant="outline"
                  className={`whitespace-nowrap ${getStatusClass(activity)}`}
                >
                  {statusLabels[activity.status]}
                </Badge>
              </div>
              <div className="relative col-start-2 row-start-3 justify-self-end md:col-auto md:row-auto md:block">
                <button
                  type="button"
                  aria-label={`Acciones para ${activity.description}`}
                  onClick={() =>
                    setOpenActionActivity((current) =>
                      current?.id === activity.id && current.type === activity.type
                        ? undefined
                        : activity,
                    )
                  }
                  className="text-text-quaternary hover:text-foreground"
                >
                  <Ellipsis className="size-5" />
                </button>
                {openActionActivity?.id === activity.id &&
                  openActionActivity.type === activity.type && (
                  <div className="absolute right-0 top-8 z-10 min-w-36 rounded-lg border border-border-subtle bg-surface-container-high p-1 shadow-lg">
                    <button
                      type="button"
                      className="block w-full rounded-md px-3 py-2 text-left text-xs text-foreground hover:bg-hover-muted"
                      onClick={() => {
                        setDialogState({ mode: "edit", activity });
                        setOpenActionActivity(undefined);
                      }}
                    >
                      Editar
                    </button>
                    {activity.type === CREDIT_CARD_ACTIVITY_TYPES.SUBSCRIPTION &&
                      activity.status === "Active" && (
                        <button
                          type="button"
                          className="block w-full rounded-md px-3 py-2 text-left text-xs text-amber-300 hover:bg-hover-muted"
                          onClick={() => {
                            cancelSubscriptionMutation.mutate({
                              id: activity.id,
                              creditCardId: cardId,
                            });
                            setOpenActionActivity(undefined);
                          }}
                        >
                          Cancelar suscripción
                        </button>
                      )}
                    <button
                      type="button"
                      className="block w-full rounded-md px-3 py-2 text-left text-xs text-red-300 hover:bg-hover-muted"
                      onClick={() => {
                        setDeleteActivity(activity);
                        setOpenActionActivity(undefined);
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div className="flex items-center justify-between border-t border-border-subtle/60 px-4 py-3 text-xs text-text-quaternary sm:px-5">
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              aria-label="Página anterior"
              disabled={page <= 1 || activityQuery.isFetching}
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              className="rounded-md p-1.5 hover:bg-hover-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Página siguiente"
              disabled={page >= totalPages || activityQuery.isFetching}
              onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
              className="rounded-md p-1.5 hover:bg-hover-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
      <CreditCardPurchaseFormDialog
        cardId={cardId}
        currencyCode={currencyCode}
        activity={
          dialogState?.mode === "edit" &&
          dialogState.activity.type === CREDIT_CARD_ACTIVITY_TYPES.PURCHASE
            ? dialogState.activity
            : undefined
        }
        open={
          dialogState?.mode === "create"
            ? dialogState.type === CREDIT_CARD_ACTIVITY_TYPES.PURCHASE
            : dialogState?.mode === "edit" &&
              dialogState.activity.type === CREDIT_CARD_ACTIVITY_TYPES.PURCHASE
        }
        onOpenChange={(open) => {
          if (!open) setDialogState(null);
        }}
      />
      <CreditCardSubscriptionFormDialog
        cardId={cardId}
        currencyCode={currencyCode}
        activity={
          dialogState?.mode === "edit" &&
          dialogState.activity.type === CREDIT_CARD_ACTIVITY_TYPES.SUBSCRIPTION
            ? dialogState.activity
            : undefined
        }
        open={
          dialogState?.mode === "create"
            ? dialogState.type === CREDIT_CARD_ACTIVITY_TYPES.SUBSCRIPTION
            : dialogState?.mode === "edit" &&
              dialogState.activity.type === CREDIT_CARD_ACTIVITY_TYPES.SUBSCRIPTION
        }
        onOpenChange={(open) => {
          if (!open) setDialogState(null);
        }}
      />
      <DeleteConfirmationDialog
        open={Boolean(deleteActivity)}
        onOpenChange={(open) => {
          if (!open) setDeleteActivity(undefined);
        }}
        onConfirm={() => {
          if (!deleteActivity) return;
          const mutation =
            deleteActivity.type === CREDIT_CARD_ACTIVITY_TYPES.PURCHASE
              ? deletePurchaseMutation
              : deleteSubscriptionMutation;
          mutation.mutate(
            { id: deleteActivity.id, creditCardId: cardId },
            { onSuccess: () => setDeleteActivity(undefined) },
          );
        }}
        itemName={deleteActivity?.description ?? ""}
        itemType={
          deleteActivity?.type === CREDIT_CARD_ACTIVITY_TYPES.SUBSCRIPTION
            ? "suscripción"
            : "compra"
        }
        isDeleting={deletePurchaseMutation.isPending || deleteSubscriptionMutation.isPending}
        description="Esta acción elimina el registro de SmartPocket y puede afectar la trazabilidad de sus cuotas o cargos asociados."
      />
    </section>
  );
}
