/**
 * Custom Hooks para Gestión de Transferencias
 * Hooks con TanStack Query para operaciones CRUD de transferencias
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transferService } from "@/api/services/transfers/transferService";
import type {
  TransferCreateCommand,
  TransferListRequest,
} from "@/api/services/transfers/transferTypes";
import { dashboardKeys } from "../dashboard/useDashboard";
import { accountKeys } from "../accounts/useAccounts";

// ============================================================================
// Query Keys
// ============================================================================

export const transferKeys = {
  all: ["transfers"] as const,
  lists: () => [...transferKeys.all, "list"] as const,
  list: (filters: TransferListRequest) => [...transferKeys.lists(), filters] as const,
  details: () => [...transferKeys.all, "detail"] as const,
  detail: (id: number) => [...transferKeys.details(), id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook para obtener una transferencia por ID
 * @param id ID de la transferencia
 * @param options Opciones adicionales para useQuery
 * @returns Query con datos de transferencia
 */
export function useTransfer(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: transferKeys.detail(id),
    queryFn: () => transferService.getById(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}

/**
 * Hook para obtener listado de transferencias con filtros de periodo
 * @param filters Filtros para el listado (periodo from/to)
 * @returns Query con lista de transferencias filtradas
 */
export function useTransferList(filters: TransferListRequest) {
  return useQuery({
    queryKey: transferKeys.list(filters),
    queryFn: () => transferService.getList(filters),
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook para crear una nueva transferencia
 * @returns Mutation para crear transferencia
 */
export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transferService.create,
    onSuccess: () => {
      // Invalidar todas las queries de transferencias
      queryClient.invalidateQueries({ queryKey: transferKeys.all });
      // Invalidar accountKeys para actualizar balances
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      // Invalidar dashboard queries para actualizar métricas
      queryClient.invalidateQueries({ queryKey: dashboardKeys.balances() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.metrics() });
    },
  });
}

/**
 * Hook para actualizar una transferencia existente
 * @returns Mutation para actualizar transferencia
 */
export function useUpdateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TransferCreateCommand }) =>
      transferService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidar lista de transferencias
      queryClient.invalidateQueries({ queryKey: transferKeys.all });
      // Invalidar detalle de la transferencia actualizada
      queryClient.invalidateQueries({
        queryKey: transferKeys.detail(variables.id),
      });
      // Invalidar accountKeys para actualizar balances
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      // Invalidar dashboard queries para actualizar métricas
      queryClient.invalidateQueries({ queryKey: dashboardKeys.balances() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.metrics() });
    },
  });
}

/**
 * Hook para eliminar una transferencia
 * @returns Mutation para eliminar transferencia
 */
export function useDeleteTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transferService.delete,
    onSuccess: (_, deletedId) => {
      // Primero remover la query del detalle eliminado para evitar refetch 404
      queryClient.removeQueries({ queryKey: transferKeys.detail(deletedId) });

      // Luego invalidar las listas para refrescarlas
      queryClient.invalidateQueries({ queryKey: transferKeys.lists() });

      // Invalidar accountKeys para recalcular balances
      queryClient.invalidateQueries({ queryKey: accountKeys.all });

      // Invalidar dashboard queries para actualizar métricas
      queryClient.invalidateQueries({ queryKey: dashboardKeys.balances() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.metrics() });
    },
  });
}
