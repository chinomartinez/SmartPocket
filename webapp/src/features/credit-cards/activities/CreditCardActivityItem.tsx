import { useEffect, useRef, useState } from "react";
import { Ellipsis } from "lucide-react";
import { IconBox } from "@/components/iconBoxes/IconBox";
import { Badge } from "@/components/ui/badge";
import type { CreditCardActivityListItemDTO } from "@/api/services/credit-cards/creditCardTypes";
import { formatCurrency } from "@/utils/formatters";
import { CREDIT_CARD_ACTIVITY_TYPES } from "../creditCardActivityConstants";

const STATUS_LABELS = {
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
  if (activity.type === CREDIT_CARD_ACTIVITY_TYPES.SUBSCRIPTION) {
    return "border-violet-400/30 text-violet-300";
  }
  return "border-amber-400/30 text-amber-300";
}

function getActivityDetails(activity: CreditCardActivityListItemDTO) {
  if (activity.type === CREDIT_CARD_ACTIVITY_TYPES.SUBSCRIPTION) {
    return activity.chargeCount === null ? "Suscripción" : `${activity.chargeCount} cargos`;
  }

  return activity.installmentsCount === null ? "Compra" : `${activity.installmentsCount} cuotas`;
}

interface CreditCardActivityItemProps {
  activity: CreditCardActivityListItemDTO;
  currencyCode: string;
  onEdit: (activity: CreditCardActivityListItemDTO) => void;
  onDelete: (activity: CreditCardActivityListItemDTO) => void;
  onCancelSubscription: (activity: CreditCardActivityListItemDTO) => void;
}

export function CreditCardActivityItem({
  activity,
  currencyCode,
  onEdit,
  onDelete,
  onCancelSubscription,
}: CreditCardActivityItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-3 border-b border-border-subtle px-4 py-4 last:border-0 md:grid-cols-[minmax(0,1.7fr)_110px_130px_110px_32px] md:items-center md:gap-4 md:px-5">
      <div className="col-span-2 row-start-1 flex min-w-0 items-center gap-3 md:col-auto md:row-auto">
        <IconBox icon={activity.category.icon} size="sm" shape="rounded" className="shrink-0" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{activity.description}</p>
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
        <Badge variant="outline" className={`whitespace-nowrap ${getStatusClass(activity)}`}>
          {STATUS_LABELS[activity.status]}
        </Badge>
      </div>
      <div
        ref={menuRef}
        className="relative col-start-2 row-start-3 justify-self-end md:col-auto md:row-auto md:block"
      >
        <button
          type="button"
          aria-label={`Acciones para ${activity.description}`}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="text-text-quaternary hover:text-foreground"
        >
          <Ellipsis className="size-5" />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 top-8 z-10 min-w-36 rounded-lg border border-border-subtle bg-surface-container-high p-1 shadow-lg">
            <button
              type="button"
              className="block w-full rounded-md px-3 py-2 text-left text-xs text-foreground hover:bg-hover-muted"
              onClick={() => {
                closeMenu();
                onEdit(activity);
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
                    closeMenu();
                    onCancelSubscription(activity);
                  }}
                >
                  Cancelar suscripción
                </button>
              )}
            <button
              type="button"
              className="block w-full rounded-md px-3 py-2 text-left text-xs text-red-300 hover:bg-hover-muted"
              onClick={() => {
                closeMenu();
                onDelete(activity);
              }}
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
