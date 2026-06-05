/**
 * Custom Hook para gestión de filtros de transferencias
 * Maneja solo filtrado por periodo con persistencia en localStorage
 */

import { useState, useEffect, useMemo } from "react";
import { getPeriodRange, type DateRange } from "@/utils/dateHelpers";
import type { TransferListRequest } from "@/api/services/transfers/transferTypes";

// ============================================================================
// Types
// ============================================================================

export type PeriodType = "today" | "week" | "month" | "year" | "custom";

/**
 * Filtros de transferencias (solo periodo)
 */
export interface TransferFilters {
  period: PeriodType;
  customRange?: DateRange;
}

/**
 * Handlers para actualizar filtros
 */
export interface FilterHandlers {
  setPeriod: (period: PeriodType) => void;
  setCustomRange: (range: DateRange) => void;
  resetFilters: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = "transfer-filters";

const DEFAULT_FILTERS: TransferFilters = {
  period: "month",
  customRange: undefined,
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook para gestionar filtros de transferencias con persistencia
 * @returns Filtros, handlers, y request preparado para API
 */
export function useTransferFilters() {
  // ========================================================================
  // Estado con persistencia (localStorage)
  // ========================================================================

  const [filters, setFilters] = useState<TransferFilters>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Error parsing stored transfer filters:", error);
      }
    }

    return DEFAULT_FILTERS;
  });

  // Guardar en localStorage cuando cambian los filtros
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  // ========================================================================
  // Handlers
  // ========================================================================

  const handlers: FilterHandlers = {
    setPeriod: (period: PeriodType) => {
      setFilters((prev) => ({ ...prev, period }));
    },

    setCustomRange: (range: DateRange) => {
      setFilters((prev) => ({ ...prev, customRange: range }));
    },

    resetFilters: () => {
      setFilters(DEFAULT_FILTERS);
    },
  };

  // ========================================================================
  // Request derivado para API
  // ========================================================================

  const request = useMemo<TransferListRequest>(() => {
    const dateRange = getPeriodRange(filters.period, filters.customRange);

    return {
      from: dateRange.from,
      to: dateRange.to,
    };
  }, [filters.period, filters.customRange]);

  // ========================================================================
  // Return
  // ========================================================================

  return {
    filters,
    handlers,
    request,
  };
}
