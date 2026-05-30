import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/api/services/dashboard/dashboardService";

// Query key factory
export const dashboardKeys = {
  all: ["dashboard"] as const,
  balances: () => [...dashboardKeys.all, "balances"] as const,
  metrics: () => [...dashboardKeys.all, "metrics"] as const,
};

export function useDashboardBalances() {
  return useQuery({
    queryKey: dashboardKeys.balances(),
    queryFn: dashboardService.getAccountBalances,
    staleTime: 30000, // 30s
  });
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: dashboardKeys.metrics(),
    queryFn: dashboardService.getMonthlyMetrics,
    staleTime: 30000, // 30s
  });
}
