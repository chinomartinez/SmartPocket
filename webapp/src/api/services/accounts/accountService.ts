/**
 * Account Service
 * Servicio para gestión de cuentas
 */
import type {
  AccountCreateCommand,
  AccountCreateResponse,
  AccountGetByIdDTO,
  AccountGetDTO,
} from "./accountTypes";
import type { PagedListResponse } from "../shared/sharedTypes";
import { spApiClient } from "@/api/spApiClient";

const BASE_PATH = "/accounts";

export const accountService = {
  /**
   * Obtener todas las cuentas (no eliminadas)
   */
  getAll: async () => {
    const response = await spApiClient.get<PagedListResponse<AccountGetDTO>>(BASE_PATH);
    return response.data.data;
  },

  /**
   * Obtener cuenta por ID
   */
  getById: async (id: number) => {
    var response = await spApiClient.get<AccountGetByIdDTO>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Crear nueva cuenta
   */
  create: async (data: AccountCreateCommand) => {
    var response = await spApiClient.post<AccountCreateResponse>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Actualizar cuenta existente
   */
  update: async (id: number, data: AccountCreateCommand) => {
    await spApiClient.put(`${BASE_PATH}/${id}`, data);
  },

  /**
   * Eliminar cuenta (soft delete)
   */
  delete: async (id: number) => {
    await spApiClient.delete(`${BASE_PATH}/${id}`);
  },
};
