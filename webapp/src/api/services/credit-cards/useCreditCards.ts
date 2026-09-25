import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { creditCardService } from "./creditCardService";
import { creditCardStatementService } from "./creditCardStatementService";
import type {
  CreditCardActivityFilters,
  CreditCardCreateCommand,
  CreditCardPurchaseCommand,
  CreditCardSubscriptionCommand,
  CreditCardStatementCreateCommand,
  CreditCardStatementListRequest,
  CreditCardStatementUpdateCommand,
} from "./creditCardTypes";

export const creditCardKeys = {
  all: ["credit-cards"] as const,
  overview: (id: number) => ["credit-cards", "overview", id] as const,
  activities: (id: number, filters: CreditCardActivityFilters) =>
    ["credit-cards", "activities", id, filters] as const,
  activitiesRoot: (id: number) => ["credit-cards", "activities", id] as const,
  statements: (request: CreditCardStatementListRequest) =>
    ["credit-cards", "statements", request.creditCardId, request] as const,
  statementsRoot: (id: number) => ["credit-cards", "statements", id] as const,
  statement: (id: number) => ["credit-cards", "statement", id] as const,
  statementsDetailsRoot: ["credit-cards", "statement"] as const,
  statementSuggestions: (id: number, closingDate: string) =>
    ["credit-cards", "statement-suggestions", id, closingDate] as const,
  statementSuggestionsRoot: (id: number) => ["credit-cards", "statement-suggestions", id] as const,
};

export function useCreditCards() {
  return useQuery({
    queryKey: creditCardKeys.all,
    queryFn: creditCardService.getAll,
  });
}

export function useCreditCardOverview(id: number) {
  return useQuery({
    queryKey: creditCardKeys.overview(id),
    queryFn: () => creditCardService.getOverview(id),
    enabled: id > 0,
  });
}

export function useCreditCardActivities(id: number, filters: CreditCardActivityFilters) {
  return useQuery({
    queryKey: creditCardKeys.activities(id, filters),
    queryFn: () => creditCardService.getActivities(id, filters),
    enabled: id > 0,
  });
}

export function useCreditCardStatements(request: CreditCardStatementListRequest) {
  return useQuery({
    queryKey: creditCardKeys.statements(request),
    queryFn: () => creditCardStatementService.getAll(request),
    enabled: request.creditCardId > 0,
  });
}

export function useCreditCardStatementById(id: number, enabled = true) {
  return useQuery({
    queryKey: creditCardKeys.statement(id),
    queryFn: () => creditCardStatementService.getById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreditCardStatementSuggestions(id: number, closingDate: string, enabled = true) {
  return useQuery({
    queryKey: creditCardKeys.statementSuggestions(id, closingDate),
    queryFn: () => creditCardStatementService.getSuggestions(id, closingDate),
    enabled: enabled && id > 0 && Boolean(closingDate),
  });
}

function invalidateCreditCardStatementQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  creditCardId: number,
  statementId?: number,
) {
  queryClient.invalidateQueries({ queryKey: creditCardKeys.statementsRoot(creditCardId) });
  queryClient.invalidateQueries({ queryKey: creditCardKeys.statementSuggestionsRoot(creditCardId) });
  queryClient.invalidateQueries({ queryKey: creditCardKeys.overview(creditCardId) });
  queryClient.invalidateQueries({ queryKey: creditCardKeys.activitiesRoot(creditCardId) });

  if (statementId) {
    queryClient.invalidateQueries({ queryKey: creditCardKeys.statement(statementId) });
  }
}

export function useCreateCreditCardStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreditCardStatementCreateCommand) => creditCardStatementService.create(data),
    onSuccess: (_, variables) => invalidateCreditCardStatementQueries(queryClient, variables.creditCardId),
  });
}

export function useUpdateCreditCardStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreditCardStatementUpdateCommand }) =>
      creditCardStatementService.update(id, data),
    onSuccess: (_, variables) =>
      invalidateCreditCardStatementQueries(queryClient, variables.data.creditCardId, variables.id),
  });
}

export function useDeleteCreditCardStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; creditCardId: number }) => creditCardStatementService.delete(id),
    onSuccess: (_, variables) =>
      invalidateCreditCardStatementQueries(queryClient, variables.creditCardId, variables.id),
  });
}

function useCreditCardActivityMutation<T>(mutationFn: (data: T) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (_, variables) => {
      const data = variables as T & { creditCardId?: number };
      if (data.creditCardId) {
        queryClient.invalidateQueries({ queryKey: creditCardKeys.activitiesRoot(data.creditCardId) });
        queryClient.invalidateQueries({ queryKey: creditCardKeys.overview(data.creditCardId) });
        queryClient.invalidateQueries({ queryKey: creditCardKeys.statementsRoot(data.creditCardId) });
        queryClient.invalidateQueries({ queryKey: creditCardKeys.statementSuggestionsRoot(data.creditCardId) });
        queryClient.invalidateQueries({ queryKey: creditCardKeys.statementsDetailsRoot });
      }
    },
  });
}

export function useCreateCreditCardPurchase() {
  return useCreditCardActivityMutation<CreditCardPurchaseCommand>(creditCardService.createPurchase);
}

export function useUpdateCreditCardPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreditCardPurchaseCommand }) =>
      creditCardService.updatePurchase(id, data),
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.activitiesRoot(data.creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.overview(data.creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.statementsRoot(data.creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.statementSuggestionsRoot(data.creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.statementsDetailsRoot });
    },
  });
}

export function useDeleteCreditCardPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; creditCardId: number }) =>
      creditCardService.deletePurchase(id),
    onSuccess: (_, { creditCardId }) => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.activitiesRoot(creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.overview(creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.statementsRoot(creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.statementSuggestionsRoot(creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.statementsDetailsRoot });
    },
  });
}

export function useCreateCreditCardSubscription() {
  return useCreditCardActivityMutation<CreditCardSubscriptionCommand>(creditCardService.createSubscription);
}

export function useUpdateCreditCardSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreditCardSubscriptionCommand }) =>
      creditCardService.updateSubscription(id, data),
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.activitiesRoot(data.creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.overview(data.creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.statementsRoot(data.creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.statementSuggestionsRoot(data.creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.statementsDetailsRoot });
    },
  });
}

export function useDeleteCreditCardSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; creditCardId: number }) =>
      creditCardService.deleteSubscription(id),
    onSuccess: (_, { creditCardId }) => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.activitiesRoot(creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.overview(creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.statementsRoot(creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.statementSuggestionsRoot(creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.statementsDetailsRoot });
    },
  });
}

export function useCancelCreditCardSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; creditCardId: number }) =>
      creditCardService.cancelSubscription(id),
    onSuccess: (_, { creditCardId }) => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.activitiesRoot(creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.overview(creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.statementsRoot(creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.statementSuggestionsRoot(creditCardId) });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.statementsDetailsRoot });
    },
  });
}

export function useCreateCreditCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: creditCardService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.all });
    },
  });
}

export function useUpdateCreditCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreditCardCreateCommand }) =>
      creditCardService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.all });
      queryClient.invalidateQueries({ queryKey: creditCardKeys.overview(variables.id) });
    },
  });
}
