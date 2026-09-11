import { useEffect, useState } from "react";
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
import { useAccounts } from "@/api/services/accounts/useAccounts";
import { DashboardAccountSelector } from "./DashboardAccountSelector";

const DASHBOARD_ACCOUNT_STORAGE_KEY = "smartpocket.dashboard.accountId";

export default function DashboardPage() {
  const {
    data: accounts,
    isLoading: accountsLoading,
    error: accountsError,
  } = useAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<number>();

  useEffect(() => {
    if (!accounts?.length || selectedAccountId !== undefined) return;

    const storedAccountId = Number(localStorage.getItem(DASHBOARD_ACCOUNT_STORAGE_KEY));
    const storedAccount = accounts.find((account) => account.id === storedAccountId);
    const principalAccount = accounts.find((account) => account.isPrincipal);
    const defaultAccount = storedAccount ?? principalAccount ?? accounts[0];

    setSelectedAccountId(defaultAccount.id);
  }, [accounts, selectedAccountId]);

  const handleAccountChange = (accountId: number) => {
    setSelectedAccountId(accountId);
    localStorage.setItem(DASHBOARD_ACCOUNT_STORAGE_KEY, String(accountId));
  };

  const {
    data: balanceData,
    isLoading: balanceLoading,
    error: balanceError,
  } = useDashboardBalances(selectedAccountId);

  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
  } = useDashboardMetrics(selectedAccountId);
  const selectedAccount = accounts?.find((account) => account.id === selectedAccountId);

  if (accountsError) return <ErrorAlert error={accountsError} />;

  if (!accountsLoading && accounts && accounts.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <h2 className="text-lg font-semibold text-foreground">No hay cuentas configuradas</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Crea una cuenta para comenzar a usar tu dashboard.
        </p>
      </div>
    );
  }

  if (balanceError) return <ErrorAlert error={balanceError} />;
  if (metricsError) return <ErrorAlert error={metricsError} />;

  // Manejar loading states o datos no disponibles
  if (
    accountsLoading ||
    !selectedAccountId ||
    !selectedAccount ||
    balanceLoading ||
    metricsLoading ||
    !balanceData ||
    !metricsData
  ) {
    return (
      <>
        <div className="mb-6">
          <HeroBalanceCardSkeleton />
        </div>
        <FinancialCardsSkeleton />
      </>
    );
  }

  return (
    <>
      <DashboardAccountSelector
        accounts={accounts ?? []}
        value={selectedAccountId}
        onChange={handleAccountChange}
      />

      {/* Hero Balance Card - Elemento visual dominante */}
      <div className="mb-6">
        <HeroBalanceCard data={balanceData} currencyCode={selectedAccount.currency.code} />
      </div>

      {/* Financial Cards Row - Métricas compactas */}
      <FinancialCards data={metricsData} currencyCode={selectedAccount.currency.code} />

      {/* Transactions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6 md:mb-8">
        <div className="lg:col-span-3">
          <RecentTransactions accountId={selectedAccountId} />
        </div>
        <div className="lg:col-span-2">
          <UpcomingPayments />
        </div>
      </div>
    </>
  );
}
