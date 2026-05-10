import type { FinancialCardProps } from "./financialCardTypes";
import { Card } from "@/components/ui/card";

export default function CardItem({
  title,
  amount,
  amountColor,
  secondaryText,
}: FinancialCardProps) {
  return (
    <Card className="glass-card glass-card-hover p-4 hover:scale-[1.02] gap-3 transition-all duration-300">
      {/* Label */}
      <p className="text-xs font-semibold tracking-wider uppercase text-text-tertiary mb-2">
        {title}
      </p>

      {/* Amount */}
      <p className={`text-xl md:text-2xl font-bold ${amountColor} mb-1`}>{amount}</p>

      {/* Secondary text */}
      <p className="text-[11px] text-text-tertiary">{secondaryText}</p>
    </Card>
  );
}
