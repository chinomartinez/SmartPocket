/**
 * Transaction Types
 * Tipos de datos para la gestión de transacciones
 */

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
