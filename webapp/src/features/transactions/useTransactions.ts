/**
 * Custom Hooks para Gestión de Transacciones
 * Hooks con TanStack Query para operaciones CRUD de transacciones
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "@/api/services/transactions/transactionService";
import type { TransactionCreateCommand } from "@/api/services/transactions/transactionTypes";

// ============================================================================
// Query Keys
// ============================================================================

export const transactionKeys = {
  all: ["transactions"] as const,
  detail: (id: number) => ["transactions", id] as const,
};

// ============================================================================
// Queries
// ============================================================================

// TODO: Implementar cuando backend exponga GET /transactions
// export function useTransactions(filters?) {
//   return useQuery({
//     queryKey: transactionKeys.all,
//     queryFn: () => transactionService.getAll(filters),
//   });
// }

// TODO: Implementar cuando backend exponga GET /transactions/{id}
// export function useTransaction(id: number) {
//   return useQuery({
//     queryKey: transactionKeys.detail(id),
//     queryFn: () => transactionService.getById(id),
//     enabled: !!id,
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
      // Invalidar lista de transacciones para refrescar cuando exista
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
