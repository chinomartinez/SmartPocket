/**
 * Transfer Types
 * Tipos de datos para la gestión de transferencias entre cuentas
 */

import type { IconDTO } from "../shared/sharedTypes";

// ============================================================================
// Shared DTOs
// ============================================================================

/**
 * DTO para cuenta en transferencias
 * Alineado con AccountDTO en backend Transfers feature
 */
export interface TransferAccountDTO {
  id: number;
  name: string;
  currencyCode: string;
  icon: IconDTO;
}

// ============================================================================
// DTOs para Querys
// ============================================================================

/**
 * DTO para obtener una transferencia por ID
 * Alineado con TransferGetByIdDTO.cs del backend
 */
export interface TransferGetByIdDTO {
  id: number;
  originAccount: TransferAccountDTO;
  destinationAccount: TransferAccountDTO;
  amount: number;
  effectiveDate: string; // ISO 8601 date string
  description?: string;
}

/**
 * DTO para item de transferencia en listado
 * Alineado con TransferListItemDTO.cs del backend
 */
export interface TransferListItemDTO {
  id: number;
  originAccount: TransferAccountDTO;
  destinationAccount: TransferAccountDTO;
  amount: number;
  effectiveDate: string; // ISO 8601 date string
  description?: string;
}

/**
 * Request para obtener listado de transferencias
 * Alineado con TransferListRequest.cs del backend
 */
export interface TransferListRequest {
  from: string; // ISO 8601 date string
  to: string; // ISO 8601 date string
}

// ============================================================================
// DTOs para Commands
// ============================================================================

/**
 * Command para crear nueva transferencia
 * Alineado con TransferCreateCommand.cs del backend
 */
export interface TransferCreateCommand {
  amount: number;
  description?: string;
  originAccountId: number;
  destinationAccountId: number;
  effectiveDate: string; // ISO 8601 date string
}

/**
 * Response al crear transferencia
 * Retorna el ID de la transferencia creada
 */
export interface TransferCreateResponse {
  id: number;
}
