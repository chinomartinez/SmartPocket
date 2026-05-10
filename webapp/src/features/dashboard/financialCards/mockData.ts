import type { FinancialCardProps } from "./financialCardTypes";

export const financialCardData: FinancialCardProps[] = [
  {
    title: "Ingresos del Mes",
    amount: "+$84.200,00",
    amountColor: "text-emerald-400",
    secondaryText: "↗ +12.5% vs mes anterior",
  },
  {
    title: "Gastos del Mes",
    amount: "-$32.800,00",
    amountColor: "text-red-400",
    secondaryText: "↘ -3.2% vs mes anterior",
  },
  {
    title: "Ahorro del Mes",
    amount: "$51.400,00",
    amountColor: "text-sp-blue-400 dark:text-sp-blue-400",
    secondaryText: "61% de los ingresos",
  },
];
