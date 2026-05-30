/**
 * Types para Hero Balance Card
 * Componente principal del Home/Dashboard mostrando balance consolidado
 */

import type { AccountBalancesResponse } from "@/api/services/dashboard/dashboardTypes";

export interface HeroBalanceCardProps {
  data: AccountBalancesResponse;
}

export interface AccountProgressBarProps {
  name: string;
  balance: number;
  percentage: number; // Porcentaje del total (0-100)
  icon: string;
}
