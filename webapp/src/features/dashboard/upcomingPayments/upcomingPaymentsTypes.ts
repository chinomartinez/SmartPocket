export interface Payment {
  id: string;
  title: string;
  amount: number;
  dueDate: Date;
  category: string;
  categoryIcon: string;
  isPaid: boolean;
  isOverdue: boolean;
}
