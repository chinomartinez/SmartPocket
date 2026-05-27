/**
 * Custom Hook para gestión de filtros de transacciones
 * Maneja estado híbrido: localStorage para persistencia + useState para búsqueda/orden
 */

import { useState, useEffect, useMemo } from "react";
import { getPeriodRange, type DateRange } from "@/utils/dateHelpers";
import type { TransactionListRequest } from "@/api/services/transactions/transactionTypes";

// ============================================================================
// Types
// ============================================================================

export type PeriodType = "today" | "week" | "month" | "year" | "custom";

export type OrderBy = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

/**
 * Filtros persistentes (localStorage)
 */
interface PersistedFilters {
  accountId: number;
  isIncome: boolean;
  period: PeriodType;
  customRange?: DateRange;
}

/**
 * Filtros temporales (useState)
 */
interface TemporaryFilters {
  search: string;
  orderBy: OrderBy;
}

/**
 * Todos los filtros combinados
 */
export interface TransactionFilters extends PersistedFilters, TemporaryFilters {}

/**
 * Handlers para actualizar filtros
 */
export interface FilterHandlers {
  setAccountId: (accountId: number) => void;
  setIsIncome: (isIncome: boolean) => void;
  setPeriod: (period: PeriodType) => void;
  setCustomRange: (range: DateRange) => void;
  setSearch: (search: string) => void;
  setOrderBy: (orderBy: OrderBy) => void;
  resetFilters: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = "transaction-filters";

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook para gestionar filtros de transacciones con persistencia híbrida
 * @param defaultAccountId ID de cuenta por defecto (primera cuenta)
 * @returns Filtros, handlers, y request preparado para API
 */
export function useTransactionFilters(defaultAccountId: number = 0) {
  // ========================================================================
  // Estado persistente (localStorage)
  // ========================================================================

  const [persistedFilters, setPersistedFilters] = useState<PersistedFilters>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Error parsing stored filters:", error);
      }
    }

    // Valores por defecto
    return {
      accountId: defaultAccountId,
      isIncome: false, // Gastos por defecto
      period: "month",
      customRange: undefined,
    };
  });

  // Guardar en localStorage cuando cambian filtros persistentes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedFilters));
  }, [persistedFilters]);

  // Actualizar accountId cuando cambia defaultAccountId (primera carga)
  useEffect(() => {
    if (defaultAccountId !== 0 && persistedFilters.accountId === 0) {
      setPersistedFilters((prev) => ({ ...prev, accountId: defaultAccountId }));
    }
  }, [defaultAccountId, persistedFilters.accountId]);

  // ========================================================================
  // Estado temporal (useState)
  // ========================================================================

  const [temporaryFilters, setTemporaryFilters] = useState<TemporaryFilters>({
    search: "",
    orderBy: "date-desc",
  });

  // ========================================================================
  // Handlers
  // ========================================================================

  const handlers: FilterHandlers = {
    setAccountId: (accountId: number) => {
      setPersistedFilters((prev) => ({ ...prev, accountId }));
    },

    setIsIncome: (isIncome: boolean) => {
      setPersistedFilters((prev) => ({ ...prev, isIncome }));
    },

    setPeriod: (period: PeriodType) => {
      setPersistedFilters((prev) => ({ ...prev, period }));
    },

    setCustomRange: (range: DateRange) => {
      setPersistedFilters((prev) => ({ ...prev, customRange: range }));
    },

    setSearch: (search: string) => {
      setTemporaryFilters((prev) => ({ ...prev, search }));
    },

    setOrderBy: (orderBy: OrderBy) => {
      setTemporaryFilters((prev) => ({ ...prev, orderBy }));
    },

    resetFilters: () => {
      setPersistedFilters({
        accountId: defaultAccountId,
        isIncome: false,
        period: "month",
        customRange: undefined,
      });
      setTemporaryFilters({
        search: "",
        orderBy: "date-desc",
      });
    },
  };

  // ========================================================================
  // Filtros combinados
  // ========================================================================

  const filters: TransactionFilters = {
    ...persistedFilters,
    ...temporaryFilters,
  };

  // ========================================================================
  // Request derivado para API
  // ========================================================================

  const request = useMemo<TransactionListRequest>(() => {
    const dateRange = getPeriodRange(persistedFilters.period, persistedFilters.customRange);

    return {
      accountId: persistedFilters.accountId,
      isIncome: persistedFilters.isIncome,
      from: dateRange.from,
      to: dateRange.to,
      search: temporaryFilters.search || undefined, // Convertir string vacío a undefined
    };
  }, [persistedFilters, temporaryFilters.search]);

  // ========================================================================
  // Return
  // ========================================================================

  return {
    filters,
    handlers,
    request,
  };
}
