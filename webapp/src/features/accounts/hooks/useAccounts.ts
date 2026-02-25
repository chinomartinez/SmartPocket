/**
 * Custom Hooks para Gestión de Cuentas
 * Hooks con TanStack Query para operaciones CRUD de cuentas
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountService } from "@/api/services/accounts/accountService";
import type { AccountCreateCommand } from "@/api/services/accounts/accountTypes";

// ============================================================================
// Query Keys
// ============================================================================

export const accountKeys = {
  all: ["accounts"] as const,
  detail: (id: number) => ["accounts", id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook para obtener todas las cuentas
 * @returns Query con array de cuentas
 */
export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.all,
    queryFn: accountService.getAll,
  });
}

/**
 * Hook para obtener una cuenta por ID
 * @param id - ID de la cuenta
 * @returns Query con datos de la cuenta
 */
export function useAccount(id: number) {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => accountService.getById(id),
    enabled: !!id, // Solo ejecutar si hay ID válido
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook para crear una nueva cuenta
 * @returns Mutation para crear cuenta
 */
export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountService.create,
    onSuccess: () => {
      // Invalidar lista de cuentas para refrescar
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}

/**
 * Hook para actualizar una cuenta existente
 * @returns Mutation para actualizar cuenta
 */
export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AccountCreateCommand }) =>
      accountService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidar lista de cuentas
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      // Invalidar detalle de la cuenta actualizada
      queryClient.invalidateQueries({
        queryKey: accountKeys.detail(variables.id),
      });
    },
  });
}

/**
 * Hook para eliminar una cuenta (soft delete)
 * @returns Mutation para eliminar cuenta
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountService.delete,
    onSuccess: () => {
      // Invalidar lista de cuentas para refrescar
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}
