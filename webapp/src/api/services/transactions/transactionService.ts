/**
 * Transaction Service
 * Servicio para gestión de transacciones
 */
import type { TransactionCreateCommand, TransactionCreateResponse } from "./transactionTypes";
import { spApiClient } from "@/api/spApiClient";

const BASE_PATH = "/transactions";

export const transactionService = {
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

  // TODO: Implementar cuando backend exponga endpoints
  // getAll: async (filters?) => { ... }
  // getById: async (id: number) => { ... }
  // delete: async (id: number) => { ... }
};
