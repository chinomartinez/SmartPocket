import { CalendarDays, ChevronRight, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CreditCardStatementListItemDTO } from "@/api/services/credit-cards/creditCardTypes";
import { formatCurrency } from "@/utils/formatters";
import { formatDateOnly } from "@/utils/dateHelpers";

interface CreditCardStatementItemProps {
  statement: CreditCardStatementListItemDTO;
  currencyCode: string;
  onOpen: (statement: CreditCardStatementListItemDTO) => void;
  onDelete: (statement: CreditCardStatementListItemDTO) => void;
}

export function CreditCardStatementItem({
  statement,
  currencyCode,
  onOpen,
  onDelete,
}: CreditCardStatementItemProps) {
  const handleOpen = () => onOpen(statement);
  const handleDelete = () => onDelete(statement);
  const totalItems = statement.installmentsCount + statement.chargesCount;

  const formatClosingDate = formatDateOnly(statement.closingDate, {
    day: "2-digit",
    month: "short",
  });

  const formatDueDate = formatDateOnly(statement.dueDate, {
    day: "2-digit",
    month: "short",
  });

  return (
    <article className="group relative rounded-lg transition-colors hover:bg-hover-muted">
      <button
        type="button"
        onClick={handleOpen}
        className="block w-full rounded-lg p-4 pr-12 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sp-blue-400"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{statement.description}</p>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-text-quaternary">
              <CalendarDays className="size-3.5" />
              Cierre {formatClosingDate} · vence {formatDueDate}
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              statement.status === "Paid"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300"
            }
          >
            {statement.status === "Paid" ? "Pagado" : "Cerrado"}
          </Badge>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-text-quaternary">Total registrado</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {formatCurrency(statement.totalItemsInCardCurrency, currencyCode)}
            </p>
            {statement.totalItemsInUsd !== null && statement.totalItemsInUsd > 0 && (
              <p className="mt-0.5 text-xs text-text-quaternary">
                {formatCurrency(statement.totalItemsInUsd, "USD")}
              </p>
            )}
          </div>
          <span className="text-xs text-text-quaternary">
            {totalItems} {totalItems === 1 ? "ítem" : "ítems"}{" "}
            <ChevronRight className="ml-1 inline size-3.5" />
          </span>
        </div>
      </button>
      <button
        type="button"
        aria-label={`Eliminar ${statement.description}`}
        onClick={handleDelete}
        className="absolute right-3 top-4 rounded-md p-1.5 text-text-quaternary opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-300 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 group-hover:opacity-100"
      >
        <Trash2 className="size-4" />
      </button>
    </article>
  );
}
