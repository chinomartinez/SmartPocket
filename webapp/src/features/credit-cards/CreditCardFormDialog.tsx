import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ErrorAlert";
import { getAccountIcons } from "@/components/iconBoxes/iconMap";
import { useFormErrorHandler } from "@/hooks/useFormErrorHandler";
import type { ApiError } from "@/api/types";
import { useCreateCreditCard, useUpdateCreditCard } from "@/api/services/credit-cards/useCreditCards";
import { creditCardSchema, type CreditCardFormValues } from "./creditCardSchema";

interface CreditCardFormDialogProps {
  card?: CreditCardFormValues;
  cardId?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_FORM_VALUES: CreditCardFormValues = {
  name: "",
  icon: { code: "credit-card", colorHex: "#3B82F6" },
  currencyCode: "ARS",
  creditLimit: 0,
  statementClosingRange: { startDay: 26, endDay: 2 },
  paymentDueRange: { startDay: 4, endDay: 13 },
};

export function CreditCardFormDialog({ card, cardId, open, onOpenChange }: CreditCardFormDialogProps) {
  const mode = card ? "edit" : "create";
  const createMutation = useCreateCreditCard();
  const updateMutation = useUpdateCreditCard();
  const activeMutation = mode === "create" ? createMutation : updateMutation;
  const form = useForm<CreditCardFormValues>({
    resolver: zodResolver(creditCardSchema),
    values: card ?? DEFAULT_FORM_VALUES,
  });
  const handleFormError = useFormErrorHandler(form);
  const apiError = activeMutation.error as ApiError | null;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      activeMutation.reset();
      form.reset(DEFAULT_FORM_VALUES);
    }
    onOpenChange(isOpen);
  };

  const onSubmit = (data: CreditCardFormValues) => {
    if (mode === "create") {
      createMutation.mutate(data, {
        onSuccess: () => handleOpenChange(false),
        onError: handleFormError,
      });
      return;
    }

    if (cardId) {
      updateMutation.mutate(
        { id: cardId, data },
        {
          onSuccess: () => handleOpenChange(false),
          onError: handleFormError,
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Agregar tarjeta" : "Editar tarjeta"}</DialogTitle>
          <DialogDescription>
            Las fechas son rangos habituales y sirven como referencia para armar resúmenes.
          </DialogDescription>
        </DialogHeader>

        {apiError && <ErrorAlert error={apiError} />}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la tarjeta</FormLabel>
                  <FormControl><Input placeholder="Ej: Visa Signature" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-[1fr_130px]">
              <FormField
                control={form.control}
                name="icon.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ícono</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-6 gap-2">
                        {getAccountIcons().map((option) => (
                          <button
                            key={option.code}
                            type="button"
                            title={option.label}
                            onClick={() => field.onChange(option.code)}
                            className={`flex h-10 items-center justify-center rounded-lg border text-xl transition-colors ${field.value === option.code ? "border-sp-blue-400 bg-sp-blue-500/15" : "border-border-subtle hover:border-sp-blue-400/50"}`}
                          >
                            {option.symbol}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon.colorHex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <input type="color" value={field.value} onChange={field.onChange} className="h-9 w-12 cursor-pointer rounded-md border border-border-subtle bg-transparent p-1" />
                        <Input className="uppercase" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="currencyCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda</FormLabel>
                    <FormControl><Input maxLength={3} className="uppercase" placeholder="ARS" {...field} onChange={(event) => field.onChange(event.target.value.toUpperCase())} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Límite configurado</FormLabel>
                    <FormControl><Input type="number" min="0" step="0.01" {...field} onChange={(event) => field.onChange(Number(event.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 rounded-xl border border-border-subtle bg-surface-container-low/50 p-4">
              <div><h3 className="text-sm font-semibold text-foreground">Fechas habituales</h3><p className="mt-1 text-xs text-text-quaternary">Pueden cruzar el fin de mes, por ejemplo del 26 al 2.</p></div>
              <DayRangeFields control={form.control} name="statementClosingRange" label="Cierre habitual" />
              <DayRangeFields control={form.control} name="paymentDueRange" label="Vencimiento habitual" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={activeMutation.isPending}>
                {activeMutation.isPending
                  ? "Guardando..."
                  : mode === "create"
                    ? "Agregar tarjeta"
                    : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface DayRangeFieldsProps {
  control: ReturnType<typeof useForm<CreditCardFormValues>>["control"];
  name: "statementClosingRange" | "paymentDueRange";
  label: string;
}

function DayRangeFields({ control, name, label }: DayRangeFieldsProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
      <FormField control={control} name={`${name}.startDay`} render={({ field }) => <FormItem><FormLabel className="text-xs text-text-quaternary">{label}: desde</FormLabel><FormControl><Input type="number" min="1" max="31" {...field} onChange={(event) => field.onChange(Number(event.target.value))} /></FormControl><FormMessage /></FormItem>} />
      <span className="pb-2 text-sm text-text-quaternary">al</span>
      <FormField control={control} name={`${name}.endDay`} render={({ field }) => <FormItem><FormLabel className="text-xs text-text-quaternary">hasta</FormLabel><FormControl><Input type="number" min="1" max="31" {...field} onChange={(event) => field.onChange(Number(event.target.value))} /></FormControl><FormMessage /></FormItem>} />
    </div>
  );
}
