/**
 * Transaction Types
 * Tipos de datos para la gestión de transacciones
 */

import type { IconDTO } from "../shared/sharedTypes";

// ============================================================================
// Shared DTOs
// ============================================================================

/**
 * DTO para representar dinero con moneda
 * Alineado con MoneyDTO.cs del backend
 */
export interface MoneyDTO {
  amount: number;
  currencyCode: string;
}

/**
 * DTO para cuenta en transacciones recientes
 * Alineado con AccountRecentTransactionItemDTO.cs del backend
 */
export interface AccountRecentTransactionItemDTO {
  id: number;
  name: string;
  icon: IconDTO;
}

/**
 * DTO para categoría en transacciones recientes
 * Alineado con CategoryRecentTransactionItemDTO.cs del backend
 */
export interface CategoryRecentTransactionItemDTO {
  id: number;
  name: string;
  isIncome: boolean;
  icon: IconDTO;
}

// ============================================================================
// DTOs para Querys
// ============================================================================

/**
 * DTO para obtener una transacción por ID
 * Alineado con TransactionGetByIdDTO.cs del backend
 */
export interface TransactionGetByIdDTO {
  id: number;
  description?: string;
  accountMoney: MoneyDTO;
  effectiveDate: string; // ISO 8601 date string
  accountId: number;
  categoryId: number;
  isIncome: boolean;
}

/**
 * DTO para item de transacción reciente
 * Alineado con RecentTransactionItemDTO.cs del backend
 */
export interface RecentTransactionItemDTO {
  id: number;
  account: AccountRecentTransactionItemDTO;
  category: CategoryRecentTransactionItemDTO;
  description?: string;
  effectiveDate: string; // ISO 8601 date string
  isIncome: boolean;
  money: MoneyDTO;
}

// ============================================================================
// DTOs para Mutations
// ============================================================================

/**
 * Comando para crear una transacción
 * Alineado con TransactionCreateCommand.cs del backend
 */
export interface TransactionCreateCommand {
  accountId: number;
  categoryId: number;
  accountMoney: MoneyDTO;
  effectiveDate: string; // ISO 8601 date string
  description?: string;
  isIncome: boolean;
}

/**
 * Comando para actualizar una transacción
 * Extensión de TransactionCreateCommand con id
 */
export interface TransactionUpdateCommand extends TransactionCreateCommand {
  id: number;
}

/**
 * Respuesta al crear una transacción
 * Alineado con TransactionCreateResponse del backend
 */
export interface TransactionCreateResponse {
  id: number;
}
