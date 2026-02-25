import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { upcomingPayments } from './mockData';
import { formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function UpcomingPayments() {
  // Helper function to calculate days until due date
  const getDaysUntil = (dueDate: Date): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper function to format days remaining text
  const formatDaysRemaining = (days: number): string => {
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days} days left`;
  };

  return (
    <Card className="group glass-card glass-card-hover gap-0 p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-xl">
      {/* Header */}
      <CardHeader className="p-0 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-sp-purple-600 p-3 rounded-xl">
              <span className="text-white text-lg">📅</span>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-white">Upcoming Payments</CardTitle>
              <p className="text-sm text-slate-400">Bills to pay soon</p>
            </div>
          </div>
          <Badge className="bg-sp-purple-600/20 text-sp-purple-400 border-0 font-medium">
            {upcomingPayments.filter(p => !p.isPaid).length} PENDING
          </Badge>
        </div>
      </CardHeader>

      {/* Payments List */}
      <CardContent className="p-0 space-y-4">
        {upcomingPayments.slice(0, 4).map((payment) => {
          const daysUntil = getDaysUntil(payment.dueDate);
          const isOverdue = daysUntil < 0;

          return (
            <div 
              key={payment.id} 
              className="group/item flex items-center justify-between p-3 rounded-xl hover:bg-slate-700/30 transition-colors"
            >
              {/* Left: Icon + Title */}
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300">
                  <span className="text-lg">{payment.categoryIcon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{payment.title}</p>
                  <p className="text-slate-400 text-xs">{payment.category}</p>
                </div>
              </div>

              {/* Right: Amount + Status */}
              <div className="text-right flex-shrink-0 ml-3">
                <p className="text-sm font-semibold text-red-400">
                  {formatCurrency(payment.amount)}
                </p>
                <p className={`text-xs ${isOverdue ? 'text-red-400 font-medium' : 'text-slate-500'}`}>
                  {formatDaysRemaining(daysUntil)}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <a href="#payments" className="group/button w-full flex items-center justify-center space-x-2 text-sp-purple-400 hover:text-sp-purple-300 transition-colors py-2 rounded-lg hover:bg-sp-purple-600/10">
          <span className="text-sm font-medium">View all payments</span>
          <ArrowUpRightIcon className="h-4 w-4 group-hover/button:translate-x-1 group-hover/button:-translate-y-1 transition-transform duration-300" />
        </a>
      </div>
    </Card>
  );
}
