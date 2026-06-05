/**
 * TransferFilters Component
 * Componente de filtros para listado de transferencias (solo periodo)
 */

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TransferFilters, FilterHandlers, PeriodType } from "./useTransferFilters";

// ============================================================================
// Types
// ============================================================================

interface TransferFiltersProps {
  filters: TransferFilters;
  handlers: FilterHandlers;
}

// ============================================================================
// Constants
// ============================================================================

const PERIOD_OPTIONS = [
  { value: "today" as const, label: "Hoy" },
  { value: "week" as const, label: "Esta Semana" },
  { value: "month" as const, label: "Este Mes" },
  { value: "year" as const, label: "Este Año" },
  { value: "custom" as const, label: "Personalizado" },
];

// ============================================================================
// Component
// ============================================================================

export function TransferFilters({ filters, handlers }: TransferFiltersProps) {
  return (
    <div className="glass-card rounded-2xl border border-white/10 p-4 md:p-6 mb-6">
      <div className="space-y-4">
        {/* Filtro de Periodo */}
        <div className="max-w-xs">
          <label className="text-sm font-medium text-text-tertiary block mb-2">Periodo</label>
          <Select
            value={filters.period}
            onValueChange={(value) => handlers.setPeriod(value as PeriodType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Inputs - Solo visible cuando "Personalizado" está seleccionado */}
          {filters.period === "custom" && (
            <div className="flex items-center gap-2 pt-3">
              <Input
                type="date"
                className="flex-1 text-sm"
                value={filters.customRange?.from || ""}
                onChange={(e) => {
                  const newFrom = e.target.value;
                  handlers.setCustomRange({
                    from: newFrom,
                    to: filters.customRange?.to || newFrom,
                  });
                }}
              />
              <span className="text-text-quaternary text-sm">—</span>
              <Input
                type="date"
                className="flex-1 text-sm"
                value={filters.customRange?.to || ""}
                onChange={(e) => {
                  const newTo = e.target.value;
                  handlers.setCustomRange({
                    from: filters.customRange?.from || newTo,
                    to: newTo,
                  });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
