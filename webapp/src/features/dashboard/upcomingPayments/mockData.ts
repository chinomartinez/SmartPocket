import type { Payment } from './upcomingPaymentsTypes';

export const upcomingPayments: Payment[] = [
  {
    id: '1',
    title: 'Netflix Subscription',
    amount: 15.99,
    dueDate: new Date('2025-11-05'),
    category: 'Entertainment',
    categoryIcon: '🎬',
    isPaid: false,
    isOverdue: false,
  },
  {
    id: '2',
    title: 'Electricity Bill',
    amount: 87.50,
    dueDate: new Date('2025-10-28'),
    category: 'Utilities',
    categoryIcon: '⚡',
    isPaid: false,
    isOverdue: true,
  },
  {
    id: '3',
    title: 'Gym Membership',
    amount: 45.00,
    dueDate: new Date('2025-11-10'),
    category: 'Health',
    categoryIcon: '💪',
    isPaid: false,
    isOverdue: false,
  },
  {
    id: '4',
    title: 'Internet Service',
    amount: 59.99,
    dueDate: new Date('2025-11-15'),
    category: 'Utilities',
    categoryIcon: '🌐',
    isPaid: false,
    isOverdue: false,
  },
];
