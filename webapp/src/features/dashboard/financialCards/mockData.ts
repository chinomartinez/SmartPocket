import type { FinancialCardProps } from './financialCardTypes';

export const financialCardData: FinancialCardProps[] = [
  {
    title: 'BALANCE',
    amount: '$24,580.50',
    icon: '💰',
    badgeColor: 'primary',
    changeText: 'this month',
    changeDirection: 'up',
    changePercentage: '2.5%'
  },
  {
    title: 'INCOME',
    amount: '$8,240.00',
    icon: '📈',
    badgeColor: 'success',
    changeText: 'vs last month',
    changeDirection: 'up',
    changePercentage: '12.3%'
  },
  {
    title: 'EXPENSES',
    amount: '$3,672.25',
    icon: '📉',
    badgeColor: 'red',
    changeText: 'vs last month',
    changeDirection: 'up',
    changePercentage: '5.1%'
  },
];
