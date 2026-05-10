import type { Payment } from "./upcomingPaymentsTypes";

export const upcomingPayments: Payment[] = [
  {
    id: "1",
    title: "Internet Service",
    amount: 4500,
    dueDate: new Date("2026-05-08"),
    category: "Utilities",
    categoryIcon: "📱",
    isPaid: false,
    isOverdue: false,
  },
  {
    id: "2",
    title: "Electricity & Gas",
    amount: 12300,
    dueDate: new Date("2026-05-13"),
    category: "Utilities",
    categoryIcon: "💡",
    isPaid: false,
    isOverdue: false,
  },
  {
    id: "3",
    title: "Rent Payment",
    amount: 85000,
    dueDate: new Date("2026-05-20"),
    category: "Housing",
    categoryIcon: "🏠",
    isPaid: false,
    isOverdue: false,
  },
  {
    id: "4",
    title: "Netflix Subscription",
    amount: 1599,
    dueDate: new Date("2026-05-25"),
    category: "Entertainment",
    categoryIcon: "🎬",
    isPaid: false,
    isOverdue: false,
  },
];
