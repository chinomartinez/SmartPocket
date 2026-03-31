/**
 * Category Service
 * Servicio para gestión de categorías
 */
import type {
  CategoryGetDTO,
  CategoryByIdDTO,
  CategoryCreateCommand,
  CategoryCreateResponse,
  CategoryReorderCommand,
} from "./categoryTypes";
import { spApiClient } from "@/api/spApiClient";

const BASE_PATH = "/categories";

export const categoryService = {
  /**
   * Obtener categorías filtradas por tipo (ingresos o gastos)
   * @param isIncome - true para ingresos, false para gastos
   */
  getAll: async (isIncome: boolean) => {
    const response = await spApiClient.get<CategoryGetDTO[]>(BASE_PATH, {
      params: { isIncome },
    });
    return response.data;
  },

  /**
   * Obtener categoría por ID
   */
  getById: async (id: number) => {
    const response = await spApiClient.get<CategoryByIdDTO>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Crear nueva categoría
   */
  create: async (data: CategoryCreateCommand) => {
    const response = await spApiClient.post<CategoryCreateResponse>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Actualizar categoría existente
   */
  update: async (id: number, data: CategoryCreateCommand) => {
    await spApiClient.put(`${BASE_PATH}/${id}`, data);
  },

  /**
   * Eliminar categoría (soft delete)
   */
  delete: async (id: number) => {
    await spApiClient.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Reordenar categorías (colección plana de {id, sortOrder})
   */
  reorder: async (data: CategoryReorderCommand) => {
    await spApiClient.put(`${BASE_PATH}/reorder`, data);
  },
};
