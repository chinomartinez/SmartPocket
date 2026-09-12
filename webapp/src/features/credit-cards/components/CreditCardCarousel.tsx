import { useEffect, useRef } from "react";
import { Check, CreditCard } from "lucide-react";
import type { CreditCardListItemDTO } from "@/api/services/credit-cards/creditCardTypes";
import { formatCurrency } from "@/utils/formatters";
import { themeClasses, themeForCard } from "./creditCardHelpers";

interface CreditCardCarouselProps {
  cards: CreditCardListItemDTO[];
  selectedCardId: number;
  onSelect: (id: number) => void;
}

export function CreditCardCarousel({
  cards,
  selectedCardId,
  onSelect,
}: CreditCardCarouselProps) {
  const cardRefs = useRef<Record<number, HTMLElement | null>>({});

  useEffect(() => {
    if (window.innerWidth >= 1024) return;

    cardRefs.current[selectedCardId]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedCardId]);

  return (
    <section aria-labelledby="cards-title" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 id="cards-title" className="text-lg font-semibold text-foreground">
            Tus tarjetas
          </h2>
          <p className="text-sm text-text-quaternary">Seleccioná una para ver su actividad</p>
        </div>
        <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-text-quaternary sm:block">
          {cards.length} tarjetas
        </span>
      </div>

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:overflow-visible">
        {cards.map((card) => {
          const isSelected = card.id === selectedCardId;

          return (
            <article
              key={card.id}
              ref={(element) => {
                cardRefs.current[card.id] = element;
              }}
              className="w-[285px] shrink-0 snap-center lg:w-auto"
            >
              <div
                className={`relative overflow-hidden rounded-2xl border transition-all duration-200 ${isSelected ? "border-sp-blue-400/70 shadow-[0_0_0_2px_rgba(96,165,250,0.18),0_20px_45px_rgba(30,64,175,0.18)]" : "border-border-subtle hover:border-sp-blue-400/40"}`}
              >
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelect(card.id)}
                  className={`group relative block w-full overflow-hidden bg-gradient-to-br p-5 text-left text-white ${themeClasses[themeForCard(card.id)]}`}
                >
                  <div className="absolute -right-8 -top-12 size-36 rounded-full border border-white/10" />
                  <div className="absolute -bottom-20 -left-8 size-40 rounded-full border border-white/10" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/60">
                        Registro manual
                      </p>
                      <h3 className="mt-1 text-lg font-semibold">{card.name}</h3>
                    </div>
                    <CreditCard className="size-7 text-white/80" />
                  </div>
                  <div className="relative mt-5 flex items-end justify-between text-xs">
                    <div>
                      <p className="text-white/50">Límite configurado</p>
                      <p className="mt-1 text-base font-semibold">
                        {formatCurrency(card.creditLimit, card.currencyCode)}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2 py-1 font-medium">
                      {card.currencyCode}
                    </span>
                  </div>
                </button>
                <div className="flex items-center justify-between bg-surface-container-high/80 px-4 py-2.5 text-xs text-text-quaternary">
                  <span>
                    Cierre habitual: {card.statementClosingRange.startDay} al{" "}
                    {card.statementClosingRange.endDay} · vence {card.paymentDueRange.startDay} al{" "}
                    {card.paymentDueRange.endDay}
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
      </div>
      <div className="flex justify-center gap-1.5 lg:hidden" aria-label="Seleccionar tarjeta">
        {cards.map((card) => {
          const isSelected = card.id === selectedCardId;

          return (
            <button
              key={card.id}
              type="button"
              aria-label={`Seleccionar ${card.name}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(card.id)}
              className={`rounded-full transition-all ${isSelected ? "h-1.5 w-5 bg-sp-blue-400" : "size-1.5 bg-text-quaternary/50"}`}
            />
          );
        })}
      </div>
    </section>
  );
}
