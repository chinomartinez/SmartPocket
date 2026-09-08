import { CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreditCardsEmptyStateProps {
  onAdd: () => void;
}

export function CreditCardsEmptyState({ onAdd }: CreditCardsEmptyStateProps) {
  return (
    <section className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-surface-container-low/50 p-8 text-center">
      <CreditCard className="size-12 text-sp-blue-400" />
      <h2 className="mt-4 text-xl font-semibold text-foreground">
        Aún no tenés tarjetas de crédito
      </h2>
      <p className="mt-2 max-w-md text-sm text-text-quaternary">
        Agregá tu primera tarjeta para registrar consumos y resúmenes en SmartPocket.
      </p>
      <Button className="mt-6" onClick={onAdd}>
        <Plus className="size-4" />
        Agregar primera tarjeta
      </Button>
    </section>
  );
}
