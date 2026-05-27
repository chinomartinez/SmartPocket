/**
 * TransactionFilters Component
 * Componente de filtros para listado de transacciones
 */

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import { IconBox } from "@/components/iconBoxes/IconBox";
import type { TransactionFilters, FilterHandlers, PeriodType } from "./useTransactionFilters";
import type { AccountGetDTO } from "@/api/services/accounts/accountTypes";

// ============================================================================
// Types
// ============================================================================

interface TransactionFiltersProps {
  filters: TransactionFilters;
  handlers: FilterHandlers;
  accounts: AccountGetDTO[];
}

// ============================================================================
// Constants
// ============================================================================

const PERIOD_OPTIONS = [
  { value: "today" as const, label: "Hoy" },
  { value: "week" as const, label: "Semana" },
  { value: "month" as const, label: "Mes" },
  { value: "year" as const, label: "Año" },
  { value: "custom" as const, label: "Personalizado" },
];

const ORDER_OPTIONS = [
  { value: "date-desc" as const, label: "📅 Fecha (reciente)" },
  { value: "date-asc" as const, label: "📅 Fecha (antigua)" },
  { value: "amount-desc" as const, label: "💵 Monto (mayor)" },
  { value: "amount-asc" as const, label: "💵 Monto (menor)" },
];

// ============================================================================
// Component
// ============================================================================

export function TransactionFilters({ filters, handlers, accounts }: TransactionFiltersProps) {
  const [showSecondaryFilters, setShowSecondaryFilters] = useState(false);

  return (
    <div className="glass-card rounded-2xl border border-white/10 p-4 md:p-6 mb-6">
      <div className="space-y-4">
        {/* Fila 1 (Desktop): Cuentas, Tipo, Periodo */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-4">
          {/* Filtro #1: Cuentas */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-tertiary">Cuenta</label>
            <Select
              value={filters.accountId.toString()}
              onValueChange={(value) => handlers.setAccountId(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    <div className="flex items-center gap-2">
                      <IconBox
                        icon={account.icon}
                        size="xs"
                        shape="rounded"
                        backgroundOpacity={20}
                      />
                      <span>{account.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro #2: Tipo (Gasto/Ingreso) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-tertiary">Tipo</label>
            <div className="flex gap-2 p-1 rounded-xl bg-muted/50">
              {/* Gastos */}
              <button
                type="button"
                onClick={() => handlers.setIsIncome(false)}
                className={`flex-1 py-1 px-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  !filters.isIncome
                    ? "border border-sp-blue-500 bg-sp-blue-500/20 text-red-400"
                    : "border border-border text-text-tertiary hover:bg-hover-muted"
                }`}
              >
                💸 Gastos
              </button>
              {/* Ingresos */}
              <button
                type="button"
                onClick={() => handlers.setIsIncome(true)}
                className={`flex-1 py-1 px-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  filters.isIncome
                    ? "border border-sp-blue-500 bg-sp-blue-500/20 text-emerald-400"
                    : "border border-border text-text-tertiary hover:bg-hover-muted"
                }`}
              >
                💰 Ingresos
              </button>
            </div>
          </div>

          {/* Filtro #3: Periodo */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-tertiary">Periodo</label>
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
              <div className="flex items-center gap-2 pt-2">
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

        {/* Fila 2 (Desktop): Buscador, Orden - Colapsable en mobile */}
        <div
          className={`grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4 md:block ${
            showSecondaryFilters ? "block" : "hidden md:grid"
          }`}
        >
          {/* Filtro #4: Buscador */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-tertiary">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-quaternary" />
              <Input
                type="text"
                placeholder="Buscar por descripción..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => handlers.setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Filtro #5: Orden */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-tertiary">Ordenar por</label>
            <Select value={filters.orderBy} onValueChange={handlers.setOrderBy}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botón de expandir/contraer filtros secundarios - Solo visible en mobile */}
        <button
          type="button"
          onClick={() => setShowSecondaryFilters(!showSecondaryFilters)}
          className="md:hidden flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-text-tertiary hover:text-foreground transition-colors"
        >
          <span>{showSecondaryFilters ? "Ocultar filtros" : "Más filtros"}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              showSecondaryFilters ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}
