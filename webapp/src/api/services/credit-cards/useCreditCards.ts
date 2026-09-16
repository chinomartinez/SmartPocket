import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { creditCardService } from "./creditCardService";
import type {
  CreditCardActivityFilters,
  CreditCardCreateCommand,
  CreditCardPurchaseCommand,
  CreditCardSubscriptionCommand,
} from "./creditCardTypes";

export const creditCardKeys = {
  all: ["credit-cards"] as const,
  overview: (id: number) => ["credit-cards", "overview", id] as const,
  activities: (id: number, filters: CreditCardActivityFilters) =>
    ["credit-cards", "activities", id, filters] as const,
  activitiesRoot: (id: number) => ["credit-cards", "activities", id] as const,
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

function useCreditCardActivityMutation<T>(mutationFn: (data: T) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (_, variables) => {
      const data = variables as T & { creditCardId?: number };
      if (data.creditCardId) {
        queryClient.invalidateQueries({ queryKey: creditCardKeys.activitiesRoot(data.creditCardId) });
        queryClient.invalidateQueries({ queryKey: creditCardKeys.overview(data.creditCardId) });
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
