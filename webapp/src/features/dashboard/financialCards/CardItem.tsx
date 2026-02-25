import type { FinancialCardProps } from './financialCardTypes';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CardItem({
  title,
  amount,
  icon,
  badgeColor,
  changeText,
  changeDirection,
  changePercentage
}: FinancialCardProps) {
  // Define color mapping
  const colorMap: Record<string, { badge: string; iconBg: string }> = {
    primary: {
      badge: 'bg-sp-blue-600/20 text-sp-blue-400',
      iconBg: 'bg-sp-blue-600'
    },
    success: {
      badge: 'bg-emerald-600/20 text-emerald-400',
      iconBg: 'bg-emerald-600'
    },
    red: {
      badge: 'bg-red-600/20 text-red-400',
      iconBg: 'bg-red-600'
    },
    accent: {
      badge: 'bg-sp-purple-600/20 text-sp-purple-400',
      iconBg: 'bg-sp-purple-600'
    }
  };
  
  // Get color classes with fallback to primary if not found
  const colorClasses = colorMap[badgeColor] || colorMap.primary;

  // Determine change direction styling
  const changeDirectionStyles = changeDirection === 'up'
    ? 'text-emerald-400'
    : 'text-red-400';

  const changeDirectionIcon = changeDirection === 'up' ? '↗' : '↘';

  return (
    <Card className="group glass-card glass-card-hover p-6 gap-0 hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className={`${colorClasses.iconBg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
          <div className="w-6 h-6 text-white flex items-center justify-center text-lg">
            {icon}
          </div>
        </div>
        <Badge className={`${colorClasses.badge} border-0`}>
          {title}
        </Badge>
      </div>
      <div className="text-3xl font-bold text-white mb-2">{amount}</div>
      <div className={`${changeDirectionStyles} text-sm font-medium`}>
        {`${changeDirectionIcon} ${changeDirection === 'up' ? '+' : '-'}${changePercentage} ${changeText}`}
      </div>
    </Card>
  );
}
