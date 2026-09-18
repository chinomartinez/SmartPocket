import { useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Plus, Search } from "lucide-react";
import { ErrorAlert } from "@/components/ErrorAlert";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
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
import { CreditCardPurchaseFormDialog } from "./CreditCardPurchaseFormDialog";
import { CreditCardSubscriptionFormDialog } from "./CreditCardSubscriptionFormDialog";
import { CREDIT_CARD_ACTIVITY_TYPES } from "../creditCardActivityConstants";
import { CreditCardActivityItem } from "./CreditCardActivityItem";

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

type ActivityDialogState = {
  type: CreditCardActivityType;
  activity: CreditCardActivityListItemDTO | null;
} | null;

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
  const [deleteActivity, setDeleteActivity] = useState<CreditCardActivityListItemDTO | null>(null);
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

  const openCreateDialog = (type: CreditCardActivityType) => {
    setDialogState({ type, activity: null });
  };

  const handleEditActivity = (activity: CreditCardActivityListItemDTO) => {
    setDialogState({ type: activity.type, activity });
  };

  const handleDeleteActivity = (activity: CreditCardActivityListItemDTO) => {
    setDeleteActivity(activity);
  };

  const handleCancelSubscription = (activity: CreditCardActivityListItemDTO) => {
    cancelSubscriptionMutation.mutate({ id: activity.id, creditCardId: cardId });
  };

  const handleConfirmDelete = () => {
    if (!deleteActivity) return;

    const mutation =
      deleteActivity.type === CREDIT_CARD_ACTIVITY_TYPES.PURCHASE
        ? deletePurchaseMutation
        : deleteSubscriptionMutation;

    mutation.mutate(
      { id: deleteActivity.id, creditCardId: cardId },
      { onSuccess: () => setDeleteActivity(null) },
    );
  };

  const purchaseActivity =
    dialogState?.type === CREDIT_CARD_ACTIVITY_TYPES.PURCHASE ? dialogState.activity : null;
  const subscriptionActivity =
    dialogState?.type === CREDIT_CARD_ACTIVITY_TYPES.SUBSCRIPTION ? dialogState.activity : null;

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
            onClick={() => openCreateDialog(CREDIT_CARD_ACTIVITY_TYPES.PURCHASE)}
          >
            <Plus className="size-4" /> <span>Compra</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Agregar suscripción"
            onClick={() => openCreateDialog(CREDIT_CARD_ACTIVITY_TYPES.SUBSCRIPTION)}
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
            <CreditCardActivityItem
              key={`${activity.type}-${activity.id}`}
              activity={activity}
              currencyCode={currencyCode}
              onEdit={handleEditActivity}
              onDelete={handleDeleteActivity}
              onCancelSubscription={handleCancelSubscription}
            />
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
        activity={purchaseActivity ?? undefined}
        open={dialogState?.type === CREDIT_CARD_ACTIVITY_TYPES.PURCHASE}
        onOpenChange={(open) => {
          if (!open) setDialogState(null);
        }}
      />
      <CreditCardSubscriptionFormDialog
        cardId={cardId}
        currencyCode={currencyCode}
        activity={subscriptionActivity ?? undefined}
        open={dialogState?.type === CREDIT_CARD_ACTIVITY_TYPES.SUBSCRIPTION}
        onOpenChange={(open) => {
          if (!open) setDialogState(null);
        }}
      />
      <DeleteConfirmationDialog
        open={Boolean(deleteActivity)}
        onOpenChange={(open) => {
          if (!open) setDeleteActivity(null);
        }}
        onConfirm={handleConfirmDelete}
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
