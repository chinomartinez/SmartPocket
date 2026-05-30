import { useState, useEffect } from "react";
import CardItem from "./CardItem";
import type { MonthlyBalanceDTO } from "@/api/services/dashboard/dashboardTypes";
import type { FinancialCardProps } from "./financialCardTypes";

interface FinancialCardsProps {
  data: MonthlyBalanceDTO;
}

export default function FinancialCards({ data }: FinancialCardsProps) {
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);

  // Auto-colapsar después de 4 segundos
  useEffect(() => {
    if (expandedCardIndex !== null) {
      const timer = setTimeout(() => {
        setExpandedCardIndex(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [expandedCardIndex]);

  const handleCardTap = (index: number) => {
    // Toggle: si ya está expandida, colapsar; sino, expandir
    setExpandedCardIndex((prev) => (prev === index ? null : index));
  };

  // Construir cards dinámicamente desde el DTO
  const cards: FinancialCardProps[] = [
    {
      title: "Ingresos del Mes",
      amount: data.income.amount,
      type: "income",
      variation: data.income.monthlyVariation,
    },
    {
      title: "Gastos del Mes",
      amount: data.expense.amount,
      type: "expense",
      variation: data.expense.monthlyVariation,
    },
    {
      title: "Ahorro del Mes",
      amount: data.savings.amount,
      type: "saving",
      variation: data.savings.monthlyVariation,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-6 mb-6 md:mb-8">
      {cards.map((card, index) => (
        <CardItem
          key={index}
          {...card}
          isExpanded={expandedCardIndex === index}
          isHidden={expandedCardIndex !== null && expandedCardIndex !== index}
          onTap={() => handleCardTap(index)}
        />
      ))}
    </div>
  );
}
