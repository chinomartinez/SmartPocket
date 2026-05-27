/**
 * Transaction Service
 * Servicio para gestión de transacciones
 */
import type {
  TransactionCreateCommand,
  TransactionCreateResponse,
  TransactionGetByIdDTO,
  RecentTransactionItemDTO,
  TransactionListItemDTO,
  TransactionListRequest,
} from "./transactionTypes";
import { spApiClient } from "@/api/spApiClient";

const BASE_PATH = "/transactions";

export const transactionService = {
  /**
   * Obtener transacción por ID
   */
  getById: async (id: number) => {
    const response = await spApiClient.get<TransactionGetByIdDTO>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Obtener transacciones recientes
   * @param count Cantidad de transacciones a obtener (default: 5)
   */
  getRecents: async (count: number = 5) => {
    const response = await spApiClient.get<RecentTransactionItemDTO[]>(
      `${BASE_PATH}/recents?count=${count}`,
    );
    return response.data;
  },

  /**
   * Obtener listado de transacciones con filtros
   * @param filters Filtros para el listado (cuenta, tipo, fechas, búsqueda)
   */
  getList: async (filters: TransactionListRequest) => {
    const response = await spApiClient.get<TransactionListItemDTO[]>(`${BASE_PATH}/list`, {
      params: {
        accountId: filters.accountId,
        isIncome: filters.isIncome,
        from: filters.from,
        to: filters.to,
        search: filters.search,
      },
    });
    return response.data;
  },

  /**
   * Crear nueva transacción
   */
  create: async (data: TransactionCreateCommand) => {
    const response = await spApiClient.post<TransactionCreateResponse>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Actualizar transacción existente
   * Nota: Backend usa TransactionCreateCommand en el body,
   * el ID se pasa como route parameter
   */
  update: async (id: number, data: TransactionCreateCommand) => {
    await spApiClient.put(`${BASE_PATH}/${id}`, data);
  },

  // TODO: Implementar cuando backend exponga DELETE /transactions/{id}
  // delete: async (id: number) => { ... }
};
