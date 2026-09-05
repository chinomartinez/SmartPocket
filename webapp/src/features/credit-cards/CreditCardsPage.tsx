import { useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  CreditCard,
  Ellipsis,
  Info,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CardTheme = "violet" | "blue" | "amber";

interface CreditCardMock {
  id: number;
  name: string;
  issuer: string;
  lastFour: string;
  currency: string;
  limit: number;
  pending: number;
  closingRange: { startDay: number; endDay: number };
  dueRange: { startDay: number; endDay: number };
  theme: CardTheme;
}

interface PurchaseMock {
  id: number;
  description: string;
  category: string;
  date: string;
  amount: number;
  installments: string;
  type: "Compra" | "Suscripción";
  status: "En proceso" | "Activa" | "Pagada";
  icon: string;
}

const creditCards: CreditCardMock[] = [
  {
    id: 1,
    name: "Visa Signature",
    issuer: "Banco Galicia",
    lastFour: "4821",
    currency: "ARS",
    limit: 2500000,
    pending: 684500,
    closingRange: { startDay: 26, endDay: 2 },
    dueRange: { startDay: 4, endDay: 13 },
    theme: "violet",
  },
  {
    id: 2,
    name: "Mastercard Black",
    issuer: "BBVA",
    lastFour: "9037",
    currency: "ARS",
    limit: 1800000,
    pending: 422300,
    closingRange: { startDay: 20, endDay: 24 },
    dueRange: { startDay: 4, endDay: 10 },
    theme: "blue",
  },
  {
    id: 3,
    name: "American Express",
    issuer: "Amex",
    lastFour: "1164",
    currency: "USD",
    limit: 4500,
    pending: 1180,
    closingRange: { startDay: 7, endDay: 9 },
    dueRange: { startDay: 25, endDay: 28 },
    theme: "amber",
  },
];

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

const statements = [
  {
    month: "Julio 2026",
    close: "14 jul",
    due: "05 ago",
    total: 186450,
    status: "Abierto",
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

const formatAmount = (amount: number, currency = "ARS") =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "ARS" ? 0 : 2,
  }).format(amount);

const themeClasses: Record<CardTheme, string> = {
  violet: "from-[#30206e] via-[#4c2a91] to-[#1d1749]",
  blue: "from-[#123b67] via-[#17618c] to-[#112847]",
  amber: "from-[#71441e] via-[#a2632a] to-[#3b2418]",
};

export function CreditCardsPage() {
  const [selectedCardId, setSelectedCardId] = useState(1);
  const [filter, setFilter] = useState<"Todos" | "Compras" | "Suscripciones">("Todos");
  const selectedCard = creditCards.find((card) => card.id === selectedCardId) ?? creditCards[0];
  const visiblePurchases = purchases.filter(
    (purchase) =>
      filter === "Todos" ||
      (filter === "Compras" && purchase.type === "Compra") ||
      (filter === "Suscripciones" && purchase.type === "Suscripción"),
  );
  const estimatedAvailable = Math.max(0, selectedCard.limit - selectedCard.pending);
  const estimatedUsage = Math.round((selectedCard.pending / selectedCard.limit) * 100);

  return (
    <div className="space-y-8 pb-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-sp-blue-400">
            <WalletCards className="size-4" />
            Finanzas / Crédito
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Tarjetas de crédito
          </h1>
          <p className="mt-2 max-w-xl text-sm text-text-quaternary md:text-base">
            Un solo lugar para seguir tus consumos, cuotas y próximos resúmenes.
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="size-4" />
          Agregar tarjeta
        </Button>
      </header>

      <section aria-labelledby="cards-title" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="cards-title" className="text-lg font-semibold text-foreground">
              Tus tarjetas
            </h2>
            <p className="text-sm text-text-quaternary">Seleccioná una para ver su actividad</p>
          </div>
          <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-text-quaternary sm:block">
            {creditCards.length} tarjetas
          </span>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {creditCards.map((card) => {
            const isSelected = card.id === selectedCardId;
            return (
              <article key={card.id} className="w-[285px] shrink-0 snap-start lg:w-auto">
                <div
                  className={`relative overflow-hidden rounded-2xl border transition-all duration-200 ${isSelected ? "border-sp-blue-400/70 shadow-[0_0_0_2px_rgba(96,165,250,0.18),0_20px_45px_rgba(30,64,175,0.18)]" : "border-border-subtle hover:border-sp-blue-400/40"}`}
                >
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`group relative block w-full overflow-hidden bg-gradient-to-br p-5 text-left text-white ${themeClasses[card.theme]}`}
                  >
                    <div className="absolute -right-8 -top-12 size-36 rounded-full border border-white/10" />
                    <div className="absolute -bottom-20 -left-8 size-40 rounded-full border border-white/10" />
                    <div className="relative flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/60">
                          {card.issuer}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold">{card.name}</h3>
                      </div>
                      <CreditCard className="size-7 text-white/80" />
                    </div>
                    <div className="relative mt-8 flex items-center gap-2 font-mono text-sm tracking-[0.22em] text-white/80">
                      <span>••••</span>
                      <span>••••</span>
                      <span>••••</span>
                      <span>{card.lastFour}</span>
                    </div>
                    <div className="relative mt-5 flex items-end justify-between text-xs">
                      <div>
                         <p className="text-white/50">Límite configurado</p>
                         <p className="mt-1 text-base font-semibold">
                           {formatAmount(card.limit, card.currency)}
                        </p>
                      </div>
                      <span className="rounded-full bg-white/10 px-2 py-1 font-medium">
                        {card.currency}
                      </span>
                    </div>
                  </button>
                  <div className="flex items-center justify-between bg-surface-container-high/80 px-4 py-2.5 text-xs text-text-quaternary">
                    <span>
                       Cierre habitual: {card.closingRange.startDay} al {card.closingRange.endDay} · vence {card.dueRange.startDay} al {card.dueRange.endDay}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 font-medium text-sp-blue-400">
                        <Check className="size-3.5" /> Activa
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
          <button
            type="button"
            className="flex min-h-[187px] w-[285px] shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-sp-blue-400/35 bg-sp-blue-500/5 text-center transition-colors hover:border-sp-blue-400 hover:bg-sp-blue-500/10 lg:w-auto"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-sp-blue-500/15 text-sp-blue-400">
              <Plus className="size-5" />
            </span>
            <span>
              <strong className="block text-sm font-semibold text-foreground">
                Agregar tarjeta
              </strong>
              <small className="mt-1 block text-xs text-text-quaternary">
                Visa, Mastercard, Amex...
              </small>
            </span>
          </button>
        </div>
      </section>

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
                  {selectedCard.name}
                </h2>
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                >
                  Activa
                </Badge>
              </div>
              <p className="mt-1 text-sm text-text-quaternary">
                {selectedCard.issuer} · terminada en {selectedCard.lastFour}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            <div>
               <p className="flex items-center gap-1 text-xs text-text-quaternary" title="Estimación basada en los registros pendientes de SmartPocket. No representa el disponible real informado por el banco.">
                 Pendiente registrado <Info className="size-3.5" />
               </p>
               <p className="mt-1 font-semibold text-foreground">
                 {formatAmount(selectedCard.pending, selectedCard.currency)}
               </p>
            </div>
            <div>
               <p className="text-xs text-text-quaternary">Disponible estimado</p>
               <p className="mt-1 font-semibold text-emerald-400">
                 {formatAmount(estimatedAvailable, selectedCard.currency)}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
               <p className="text-xs text-text-quaternary">Uso estimado del límite</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-sp-blue-400"
                     style={{ width: `${Math.min(estimatedUsage, 100)}%` }}
                  />
                </div>
                 <span className="text-xs font-medium text-foreground">{estimatedUsage}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.8fr)]">
        <section className="min-w-0 space-y-4" aria-labelledby="activity-title">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="activity-title" className="text-xl font-semibold text-foreground">
                Compras y suscripciones
              </h2>
              <p className="mt-1 text-sm text-text-quaternary">Actividad de {selectedCard.name}</p>
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
              {(["Todos", "Compras", "Suscripciones"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === item ? "bg-sp-blue-500/15 text-sp-blue-400" : "text-text-quaternary hover:bg-hover-muted hover:text-foreground"}`}
                >
                  {item}
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
                    {formatAmount(purchase.amount)}
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
      </div>
    </div>
  );
}
