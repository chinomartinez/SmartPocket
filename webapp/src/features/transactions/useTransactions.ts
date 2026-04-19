/**
 * Custom Hooks para Gestión de Transacciones
 * Hooks con TanStack Query para operaciones CRUD de transacciones
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "@/api/services/transactions/transactionService";
import type { TransactionCreateCommand } from "@/api/services/transactions/transactionTypes";

// ============================================================================
// Query Keys
// ============================================================================

export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  recents: (count: number) => [...transactionKeys.all, "recents", count] as const,
  details: () => [...transactionKeys.all, "detail"] as const,
  detail: (id: number) => [...transactionKeys.details(), id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook para obtener una transacción por ID
 * @param id ID de la transacción
 * @param options Opciones adicionales para useQuery
 * @returns Query con datos de transacción
 */
export function useTransaction(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionService.getById(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}

/**
 * Hook para obtener transacciones recientes
 * @param count Cantidad de transacciones a obtener (default: 5)
 * @returns Query con lista de transacciones recientes
 */
export function useRecentTransactions(count: number = 5) {
  return useQuery({
    queryKey: transactionKeys.recents(count),
    queryFn: () => transactionService.getRecents(count),
  });
}

// TODO: Implementar cuando backend exponga GET /transactions
// export function useTransactions(filters?) {
//   return useQuery({
//     queryKey: transactionKeys.lists(),
//     queryFn: () => transactionService.getAll(filters),
//   });
// }

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook para crear una nueva transacción
 * @returns Mutation para crear transacción
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      // Invalidar todas las queries de transacciones (lista, recents, etc.)
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      // También invalidar accountKeys para actualizar balances
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

/**
 * Hook para actualizar una transacción existente
 * @returns Mutation para actualizar transacción
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TransactionCreateCommand }) =>
      transactionService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidar lista de transacciones
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      // Invalidar detalle de la transacción actualizada
      queryClient.invalidateQueries({
        queryKey: transactionKeys.detail(variables.id),
      });
      // También invalidar accountKeys para actualizar balances
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

// TODO: Implementar cuando backend exponga DELETE /transactions/{id}
// export function useDeleteTransaction() {
//   const queryClient = useQueryClient();
//
//   return useMutation({
//     mutationFn: transactionService.delete,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: transactionKeys.all });
//       queryClient.invalidateQueries({ queryKey: ["accounts"] });
//     },
//   });
// }
