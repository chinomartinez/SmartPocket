/**
 * Account Types
 * Tipos de datos para la gestión de cuentas
 */

import type { CurrencyItemDTO } from "../currencies/currencyItemDTO";
import type { IconDTO } from "../shared/sharedTypes";

// ============================================================================
// DTOs para Querys
// ============================================================================
export interface AccountGetDTO {
  id: number;
  name: string;
  icon: IconDTO;
  currency: CurrencyItemDTO;
  balance: number;
  includeInBalanceGlobal: boolean;
  createdAt: string; // ISO 8601 date string,
  isPrincipal: boolean;
}

export interface AccountGetByIdDTO {
  id: number;
  name: string;
  icon: IconDTO;
  currency: CurrencyItemDTO;
  balance: number;
  includeInBalanceGlobal: boolean;
  isPrincipal: boolean;
}

// ============================================================================
// DTOs para Mutations
// ============================================================================

export interface AccountCreateCommand {
  name: string;
  icon: IconDTO;
  currencyCode: string;
  balance: number;
  includeInBalanceGlobal: boolean;
}

export interface AccountCreateResponse {
  id: number;
}
