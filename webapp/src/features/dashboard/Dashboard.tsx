import FinancialCards from "@/features/dashboard/financialCards/FinancialCards";
import RecentTransactions from "@/features/dashboard/recentTransactions/RecentTransactions";
import UpcomingPayments from "@/features/dashboard/upcomingPayments/UpcomingPayments";
import { HeroBalanceCard } from "@/features/dashboard/heroBalance/HeroBalanceCard";
import { HeroBalanceCardSkeleton } from "@/features/dashboard/heroBalance/HeroBalanceCardSkeleton";
import { FinancialCardsSkeleton } from "@/features/dashboard/financialCards/FinancialCardsSkeleton";
import {
  useDashboardBalances,
  useDashboardMetrics,
} from "../../api/services/dashboard/useDashboard";
import { ErrorAlert } from "@/components/ErrorAlert";

export default function Dashboard() {
  const {
    data: balanceData,
    isLoading: balanceLoading,
    error: balanceError,
  } = useDashboardBalances();

  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
  } = useDashboardMetrics();

  // Manejar loading states o datos no disponibles
  if (balanceLoading || metricsLoading || !balanceData || !metricsData) {
    return (
      <>
        <div className="mb-6">
          <HeroBalanceCardSkeleton />
        </div>
        <FinancialCardsSkeleton />
      </>
    );
  }

  // Manejar errores
  if (balanceError) return <ErrorAlert error={balanceError} />;
  if (metricsError) return <ErrorAlert error={metricsError} />;

  return (
    <>
      {/* Hero Balance Card - Elemento visual dominante */}
      <div className="mb-6">
        <HeroBalanceCard data={balanceData} />
      </div>

      {/* Financial Cards Row - Métricas compactas */}
      <FinancialCards data={metricsData} />

      {/* Transactions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6 md:mb-8">
        <div className="lg:col-span-3">
          <RecentTransactions />
        </div>
        <div className="lg:col-span-2">
          <UpcomingPayments />
        </div>
      </div>
    </>
  );
}
