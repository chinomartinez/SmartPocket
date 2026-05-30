/**
 * Tipo de métrica financiera para determinar color semántico
 */
export type FinancialMetricType = "income" | "expense" | "saving";

/**
 * Props para FinancialCard - estructura realista que vendrá del backend
 */
export interface FinancialCardProps {
  title: string;
  amount: number; // Valor numérico (ej: 84200.00)
  type: FinancialMetricType; // Determina color semántico
  variation: number; // Variación porcentual (ej: 12.5 para +12.5%, -3.2 para -3.2%)
}
