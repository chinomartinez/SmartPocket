import type { CurrencyItemDTO } from "./currencyItemDTO";
import { spApiClient } from "@/api/spApiClient";

const BASE_PATH = "/currencies";

export const currencyService = {
  getAll: async () => {
    const response = await spApiClient.get<CurrencyItemDTO[]>(BASE_PATH);
    return response.data;
  },
};
