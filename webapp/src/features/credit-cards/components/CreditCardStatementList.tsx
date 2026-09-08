import { CalendarDays, ChevronRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatAmount } from "./creditCardHelpers";

const statements = [
  {
    month: "Julio 2026",
    close: "14 jul",
    due: "05 ago",
    total: 186450,
    status: "Cerrado",
    items: 6,
  },
  {
    month: "Junio 2026",
    close: "14 jun",
    due: "05 jul",
    total: 243800,
    status: "Pagado",
    items: 9,
  },
  { month: "Mayo 2026", close: "14 may", due: "05 jun", total: 198200, status: "Pagado", items: 7 },
];

export function CreditCardStatementList() {
  return (
    <section className="space-y-4" aria-labelledby="statements-title">
      <div className="flex items-end justify-between">
        <div>
          <h2 id="statements-title" className="text-xl font-semibold text-foreground">
            Resúmenes
          </h2>
          <p className="mt-1 text-sm text-text-quaternary">Cierres recientes de la tarjeta</p>
        </div>
        <button
          type="button"
          className="text-xs font-medium text-sp-blue-400 hover:text-sp-blue-300"
        >
          Ver todos
        </button>
      </div>
      <div className="rounded-xl border border-border-subtle bg-surface-container-low/40 p-2">
        {statements.map((statement, index) => (
          <article
            key={statement.month}
            className={`rounded-lg p-4 transition-colors hover:bg-hover-muted ${index === 0 ? "bg-sp-blue-500/5" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{statement.month}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-text-quaternary">
                  <CalendarDays className="size-3.5" /> Cierre {statement.close} · vence{" "}
                  {statement.due}
                </p>
              </div>
              <Badge
                variant="outline"
                className={
                  statement.status === "Pagado"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                }
              >
                {statement.status}
              </Badge>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-xs text-text-quaternary">Total del resumen</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {formatAmount(statement.total)}
                </p>
              </div>
              <span className="text-xs text-text-quaternary">
                {statement.items} ítems <ChevronRight className="ml-1 inline size-3.5" />
              </span>
            </div>
          </article>
        ))}
        <button
          type="button"
          className="m-2 flex w-[calc(100%-1rem)] items-center justify-center gap-2 rounded-lg border border-dashed border-sp-blue-400/30 py-3 text-sm font-medium text-sp-blue-400 transition-colors hover:bg-sp-blue-500/10"
        >
          <Sparkles className="size-4" /> Armar nuevo resumen
        </button>
      </div>
    </section>
  );
}
