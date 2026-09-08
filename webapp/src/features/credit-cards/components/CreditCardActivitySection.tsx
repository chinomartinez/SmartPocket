import { useState } from "react";
import { ChevronRight, Ellipsis, Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrencyByCode } from "@/utils/formatters";

type PurchaseType = "Compra" | "Suscripción";
type PurchaseStatus = "En proceso" | "Activa" | "Pagada";

interface PurchaseMock {
  id: number;
  description: string;
  category: string;
  date: string;
  amount: number;
  installments: string;
  type: PurchaseType;
  status: PurchaseStatus;
  icon: string;
}

const purchases: PurchaseMock[] = [
  {
    id: 1,
    description: "Notebook Lenovo IdeaPad",
    category: "Tecnología",
    date: "18 jun 2026",
    amount: 489000,
    installments: "3 de 12 cuotas",
    type: "Compra",
    status: "En proceso",
    icon: "⌁",
  },
  {
    id: 2,
    description: "Spotify Premium",
    category: "Entretenimiento",
    date: "02 jul 2026",
    amount: 4899,
    installments: "Mensual",
    type: "Suscripción",
    status: "Activa",
    icon: "♫",
  },
  {
    id: 3,
    description: "Supermercado La Anónima",
    category: "Alimentos",
    date: "05 jul 2026",
    amount: 86450,
    installments: "1 pago",
    type: "Compra",
    status: "Pagada",
    icon: "⌂",
  },
  {
    id: 4,
    description: "Netflix",
    category: "Entretenimiento",
    date: "07 jul 2026",
    amount: 15999,
    installments: "Mensual",
    type: "Suscripción",
    status: "Activa",
    icon: "N",
  },
];

interface CreditCardActivitySectionProps {
  cardName: string;
  currencyCode: string;
}

export function CreditCardActivitySection({ cardName, currencyCode }: CreditCardActivitySectionProps) {
  const [filter, setFilter] = useState<"Todos" | PurchaseType>("Todos");
  const visiblePurchases = purchases.filter(
    (purchase) => filter === "Todos" || purchase.type === filter,
  );

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
          <Button variant="outline" size="sm">
            <Plus className="size-4" /> <span className="hidden sm:inline">Agregar</span>
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Más opciones">
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface-container-low/50 p-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-quaternary" />
          <input
            className="h-9 w-full rounded-lg border border-border-subtle bg-background/50 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-text-quaternary focus:border-sp-blue-400/60"
            placeholder="Buscar consumo..."
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <Filter className="mt-2 size-4 shrink-0 text-text-quaternary" />
          {(["Todos", "Compra", "Suscripción"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() =>
                setFilter(
                  item === "Compra" ? "Compra" : item === "Suscripción" ? "Suscripción" : "Todos",
                )
              }
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === item ? "bg-sp-blue-500/15 text-sp-blue-400" : "text-text-quaternary hover:bg-hover-muted hover:text-foreground"}`}
            >
              {item === "Compra" ? "Compras" : item === "Suscripción" ? "Suscripciones" : item}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-container-low/40">
        <div className="hidden grid-cols-[minmax(0,1.7fr)_110px_130px_32px] gap-4 border-b border-border-subtle px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-quaternary md:grid">
          <span>Consumo</span>
          <span>Fecha</span>
          <span>Importe</span>
          <span />
        </div>
        {visiblePurchases.map((purchase) => (
          <div
            key={purchase.id}
            className="grid gap-3 border-b border-border-subtle px-4 py-4 last:border-0 md:grid-cols-[minmax(0,1.7fr)_110px_130px_32px] md:items-center md:gap-4 md:px-5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/70 text-sm font-semibold text-sp-blue-300">
                {purchase.icon}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {purchase.description}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-quaternary">
                  <span>{purchase.category}</span>
                  <span className="size-1 rounded-full bg-text-quaternary/50" />
                  <span>{purchase.installments}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-text-quaternary md:block">
              {purchase.date}
              <Badge
                variant="outline"
                className={`ml-2 md:hidden ${purchase.type === "Suscripción" ? "border-violet-400/30 text-violet-300" : "border-sp-blue-400/30 text-sp-blue-300"}`}
              >
                {purchase.type}
              </Badge>
            </div>
            <div className="flex items-center justify-between md:block">
              <span className="text-sm font-semibold text-foreground">
                {formatCurrencyByCode(purchase.amount, currencyCode)}
              </span>
              <Badge
                variant="outline"
                className={`ml-2 hidden md:inline-flex ${purchase.status === "Pagada" ? "border-emerald-500/30 text-emerald-400" : purchase.type === "Suscripción" ? "border-violet-400/30 text-violet-300" : "border-amber-400/30 text-amber-300"}`}
              >
                {purchase.status}
              </Badge>
            </div>
            <button
              type="button"
              aria-label={`Editar ${purchase.description}`}
              className="hidden text-text-quaternary hover:text-foreground md:block"
            >
              <Ellipsis className="size-5" />
            </button>
          </div>
        ))}
        <div className="border-t border-border-subtle/60 px-5 py-3 text-center">
          <button
            type="button"
            className="text-xs font-medium text-sp-blue-400 hover:text-sp-blue-300"
          >
            Ver toda la actividad <ChevronRight className="ml-1 inline size-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
