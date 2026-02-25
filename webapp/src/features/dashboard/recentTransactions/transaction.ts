export interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  categoryIcon: string
  date: Date
  isIncome: boolean
}

export interface TransactionCategory {
  id: string
  name: string
  icon: string
  color: string
}
