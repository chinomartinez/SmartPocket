import type { IconDTO } from "@/api/services/shared/sharedTypes";

// ============================================================================
// Dashboard DTOs - AccountBalances
// ============================================================================

export interface AccountBalancesResponse {
  totalBalance: number;
  monthlyVariation: number;
  accounts: AccountBalanceDTO[];
}

export interface AccountBalanceDTO {
  id: number;
  balance: number;
  currencyCode: string;
  icon: IconDTO;
  name: string;
}

// ============================================================================
// Dashboard DTOs - MonthlyBalances
// ============================================================================

export interface MonthlyBalanceDTO {
  income: MonthlyBalanceTypeDTO;
  expense: MonthlyBalanceTypeDTO;
  savings: MonthlyBalanceTypeDTO;
}

export interface MonthlyBalanceTypeDTO {
  amount: number;
  monthlyVariation: number;
}
