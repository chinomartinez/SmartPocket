import { spApiClient } from "@/api/spApiClient";
import type { PagedListResponse } from "../shared/sharedTypes";
import type {
  CreditCardStatementCreateCommand,
  CreditCardStatementDetailDTO,
  CreditCardStatementListItemDTO,
  CreditCardStatementListRequest,
  CreditCardStatementSuggestionsDTO,
  CreditCardStatementUpdateCommand,
} from "./creditCardTypes";

export const creditCardStatementService = {
  getAll: async (request: CreditCardStatementListRequest) => {
    const response = await spApiClient.get<PagedListResponse<CreditCardStatementListItemDTO>>(
      "/creditcardstatements",
      { params: { ...request } },
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await spApiClient.get<CreditCardStatementDetailDTO>(`/creditcardstatements/${id}`);
    return response.data;
  },

  getSuggestions: async (creditCardId: number, closingDate: string) => {
    const response = await spApiClient.get<CreditCardStatementSuggestionsDTO>(
      `/CreditCards/${creditCardId}/CreditCardStatements/suggestions`,
      { params: { closingDate } },
    );
    return response.data;
  },

  create: async (data: CreditCardStatementCreateCommand) => {
    const response = await spApiClient.post<{ creditCardStatementId: number }>("/creditcardstatements", data);
    return response.data;
  },

  update: async (id: number, data: CreditCardStatementUpdateCommand) => {
    await spApiClient.put(`/creditcardstatements/${id}`, data);
  },

  delete: async (id: number) => {
    await spApiClient.delete(`/creditcardstatements/${id}`);
  },
};
