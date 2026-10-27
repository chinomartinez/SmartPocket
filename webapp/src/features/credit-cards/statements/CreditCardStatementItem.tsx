import { CalendarDays, Trash2, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CreditCardStatementListItemDTO } from "@/api/services/credit-cards/creditCardTypes";
import { formatCurrency } from "@/utils/formatters";
import { formatDateOnlyLabel } from "@/utils/dateHelpers";

interface CreditCardStatementItemProps {
  statement: CreditCardStatementListItemDTO;
  currencyCode: string;
  onOpen: (statement: CreditCardStatementListItemDTO) => void;
  onManagePayments: (statement: CreditCardStatementListItemDTO) => void;
  onDelete: (statement: CreditCardStatementListItemDTO) => void;
}

export function CreditCardStatementItem({
  statement,
  currencyCode,
  onOpen,
  onManagePayments,
  onDelete,
}: CreditCardStatementItemProps) {
  const canEdit = statement.status === "Closed";
  const handleOpen = () => {
    if (canEdit) onOpen(statement);
  };
  const handleDelete = () => onDelete(statement);
  const currencySummaries = [...statement.totals.currencySummaries].sort(
    (first, second) =>
      Number(first.currencyCode !== currencyCode) - Number(second.currencyCode !== currencyCode),
  );

  const statusLabel = {
    Closed: "Cerrado",
    PartiallyPaid: "Parcialmente pagado",
    Paid: "Pagado",
  }[statement.status];

  const formatClosingDate = formatDateOnlyLabel(statement.closingDate, {
    day: "2-digit",
    month: "short",
  });

  const formatDueDate = formatDateOnlyLabel(statement.dueDate, {
    day: "2-digit",
    month: "short",
  });

  return (
    <article className="rounded-lg transition-colors hover:bg-hover-muted">
      <div className="flex items-start gap-3 p-4">
        <button
          type="button"
          onClick={handleOpen}
          disabled={!canEdit}
          title={canEdit ? "Editar resumen" : "El resumen tiene pagos y no se puede editar"}
          className="-m-1 min-w-0 flex-1 rounded-lg p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sp-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <p className="truncate font-medium text-foreground">{statement.description}</p>
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-text-quaternary">
            <CalendarDays className="size-3.5 shrink-0" />
            Cierre {formatClosingDate} · vence {formatDueDate}
          </p>
          <p className="mt-1 text-xs text-text-quaternary">
            {statement.installmentsCount} {statement.installmentsCount === 1 ? "cuota" : "cuotas"}{" "}
            · {statement.chargesCount} {statement.chargesCount === 1 ? "cargo" : "cargos"}
          </p>
        </button>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge
            variant="outline"
            className={
              statement.status === "Paid"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : statement.status === "PartiallyPaid"
                  ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-300"
            }
          >
            {statusLabel}
          </Badge>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={`Gestionar pagos de ${statement.description}`}
              title="Gestionar pagos"
              onClick={() => onManagePayments(statement)}
              className="inline-flex size-10 items-center justify-center rounded-lg text-text-quaternary transition-colors hover:bg-sp-blue-500/10 hover:text-sp-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sp-blue-400 sm:size-9"
            >
              <WalletCards className="size-5" />
            </button>
            <button
              type="button"
              aria-label={`Eliminar ${statement.description}`}
              title="Eliminar resumen"
              onClick={handleDelete}
              className="inline-flex size-10 items-center justify-center rounded-lg text-text-quaternary transition-colors hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 sm:size-9"
            >
              <Trash2 className="size-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-2 overflow-x-auto rounded-md border border-border-subtle/70 bg-secondary/30">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-border-subtle text-text-quaternary">
              <th className="px-3 py-2 text-left font-medium">Moneda</th>
              <th className="px-3 py-2 text-right font-medium">Incluido</th>
              <th className="px-3 py-2 text-right font-medium">Pagado</th>
            </tr>
          </thead>
          <tbody>
            {currencySummaries.map((summary) => (
              <tr
                key={summary.currencyCode}
                className="border-b border-border-subtle/60 last:border-b-0"
              >
                <td className="px-3 py-2 font-semibold text-foreground">{summary.currencyCode}</td>
                <td className="px-3 py-2 text-right font-semibold text-foreground">
                  {formatCurrency(summary.includedAmount, summary.currencyCode)}
                </td>
                <td className="px-3 py-2 text-right font-semibold text-sp-blue-400">
                  {summary.payment
                    ? formatCurrency(summary.payment.amount, summary.payment.currencyCode)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
