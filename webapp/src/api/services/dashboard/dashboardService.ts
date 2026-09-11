import { spApiClient } from "@/api/spApiClient";
import type { AccountBalancesResponse, MonthlyBalanceDTO } from "./dashboardTypes";

const BASE_PATH = "/dashboard";

export const dashboardService = {
  getAccountBalances: async (accountId: number) => {
    const response = await spApiClient.get<AccountBalancesResponse>(`${BASE_PATH}/accountBalances`, {
      params: { accountId },
    });
    return response.data;
  },

  getMonthlyMetrics: async (accountId: number) => {
    const response = await spApiClient.get<MonthlyBalanceDTO>(`${BASE_PATH}/monthlybalances`, {
      params: { accountId },
    });
    return response.data;
  },
};
