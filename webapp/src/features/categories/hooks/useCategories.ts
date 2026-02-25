/**
 * Categories Hooks
 * Custom hooks para gestión de categorías con TanStack Query
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/api/services/categories/categoryService";
import type { CategoryCreateCommand } from "@/api/services/categories/categoryTypes";

// ============================================================================
// Query Keys
// ============================================================================

export const categoryKeys = {
  all: ["categories"] as const,
  byType: (isIncome: boolean) => ["categories", { isIncome }] as const,
  detail: (id: number) => ["categories", id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook para obtener categorías filtradas por tipo
 * @param isIncome - true para ingresos, false para gastos (requerido)
 */
export function useCategories(isIncome: boolean) {
  return useQuery({
    queryKey: categoryKeys.byType(isIncome),
    queryFn: () => categoryService.getAll(isIncome),
  });
}

/**
 * Hook para obtener una categoría por ID
 * @param id - ID de la categoría
 */
export function useCategory(id: number) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.getById(id),
    enabled: !!id,
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook para crear nueva categoría
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryCreateCommand) => categoryService.create(data),
    onSuccess: () => {
      // Invalidar todas las queries de categorías (ambos tipos)
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

/**
 * Hook para actualizar categoría existente
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryCreateCommand }) =>
      categoryService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidar queries de categorías y el detalle específico
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
    },
  });
}

/**
 * Hook para eliminar categoría
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoryService.delete(id),
    onSuccess: () => {
      // Invalidar todas las queries de categorías (ambos tipos)
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
