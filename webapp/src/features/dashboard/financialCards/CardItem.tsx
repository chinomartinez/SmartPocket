import type { FinancialCardProps, FinancialMetricType } from "./financialCardTypes";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatCompactCurrency } from "@/utils/formatters";

/**
 * Obtiene la clase de color de texto según el tipo de métrica
 */
function getMetricColor(type: FinancialMetricType): string {
  const colorMap = {
    income: "text-emerald-400",
    expense: "text-red-400",
    saving: "text-sp-blue-400 dark:text-sp-blue-400",
  };

  return colorMap[type];
}

/**
 * Formatea la variación con flecha y signo
 */
function formatVariation(variation: number): string {
  const arrow = variation === 0 ? "→" : variation > 0 ? "↗" : "↘";
  const sign = variation > 0 ? "+" : "";

  return `${arrow} ${sign} ${variation.toFixed(1)}%`;
}

interface CardItemProps extends FinancialCardProps {
  isExpanded?: boolean;
  isHidden?: boolean;
  onTap?: () => void;
}

export default function CardItem({
  title,
  amount,
  type,
  variation,
  isExpanded = false,
  isHidden = false,
  onTap,
}: CardItemProps) {
  const colorClass = getMetricColor(type);
  const formattedAmount = formatCurrency(amount, "$");
  const compactAmount = formatCompactCurrency(amount, "$");
  const variationText = formatVariation(variation);

  return (
    <>
      {/* Mobile: Compact 3-column grid con expansión */}
      <Card
        className={`
          glass-card glass-card-hover gap-2 p-2 hover:scale-[1.02] transition-all duration-300 md:hidden cursor-pointer
          ${isExpanded ? "col-span-3 scale-[1.03]" : ""}
          ${isHidden ? "hidden" : ""}
        `}
        onClick={onTap}
      >
        {isExpanded ? (
          // Vista expandida: monto completo centrado
          <div className="flex flex-col items-center justify-center py-2">
            <p className="text-[10px] font-semibold tracking-wide uppercase text-text-tertiary mb-2">
              {title}
            </p>
            <p className={`text-2xl font-bold ${colorClass} mb-1`}>{formattedAmount}</p>
            {variationText && <p className="text-[10px] text-text-tertiary">{variationText}</p>}
          </div>
        ) : (
          // Vista normal: compacta
          <>
            {/* Label */}
            <p className="text-[9px] font-semibold tracking-wide uppercase text-text-tertiary mb-1 truncate">
              {title}
            </p>

            {/* Amount prominente */}
            <p className={`text-base font-bold ${colorClass} mb-0.5 truncate`}>{compactAmount}</p>

            {/* Variación */}
            {variationText && (
              <p className="text-[8px] text-text-tertiary truncate">{variationText}</p>
            )}
          </>
        )}
      </Card>

      {/* Desktop: Vertical Grid Layout */}
      <Card className="glass-card glass-card-hover p-4 hover:scale-[1.02] transition-all duration-300 hidden md:block">
        {/* Label */}
        <p className="text-xs font-semibold tracking-wider uppercase text-text-tertiary mb-2">
          {title}
        </p>

        {/* Amount */}
        <p className={`text-2xl font-bold ${colorClass} mb-1`}>{formattedAmount}</p>

        {/* Variación */}
        {variationText && (
          <p className="text-[11px] text-text-tertiary">{variationText} vs mes anterior</p>
        )}
      </Card>
    </>
  );
}
