import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/api/services/dashboard/dashboardService";

// Query key factory
export const dashboardKeys = {
  all: ["dashboard"] as const,
  balances: (accountId?: number) => [...dashboardKeys.all, "balances", accountId] as const,
  metrics: (accountId?: number) => [...dashboardKeys.all, "metrics", accountId] as const,
};

export function useDashboardBalances(accountId?: number) {
  return useQuery({
    queryKey: dashboardKeys.balances(accountId),
    queryFn: () => dashboardService.getAccountBalances(accountId!),
    enabled: !!accountId,
    staleTime: 30000, // 30s
  });
}

export function useDashboardMetrics(accountId?: number) {
  return useQuery({
    queryKey: dashboardKeys.metrics(accountId),
    queryFn: () => dashboardService.getMonthlyMetrics(accountId!),
    enabled: !!accountId,
    staleTime: 30000, // 30s
  });
}
