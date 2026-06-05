/**
 * Transfer Service
 * Servicio para gestión de transferencias entre cuentas
 */
import type {
  TransferCreateCommand,
  TransferCreateResponse,
  TransferGetByIdDTO,
  TransferListItemDTO,
  TransferListRequest,
} from "./transferTypes";
import { spApiClient } from "@/api/spApiClient";

const BASE_PATH = "/transfers";

export const transferService = {
  /**
   * Obtener transferencia por ID
   */
  getById: async (id: number) => {
    const response = await spApiClient.get<TransferGetByIdDTO>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Obtener listado de transferencias con filtros de periodo
   * @param filters Filtros para el listado (periodo from/to)
   */
  getList: async (filters: TransferListRequest) => {
    const response = await spApiClient.get<TransferListItemDTO[]>(`${BASE_PATH}/list`, {
      params: {
        from: filters.from,
        to: filters.to,
      },
    });
    return response.data;
  },

  /**
   * Crear nueva transferencia
   */
  create: async (data: TransferCreateCommand) => {
    const response = await spApiClient.post<TransferCreateResponse>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Actualizar transferencia existente
   * Nota: Backend usa TransferCreateCommand en el body,
   * el ID se pasa como route parameter
   */
  update: async (id: number, data: TransferCreateCommand) => {
    await spApiClient.put(`${BASE_PATH}/${id}`, data);
  },

  /**
   * Eliminar transferencia
   */
  delete: async (id: number) => {
    await spApiClient.delete<void>(`${BASE_PATH}/${id}`);
  },
};
