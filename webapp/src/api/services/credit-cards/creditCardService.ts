import { spApiClient } from "@/api/spApiClient";
import type {
  CreditCardCreateCommand,
  CreditCardListItemDTO,
  CreditCardOverviewDTO,
} from "./creditCardTypes";

const BASE_PATH = "/creditcards";

export const creditCardService = {
  getAll: async () => {
    const response = await spApiClient.get<CreditCardListItemDTO[]>(BASE_PATH);
    return response.data;
  },

  getOverview: async (id: number) => {
    const response = await spApiClient.get<CreditCardOverviewDTO>(`${BASE_PATH}/${id}/overview`);
    return response.data;
  },

  create: async (data: CreditCardCreateCommand) => {
    const response = await spApiClient.post<{ id: number }>(BASE_PATH, data);
    return response.data;
  },

  update: async (id: number, data: CreditCardCreateCommand) => {
    await spApiClient.put(`${BASE_PATH}/${id}`, data);
  },
};
