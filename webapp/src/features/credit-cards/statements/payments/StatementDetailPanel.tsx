import { formatDateOnly } from "@/utils/dateHelpers";
import { formatCurrency } from "@/utils/formatters";
import type { StatementDetailItem } from "./paymentTypes";

export function StatementDetailPanel({ items }: { items: StatementDetailItem[] }) {
  const hasMultipleCurrencies = new Set(items.map((item) => item.currencyCode)).size > 1;
  const itemsLabel = items.length === 1 ? "1 item incluido" : `${items.length} items incluidos`;

  return (
    <section
      aria-labelledby="statement-detail-title"
      className="rounded-lg border border-border-subtle"
    >
      <div className="px-4 py-3">
        <h3 id="statement-detail-title" className="font-semibold text-foreground">
          Detalle del resumen
        </h3>
        <p className="text-xs text-text-quaternary">{itemsLabel}</p>
      </div>

      {items.length === 0 ? (
        <p className="border-t border-border-subtle px-4 py-3 text-sm text-text-quaternary">
          Sin items incluidos.
        </p>
      ) : (
        <ul className="divide-y divide-border-subtle/70 border-t border-border-subtle">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{item.description}</p>
                <p className="truncate text-xs text-text-quaternary">
                  {item.typeLabel} ·{" "}
                  {formatDateOnly(item.effectiveDate, { day: "2-digit", month: "short" })}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm tabular-nums whitespace-nowrap text-foreground">
                  {formatCurrency(item.amount, item.currencyCode)}
                </p>
                {hasMultipleCurrencies && (
                  <p className="text-xs text-text-quaternary">{item.currencyCode}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
