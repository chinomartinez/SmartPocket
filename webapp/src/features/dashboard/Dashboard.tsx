import FinancialCards from "@/features/dashboard/financialCards/FinancialCards";
import RecentTransactions from "@/features/dashboard/recentTransactions/RecentTransactions";
import UpcomingPayments from "@/features/dashboard/upcomingPayments/UpcomingPayments";
import { HeroBalanceCard } from "@/features/dashboard/heroBalance/HeroBalanceCard";
import { mockAccounts, mockMonthlyVariation } from "@/features/dashboard/heroBalance/mockData";

export default function Dashboard() {
  return (
    <>
      {/* Hero Balance Card - Elemento visual dominante */}
      <div className="mb-6">
        <HeroBalanceCard accounts={mockAccounts} monthlyVariation={mockMonthlyVariation} />
      </div>

      {/* Financial Cards Row - Métricas compactas */}
      <FinancialCards />

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
