import { spApiClient } from "@/api/spApiClient";
import type {
  CreditCardCreateCommand,
  CreditCardActivityFilters,
  CreditCardActivityPage,
  CreditCardListItemDTO,
  CreditCardOverviewDTO,
  CreditCardPurchaseCommand,
  CreditCardSubscriptionCommand,
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

  getActivities: async (id: number, filters: CreditCardActivityFilters) => {
    const response = await spApiClient.get<CreditCardActivityPage>(
      `${BASE_PATH}/${id}/activities`,
      { params: { ...filters } },
    );
    return response.data;
  },


  createPurchase: async (data: CreditCardPurchaseCommand) => {
    const response = await spApiClient.post<{ id: number }>("/creditcardpurchases", data);
    return response.data;
  },

  updatePurchase: async (id: number, data: CreditCardPurchaseCommand) => {
    await spApiClient.put(`/creditcardpurchases/${id}`, data);
  },

  deletePurchase: async (id: number) => {
    await spApiClient.delete(`/creditcardpurchases/${id}`);
  },

  createSubscription: async (data: CreditCardSubscriptionCommand) => {
    const response = await spApiClient.post<{ id: number }>("/creditcardsubscriptions", data);
    return response.data;
  },

  updateSubscription: async (id: number, data: CreditCardSubscriptionCommand) => {
    await spApiClient.put(`/creditcardsubscriptions/${id}`, data);
  },

  deleteSubscription: async (id: number) => {
    await spApiClient.delete(`/creditcardsubscriptions/${id}`);
  },

  cancelSubscription: async (id: number) => {
    await spApiClient.patch(`/creditcardsubscriptions/${id}/cancel`);
  },

  create: async (data: CreditCardCreateCommand) => {
    const response = await spApiClient.post<{ id: number }>(BASE_PATH, data);
    return response.data;
  },

  update: async (id: number, data: CreditCardCreateCommand) => {
    await spApiClient.put(`${BASE_PATH}/${id}`, data);
  },
};
