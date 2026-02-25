import type { IconDTO } from "../shared/sharedTypes";

/*
 * Category Types
 * Tipos de datos para la gestión de categorías
 */

// ============================================================================
// DTOs para Querys
// ============================================================================
export interface CategoryGetDTO {
  id: number;
  name: string;
  icon: IconDTO;
  isIncome: boolean;
  isDefault: boolean;
}

export interface CategoryByIdDTO {
  id: number;
  name: string;
  icon: IconDTO;
  isIncome: boolean;
  isDefault: boolean;
}

// ============================================================================
// DTOs para Mutations
// ============================================================================
export interface CategoryCreateCommand {
  name: string;
  icon: IconDTO;
  isIncome: boolean;
}

export interface CategoryCreateResponse {
  id: number;
}
