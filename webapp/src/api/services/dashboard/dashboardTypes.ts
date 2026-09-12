// ============================================================================
// Dashboard DTOs - AccountBalances
// ============================================================================

export interface AccountBalancesResponse {
  totalBalance: number;
  monthlyVariation: number;
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
  currencyCode: string;
  monthlyVariation: number;
}
