/**
 * HeroBalanceCard Component
 * Componente principal del Home mostrando balance consolidado como elemento visual dominante
 * Diseño basado en Direction A del documento ux-design-directions.html
 */

import type { HeroBalanceCardProps } from "./heroBalanceTypes";
import { formatCurrency } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";

export function HeroBalanceCard({ accounts, monthlyVariation }: HeroBalanceCardProps) {
  // Calcular balance total
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  // Determinar color de variación (verde si positivo, rojo si negativo)
  const variationColor = monthlyVariation >= 0 ? "text-emerald-400" : "text-red-400";
  const variationBgColor =
    monthlyVariation >= 0
      ? "bg-emerald-500/15 border-emerald-500/25"
      : "bg-red-500/15 border-red-500/25";
  const variationIcon = monthlyVariation >= 0 ? "↗" : "↘";

  return (
    <div className="group glass-card glass-card-hover glass-strong rounded-2xl p-5 md:p-6 relative overflow-hidden hover:scale-[1.02] transition-transform duration-300">
      {/* Decorative circle */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "rgba(59, 130, 246, 0.06)" }}
      />

      {/* Section label */}
      <p className="text-xs font-semibold tracking-wider uppercase text-text-tertiary mb-6">
        Balance Total
      </p>

      {/* Balance total + variation badge */}
      <div className="flex flex-wrap items-end gap-3 md:gap-4 mb-5 md:mb-6">
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground break-all"
          style={{ textShadow: "0 0 30px rgba(248, 250, 252, 0.15)" }}
        >
          {formatCurrency(totalBalance)}
        </h2>
        <Badge
          className={`${variationBgColor} border ${variationColor} mb-1 md:mb-2 flex-shrink-0`}
        >
          <span className="mr-1">{variationIcon}</span>
          {monthlyVariation >= 0 ? "+" : ""}
          {monthlyVariation.toFixed(1)}%
        </Badge>
      </div>

      {/* Accounts list - simple display */}
      <div className="flex flex-wrap gap-4 md:gap-6">
        {accounts.map((account) => (
          <div key={account.id} className="flex items-center gap-2">
            <span className="text-base">{account.icon}</span>
            <div>
              <p className="text-[10px] md:text-xs text-text-tertiary font-medium">
                {account.name}
              </p>
              <p className="text-sm md:text-base text-muted-foreground font-semibold">
                {formatCurrency(account.balance)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
