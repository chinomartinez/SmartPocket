import { Plus, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreditCardHeaderProps {
  onAdd: () => void;
}

export function CreditCardHeader({ onAdd }: CreditCardHeaderProps) {
  return (
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
      <Button className="w-full sm:w-auto" onClick={onAdd}>
        <Plus className="size-4" />
        Agregar tarjeta
      </Button>
    </header>
  );
}
