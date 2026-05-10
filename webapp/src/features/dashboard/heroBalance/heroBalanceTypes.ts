/**
 * Types para Hero Balance Card
 * Componente principal del Home/Dashboard mostrando balance consolidado
 */

export interface Account {
  id: number;
  name: string;
  balance: number;
  icon: string;
}

export interface HeroBalanceCardProps {
  accounts: Account[];
  monthlyVariation: number; // Porcentaje de variación mensual (ej: 5.2 para +5.2%)
}

export interface AccountProgressBarProps {
  name: string;
  balance: number;
  percentage: number; // Porcentaje del total (0-100)
  icon: string;
}
