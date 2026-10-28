import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Control } from "react-hook-form";
import { Check, Loader2 } from "lucide-react";
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
import { formatCurrency } from "@/utils/formatters";
import { formatDateOnlyLabel, toDateOnly } from "@/utils/dateHelpers";
import { getNumericInputChangeValue, getNumericInputValue } from "@/utils/numericInput";
import type { ApiError } from "@/api/types";
import { useFormErrorHandler } from "@/hooks/useFormErrorHandler";
import {
  useCreateCreditCardStatement,
  useCreditCardStatementById,
  useCreditCardStatementSuggestions,
  useUpdateCreditCardStatement,
} from "@/api/services/credit-cards/useCreditCards";
import type {
  CreditCardStatementChargeItemDTO,
  CreditCardStatementInstallmentItemDTO,
  CreditCardStatementListItemDTO,
} from "@/api/services/credit-cards/creditCardTypes";
import {
  creditCardStatementSchema,
  type CreditCardStatementFormValues,
} from "./creditCardStatementSchema";

interface CreditCardStatementFormDialogProps {
  cardId: number;
  currencyCode: string;
  statement?: CreditCardStatementListItemDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getCreateValues(): CreditCardStatementFormValues {
  const now = new Date();
  return {
    description: "",
    closingDate: toDateOnly(now),
    dueDate: getDefaultDueDate(now),
    selectedItemsCount: 0,
  };
}

export function CreditCardStatementFormDialog({
  cardId,
  currencyCode,
  statement,
  open,
  onOpenChange,
}: CreditCardStatementFormDialogProps) {
  const isEdit = Boolean(statement);
  const createMutation = useCreateCreditCardStatement();
  const updateMutation = useUpdateCreditCardStatement();
  const activeMutation = isEdit ? updateMutation : createMutation;
  const detailQuery = useCreditCardStatementById(statement?.id ?? 0, open && isEdit);

  const form = useForm<CreditCardStatementFormValues>({
    resolver: zodResolver(creditCardStatementSchema),
    values: statement
      ? {
          description: statement.description,
          closingDate: statement.closingDate,
          dueDate: statement.dueDate,
          selectedItemsCount: 0,
        }
      : getCreateValues(),
  });

  const closingDate = form.watch("closingDate");
  const persistedClosingDate = detailQuery.data?.closingDate;
  const hasEditedClosingDate = Boolean(form.formState.dirtyFields.closingDate);
  const suggestionClosingDate =
    isEdit && !hasEditedClosingDate ? (persistedClosingDate ?? closingDate) : closingDate;
  const suggestionsQuery = useCreditCardStatementSuggestions(
    cardId,
    suggestionClosingDate,
    open && (!isEdit || detailQuery.isSuccess),
  );
  const itemsSource = isEdit ? detailQuery.data : suggestionsQuery.data;

  const includedInstallments = useMemo(
    () => detailQuery.data?.includedInstallmentItems ?? [],
    [detailQuery.data],
  );

  const includedCharges = useMemo(
    () => detailQuery.data?.includedChargeItems ?? [],
    [detailQuery.data],
  );

  const suggestedInstallments = useMemo(
    () => suggestionsQuery.data?.suggestedInstallmentItems ?? [],
    [suggestionsQuery.data],
  );
  const suggestedCharges = useMemo(
    () => suggestionsQuery.data?.suggestedChargeItems ?? [],
    [suggestionsQuery.data],
  );

  const installments = useMemo(
    () => [...includedInstallments, ...suggestedInstallments],
    [includedInstallments, suggestedInstallments],
  );
  const charges = useMemo(
    () => [...includedCharges, ...suggestedCharges],
    [includedCharges, suggestedCharges],
  );

  const [selectedInstallmentIds, setSelectedInstallmentIds] = useState<Set<number>>(new Set());
  const [selectedChargeKeys, setSelectedChargeKeys] = useState<Set<string>>(new Set());
  const [chargeAmounts, setChargeAmounts] = useState<Record<string, number | undefined>>({});
  const apiError = activeMutation.error as ApiError | null;
  const handleFormError = useFormErrorHandler(form);
  const isLoadingItems = detailQuery.isLoading || suggestionsQuery.isLoading;

  useEffect(() => {
    if (!open || !itemsSource) return;
    setSelectedInstallmentIds(new Set(isEdit ? includedInstallments.map((item) => item.id) : []));
    setSelectedChargeKeys(new Set(isEdit ? includedCharges.map(getChargeKey) : []));
    form.setValue(
      "selectedItemsCount",
      isEdit ? includedInstallments.length + includedCharges.length : 0,
      { shouldValidate: form.formState.isSubmitted },
    );
    setChargeAmounts(Object.fromEntries(charges.map((item) => [getChargeKey(item), item.amount])));
  }, [
    charges,
    includedCharges,
    includedInstallments,
    isEdit,
    itemsSource,
    open,
    suggestedInstallments,
    form,
  ]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      activeMutation.reset();
      form.reset(getCreateValues());
      setSelectedInstallmentIds(new Set());
      setSelectedChargeKeys(new Set());
      setChargeAmounts({});
    }
    onOpenChange(nextOpen);
  };

  const handleToggleInstallment = (id: number) => {
    const nextSelection = toggleSetValue(selectedInstallmentIds, id);
    setSelectedInstallmentIds(nextSelection);
    form.setValue("selectedItemsCount", nextSelection.size + selectedChargeKeys.size, {
      shouldDirty: true,
      shouldValidate: form.formState.isSubmitted,
    });
  };

  const handleToggleCharge = (key: string) => {
    const nextSelection = toggleSetValue(selectedChargeKeys, key);
    setSelectedChargeKeys(nextSelection);
    form.setValue("selectedItemsCount", selectedInstallmentIds.size + nextSelection.size, {
      shouldDirty: true,
      shouldValidate: form.formState.isSubmitted,
    });
  };

  const handleChargeAmountChange = (key: string, amount: number | undefined) => {
    setChargeAmounts((current) => ({ ...current, [key]: amount }));
  };

  const handleCancel = () => {
    handleOpenChange(false);
  };

  const handleSubmit = (values: CreditCardStatementFormValues) => {
    const selectedCharges = charges.filter((item) => selectedChargeKeys.has(getChargeKey(item)));
    const commonData = {
      creditCardId: cardId,
      description: values.description,
      closingDate: values.closingDate,
      dueDate: values.dueDate,
      installmentIds: installments
        .filter((item) => selectedInstallmentIds.has(item.id))
        .map((item) => item.id),
    };

    if (!isEdit) {
      createMutation.mutate(
        {
          ...commonData,
          subscriptionCharges: selectedCharges.map((item) => toCreateCharge(item, chargeAmounts)),
        },
        { onSuccess: handleSaveSuccess, onError: handleFormError },
      );
      return;
    }

    if (!statement) return;
    updateMutation.mutate(
      {
        id: statement.id,
        data: {
          ...commonData,
          subsChargesForUpdate: selectedCharges
            .filter((item) => item.id !== null)
            .map((item) => ({
              id: item.id as number,
              chargeNumber: item.chargeNumber,
              amount: chargeAmounts[getChargeKey(item)] ?? item.amount,
            })),
          subsChargesForCreate: selectedCharges
            .filter((item) => item.id === null)
            .map((item) => toCreateCharge(item, chargeAmounts)),
        },
      },
      { onSuccess: handleSaveSuccess, onError: handleFormError },
    );
  };

  const handleSaveSuccess = () => {
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="modal-form flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] min-h-0 flex-col overflow-hidden sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:max-w-2xl">
        <DialogHeader className="pb-4 border-b border-border-subtle">
          <DialogTitle>{isEdit ? "Editar resumen" : "Armar nuevo resumen"}</DialogTitle>
          <DialogDescription>
            Seleccioná los registros de SmartPocket que querés incluir.
          </DialogDescription>
        </DialogHeader>
        {apiError && <ErrorAlert error={apiError} />}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain pb-4 [-webkit-overflow-scrolling:touch]">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Resumen septiembre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <DateField control={form.control} name="closingDate" label="Fecha de cierre" />
                <DateField control={form.control} name="dueDate" label="Fecha de vencimiento" />
              </div>
              <div>
                {isLoadingItems ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-text-quaternary">
                    <Loader2 className="size-4 animate-spin" /> Buscando sugerencias...
                  </div>
                ) : (
                  <div className="space-y-5">
                    {isEdit && (
                      <StatementItemsSection title="Detalle del resumen">
                        <StatementItemList
                          installments={includedInstallments}
                          charges={includedCharges}
                          selectedInstallmentIds={selectedInstallmentIds}
                          selectedKeys={selectedChargeKeys}
                          amounts={chargeAmounts}
                          currencyCode={currencyCode}
                          onToggleInstallment={handleToggleInstallment}
                          onToggleCharge={handleToggleCharge}
                          onAmountChange={handleChargeAmountChange}
                        />
                      </StatementItemsSection>
                    )}
                    <StatementItemsSection title="Sugerencias">
                      {form.formState.errors.selectedItemsCount?.message && (
                        <p className="mb-2 text-sm text-destructive" role="alert">
                          {form.formState.errors.selectedItemsCount.message}
                        </p>
                      )}
                      <StatementItemList
                        installments={suggestedInstallments}
                        charges={suggestedCharges}
                        selectedInstallmentIds={selectedInstallmentIds}
                        selectedKeys={selectedChargeKeys}
                        amounts={chargeAmounts}
                        currencyCode={currencyCode}
                        onToggleInstallment={handleToggleInstallment}
                        onToggleCharge={handleToggleCharge}
                        onAmountChange={handleChargeAmountChange}
                      />
                    </StatementItemsSection>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="shrink-0 gap-3 border-t border-border-subtle pt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleCancel}
                disabled={activeMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={activeMutation.isPending || isLoadingItems}
                className="w-full sm:w-auto"
              >
                {activeMutation.isPending
                  ? "Guardando..."
                  : isEdit
                    ? "Guardar cambios"
                    : "Crear resumen"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DateField({
  control,
  name,
  label,
}: {
  control: Control<CreditCardStatementFormValues>;
  name: "closingDate" | "dueDate";
  label: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type="date" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function StatementItemsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border-subtle bg-background/20 p-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function StatementItemList({
  installments,
  charges,
  selectedInstallmentIds,
  selectedKeys,
  amounts,
  currencyCode,
  onToggleInstallment,
  onToggleCharge,
  onAmountChange,
}: {
  installments: CreditCardStatementInstallmentItemDTO[];
  charges: CreditCardStatementChargeItemDTO[];
  selectedInstallmentIds: Set<number>;
  selectedKeys: Set<string>;
  amounts: Record<string, number | undefined>;
  currencyCode: string;
  onToggleInstallment: (id: number) => void;
  onToggleCharge: (key: string) => void;
  onAmountChange: (key: string, amount: number | undefined) => void;
}) {
  const items = [
    ...installments.map((item) => ({ type: "installment" as const, item })),
    ...charges.map((item) => ({ type: "charge" as const, item })),
  ].sort((left, right) => {
    const leftDate =
      left.type === "installment"
        ? left.item.purchase.effectiveDate
        : left.item.subscription.effectiveDate;
    const rightDate =
      right.type === "installment"
        ? right.item.purchase.effectiveDate
        : right.item.subscription.effectiveDate;
    return leftDate.localeCompare(rightDate);
  });

  if (items.length === 0) {
    return <p className="py-5 text-sm text-text-quaternary">No hay items para mostrar.</p>;
  }

  return (
    <div className="divide-y divide-border-subtle">
      {items.map((entry) =>
        entry.type === "installment" ? (
          <InstallmentRow
            key={`installment-${entry.item.id}`}
            item={entry.item}
            selected={selectedInstallmentIds.has(entry.item.id)}
            currencyCode={currencyCode}
            onToggle={onToggleInstallment}
          />
        ) : (
          <ChargeRow
            key={`charge-${getChargeKey(entry.item)}`}
            item={entry.item}
            selected={selectedKeys.has(getChargeKey(entry.item))}
            amount={amounts[getChargeKey(entry.item)] ?? entry.item.amount}
            currencyCode={currencyCode}
            onToggle={onToggleCharge}
            onAmountChange={onAmountChange}
          />
        ),
      )}
    </div>
  );
}

function InstallmentRow({
  item,
  selected,
  currencyCode,
  onToggle,
}: {
  item: CreditCardStatementInstallmentItemDTO;
  selected: boolean;
  currencyCode: string;
  onToggle: (id: number) => void;
}) {
  const handleToggle = () => onToggle(item.id);
  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex w-full items-center gap-3 py-3 text-left"
    >
      <SelectionMark selected={selected} />
      <IconBox icon={item.purchase.category.icon} size="xs" shape="rounded" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-foreground">{item.purchase.description}</span>
        <span className="text-xs text-text-quaternary">
          Cuota {item.installmentNumber} · {item.purchase.category.name} ·{" "}
          {formatDateOnlyLabel(item.purchase.effectiveDate)}
        </span>
      </span>
      <span className="text-sm font-medium text-foreground">
        {formatCurrency(item.amount, item.currencyCode || currencyCode)}
      </span>
    </button>
  );
}

function ChargeRow({
  item,
  selected,
  amount,
  currencyCode,
  onToggle,
  onAmountChange,
}: {
  item: CreditCardStatementChargeItemDTO;
  selected: boolean;
  amount: number | undefined;
  currencyCode: string;
  onToggle: (key: string) => void;
  onAmountChange: (key: string, amount: number | undefined) => void;
}) {
  const key = getChargeKey(item);
  const handleToggle = () => onToggle(key);
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    onAmountChange(key, getNumericInputChangeValue(event));
  return (
    <div className="flex items-center gap-3 py-3">
      <button
        type="button"
        onClick={handleToggle}
        aria-label={selected ? "Quitar cargo" : "Incluir cargo"}
      >
        <SelectionMark selected={selected} />
      </button>
      <IconBox icon={item.subscription.category.icon} size="xs" shape="rounded" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">{item.subscription.description}</p>
        <p className="text-xs text-text-quaternary">
          Cargo {item.chargeNumber} · {item.subscription.category.name} ·{" "}
          {formatDateOnlyLabel(item.subscription.effectiveDate)}
        </p>
      </div>
      <Input
        type="number"
        min="0"
        step="0.01"
        value={getNumericInputValue(amount)}
        onChange={handleAmountChange}
        className="w-28 text-right"
        aria-label={`Monto del cargo ${item.chargeNumber}`}
      />
      <span className="hidden text-xs text-text-quaternary sm:inline">
        {item.currencyCode || currencyCode}
      </span>
    </div>
  );
}

function SelectionMark({ selected }: { selected: boolean }) {
  return (
    <span
      className={`flex size-5 shrink-0 items-center justify-center rounded border ${selected ? "border-sp-blue-400 bg-sp-blue-500 text-white" : "border-border-subtle"}`}
    >
      {selected && <Check className="size-3.5" />}
    </span>
  );
}

function getChargeKey(item: CreditCardStatementChargeItemDTO) {
  return `${item.subscription.id}-${item.chargeNumber}`;
}

function toCreateCharge(
  item: CreditCardStatementChargeItemDTO,
  amounts: Record<string, number | undefined>,
) {
  return {
    subscriptionId: item.subscription.id,
    chargeNumber: item.chargeNumber,
    amount: amounts[getChargeKey(item)] ?? item.amount,
  };
}

function toggleSetValue<T>(current: Set<T>, value: T) {
  const next = new Set(current);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function getDefaultDueDate(from = new Date()): string {
  const date = new Date(from);
  date.setDate(date.getDate() + 15);
  return toDateOnly(date);
}
