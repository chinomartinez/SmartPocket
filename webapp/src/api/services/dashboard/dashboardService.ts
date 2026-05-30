import { spApiClient } from "@/api/spApiClient";
import type { AccountBalancesResponse, MonthlyBalanceDTO } from "./dashboardTypes";

const BASE_PATH = "/dashboard";

export const dashboardService = {
  getAccountBalances: async () => {
    const response = await spApiClient.get<AccountBalancesResponse>(`${BASE_PATH}/accountBalances`);
    return response.data;
  },

  getMonthlyMetrics: async () => {
    const response = await spApiClient.get<MonthlyBalanceDTO>(`${BASE_PATH}/monthlybalances`);
    return response.data;
  },
};
