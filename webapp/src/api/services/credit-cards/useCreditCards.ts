import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { creditCardService } from "./creditCardService";
import type { CreditCardCreateCommand } from "./creditCardTypes";

export const creditCardKeys = {
  all: ["credit-cards"] as const,
  overview: (id: number) => ["credit-cards", "overview", id] as const,
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
