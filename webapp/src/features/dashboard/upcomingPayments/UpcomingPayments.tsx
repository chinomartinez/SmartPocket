import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { upcomingPayments } from "./mockData";
import { formatCurrency } from "@/utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/router/routes";
import { cn } from "@/lib/utils";

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
    if (days < 0) return `Vence en ${Math.abs(days)} días`;
    if (days === 0) return "Vence hoy";
    if (days === 1) return "Vence mañana";
    return `Vence en ${days} días`;
  };

  // Helper function to get urgency styles
  const getUrgencyStyles = (days: number) => {
    if (days < 0) {
      // Overdue - red intenso
      return {
        container: "bg-red-500/[0.12] border-red-500/30",
        badge: "bg-red-500/20 text-red-400",
        amount: "text-red-400",
      };
    }
    if (days <= 4) {
      // Critical - red
      return {
        container: "bg-red-500/[0.08] border-red-500/20",
        badge: "bg-red-500/15 text-red-400",
        amount: "text-red-400",
      };
    }
    if (days <= 10) {
      // Warning - amber
      return {
        container: "bg-amber-500/[0.08] border-amber-500/20",
        badge: "bg-amber-500/15 text-amber-400",
        amount: "text-red-400",
      };
    }
    // Normal - gray
    return {
      container: "bg-slate-500/[0.05] border-slate-500/10",
      badge: "bg-slate-500/10 text-slate-400",
      amount: "text-red-400",
    };
  };

  return (
    <Card className="group glass-card glass-card-hover gap-0 p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-xl">
      {/* Header */}
      <CardHeader className="p-0 mb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-text-secondary">
            Upcoming Payments
          </CardTitle>
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-center gap-1.5 text-sm text-sp-blue-400 hover:text-sp-blue-300 transition-colors"
          >
            <span>View All</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>

      {/* Payments List */}
      <CardContent className="p-0 space-y-3">
        {upcomingPayments.slice(0, 4).map((payment) => {
          const daysUntil = getDaysUntil(payment.dueDate);
          const styles = getUrgencyStyles(daysUntil);

          return (
            <div
              key={payment.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                styles.container,
              )}
            >
              {/* Left: Icon + Title */}
              <span className="text-lg flex-shrink-0">{payment.categoryIcon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-medium text-sm truncate">{payment.title}</p>
                <p className="text-text-quaternary text-xs">{formatDaysRemaining(daysUntil)}</p>
              </div>

              {/* Right: Amount + Badge */}
              <div className="text-right flex-shrink-0">
                <p className={cn("text-sm font-semibold mb-1", styles.amount)}>
                  {formatCurrency(payment.amount)}
                </p>
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block",
                    styles.badge,
                  )}
                >
                  {daysUntil < 0 ? `${Math.abs(daysUntil)} días` : `${daysUntil} días`}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
