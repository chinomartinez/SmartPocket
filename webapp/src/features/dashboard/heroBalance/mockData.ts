/**
 * Mock Data para Hero Balance Card
 * Datos hardcoded replicando el diseño de referencia
 */

import type { Account } from "./heroBalanceTypes";

export const mockAccounts: Account[] = [
  {
    id: 1,
    name: "Cuenta Principal",
    balance: 98200.0,
    icon: "💳",
  },
  {
    id: 2,
    name: "Ahorro",
    balance: 26380.5,
    icon: "🏦",
  },
];

// Variación mensual mock (replicando +5.2% del diseño de referencia)
export const mockMonthlyVariation = 5.2;
