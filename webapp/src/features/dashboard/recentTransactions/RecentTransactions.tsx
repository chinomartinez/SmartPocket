import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { recentTransactions } from './recentTransactionsMockData';
import { formatRelativeTime, formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/router/routes';

export default function RecentTransactions() {
  return (
    <Card className="group glass-card glass-card-hover gap-0 p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-xl">
      {/* Header */}
      <CardHeader className="p-0 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-sp-blue-600 p-3 rounded-xl">
              <span className="text-white text-lg">💳</span>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-white">Recent Transactions</CardTitle>
              <p className="text-sm text-slate-400">Latest activity</p>
            </div>
          </div>
          <Badge className="bg-sp-blue-600/20 text-sp-blue-400 border-0 font-medium">RECENT</Badge>
        </div>
      </CardHeader>

      {/* Transactions List */}
      <CardContent className="p-0 space-y-4">
        {recentTransactions.slice(0, 4).map((transaction) => (
          <div key={transaction.id} className="group/item flex items-center justify-between p-3 rounded-xl hover:bg-slate-700/30 transition-colors">
            {/* Left: Icon + Description */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                <span className="text-lg">{transaction.categoryIcon}</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{transaction.description}</p>
                <p className="text-slate-400 text-xs">{transaction.category}</p>
              </div>
            </div>

            {/* Right: Amount + Time */}
            <div className="text-right">
              <p className={`text-sm font-semibold ${
                transaction.isIncome ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {formatCurrency(transaction.amount)}
              </p>
              <p className="text-slate-500 text-xs">{formatRelativeTime(transaction.date)}</p>
            </div>
          </div>
        ))}
      </CardContent>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <Link to={ROUTES.TRANSACTIONS} className="group/button w-full flex items-center justify-center space-x-2 text-sp-blue-400 hover:text-sp-blue-300 transition-colors py-2 rounded-lg hover:bg-sp-blue-600/10">
          <span className="text-sm font-medium">View all transactions</span>
          <ArrowUpRightIcon className="h-4 w-4 group-hover/button:translate-x-1 group-hover/button:-translate-y-1 transition-transform duration-300" />
        </Link>
      </div>
    </Card>
  )
}
