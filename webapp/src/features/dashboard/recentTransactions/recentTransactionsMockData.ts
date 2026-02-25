import type { Transaction, TransactionCategory } from './transaction'

export const transactionCategories: TransactionCategory[] = [
  { id: '1', name: 'Food & Dining', icon: '🍕', color: 'bg-orange-500' },
  { id: '2', name: 'Salary', icon: '💰', color: 'bg-emerald-500' },
  { id: '3', name: 'Transportation', icon: '⛽', color: 'bg-blue-500' },
  { id: '4', name: 'Shopping', icon: '🛒', color: 'bg-purple-500' },
  { id: '5', name: 'Entertainment', icon: '🎬', color: 'bg-pink-500' },
  { id: '6', name: 'Healthcare', icon: '🏥', color: 'bg-red-500' },
  { id: '7', name: 'Utilities', icon: '⚡', color: 'bg-yellow-500' },
  { id: '8', name: 'Investment', icon: '📈', color: 'bg-emerald-600' },
]

export const recentTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Pizza Express',
    amount: -24.50,
    category: 'Food & Dining',
    categoryIcon: '🍕',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isIncome: false
  },
  {
    id: '2',
    description: 'Monthly Salary',
    amount: 3200.00,
    category: 'Salary',
    categoryIcon: '💰',
    date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    isIncome: true
  },
  {
    id: '3',
    description: 'Gas Station',
    amount: -45.20,
    category: 'Transportation',
    categoryIcon: '⛽',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isIncome: false
  },
  {
    id: '4',
    description: 'Grocery Store',
    amount: -127.30,
    category: 'Shopping',
    categoryIcon: '🛒',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    isIncome: false
  },
  {
    id: '5',
    description: 'Stock Dividend',
    amount: 89.45,
    category: 'Investment',
    categoryIcon: '📈',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    isIncome: true
  }
]
