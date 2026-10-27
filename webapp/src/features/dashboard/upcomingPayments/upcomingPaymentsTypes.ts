export interface Payment {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD (DateOnly)
  category: string;
  categoryIcon: string;
  isPaid: boolean;
  isOverdue: boolean;
}
