import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ErrorAlert";
import { IconBox } from "@/components/iconBoxes/IconBox";
import { useCategories } from "@/api/services/categories/useCategories";
import { useCurrencies } from "@/api/services/currencies/useCurrencies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateCreditCardSubscription,
  useUpdateCreditCardSubscription,
} from "@/api/services/credit-cards/useCreditCards";
import type { CreditCardActivityListItemDTO } from "@/api/services/credit-cards/creditCardTypes";
import { useFormErrorHandler } from "@/hooks/useFormErrorHandler";
import type { ApiError } from "@/api/types";
import {
  creditCardSubscriptionActivitySchema,
  type CreditCardSubscriptionActivityFormValues,
} from "./creditCardActivitySchema";
import { CREDIT_CARD_ACTIVITY_TYPES } from "../creditCardActivityConstants";

interface CreditCardSubscriptionFormDialogProps {
  cardId: number;
  currencyCode: string;
  activity?: CreditCardActivityListItemDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_VALUES: CreditCardSubscriptionActivityFormValues = {
  categoryId: 0,
  description: "",
  effectiveDate: new Date().toISOString().slice(0, 10),
  currencyCode: "ARS",
  amount: 0,
};

export function CreditCardSubscriptionFormDialog({
  cardId,
  currencyCode,
  activity,
  open,
  onOpenChange,
}: CreditCardSubscriptionFormDialogProps) {
  const categoriesQuery = useCategories(false);
  const currenciesQuery = useCurrencies();
  const createMutation = useCreateCreditCardSubscription();
  const updateMutation = useUpdateCreditCardSubscription();

  const isEdit = activity?.type === CREDIT_CARD_ACTIVITY_TYPES.SUBSCRIPTION;
  const activeMutation = isEdit ? updateMutation : createMutation;

  const form = useForm<CreditCardSubscriptionActivityFormValues>({
    resolver: zodResolver(creditCardSubscriptionActivitySchema),
    values: activity
      ? {
          categoryId: activity.category.id,
          description: activity.description,
          effectiveDate: activity.effectiveDate,
          currencyCode: activity.currencyCode,
          amount: activity.amount,
        }
      : DEFAULT_VALUES,
  });

  const handleFormError = useFormErrorHandler(form);
  const apiError = activeMutation.error as ApiError | null;
  const formCurrencyCode = form.watch("currencyCode");
  const currencies = (currenciesQuery.data ?? []).filter(
    (currency) => currency.code === currencyCode || currency.code === "USD",
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      activeMutation.reset();
      form.reset(DEFAULT_VALUES);
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = (values: CreditCardSubscriptionActivityFormValues) => {
    const data = {
      creditCardId: cardId,
      categoryId: values.categoryId,
      description: values.description,
      effectiveDate: values.effectiveDate,
      subscriptionAmount: { amount: values.amount, currencyCode: values.currencyCode },
    };

    if (isEdit && activity) {
      updateMutation.mutate(
        { id: activity.id, data },
        { onSuccess: () => handleOpenChange(false), onError: handleFormError },
      );
      return;
    }

    createMutation.mutate(data, {
      onSuccess: () => handleOpenChange(false),
      onError: handleFormError,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar suscripción" : "Agregar suscripción"}</DialogTitle>
          <DialogDescription>
            Registrá un cargo recurrente asociado a esta tarjeta.
          </DialogDescription>
        </DialogHeader>
        {apiError && <ErrorAlert error={apiError} />}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pb-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Spotify Premium" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid min-w-0 items-start gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Categoría</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? field.value.toString() : ""}
                      disabled={categoriesQuery.isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full min-w-0 [&>span]:truncate">
                          <SelectValue placeholder="Seleccioná una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(categoriesQuery.data ?? []).map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            <div className="flex items-center gap-2">
                              <IconBox
                                icon={category.icon}
                                size="xs"
                                shape="rounded"
                                backgroundOpacity={20}
                              />
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha efectiva</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currencyCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={currenciesQuery.isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full min-w-0 [&>span]:truncate">
                          <SelectValue placeholder="Seleccioná una moneda" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} - {currency.symbol} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Importe inicial ({formCurrencyCode || currencyCode})</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...field}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            <DialogFooter className="shrink-0 border-t border-border-subtle pt-4 sm:flex-row">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={activeMutation.isPending} className="w-full sm:w-auto">
                {activeMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
