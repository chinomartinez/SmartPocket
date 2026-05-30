/**
 * Custom Hook para Monedas
 * Hook cross-feature para obtener lista de monedas disponibles
 */

import { useQuery } from "@tanstack/react-query";
import { currencyService } from "@/api/services/currencies/currencyService";

// ============================================================================
// Query Keys
// ============================================================================

export const currencyKeys = {
  all: ["currencies"] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook para obtener todas las monedas disponibles
 * @returns Query con array de monedas
 *
 * @example
 * ```tsx
 * const { data: currencies, isLoading } = useCurrencies();
 *
 * // En un select/dropdown
 * <select>
 *   {currencies?.map(currency => (
 *     <option key={currency.id} value={currency.id}>
 *       {currency.code} - {currency.symbol}
 *     </option>
 *   ))}
 * </select>
 * ```
 */
export function useCurrencies() {
  return useQuery({
    queryKey: currencyKeys.all,
    queryFn: currencyService.getAll,
    staleTime: 1000 * 60 * 60, // 1 hora (currencies no cambian frecuentemente)
  });
}
