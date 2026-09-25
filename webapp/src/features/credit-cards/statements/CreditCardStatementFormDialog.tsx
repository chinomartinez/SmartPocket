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
import { formatDateOnly } from "@/utils/dateHelpers";
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

const EMPTY_VALUES: CreditCardStatementFormValues = {
  description: "",
  closingDate: new Date().toISOString().slice(0, 10),
  dueDate: getDefaultDueDate(),
};

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
          closingDate: statement.closingDate.slice(0, 10),
          dueDate: statement.dueDate.slice(0, 10),
        }
      : EMPTY_VALUES,
  });

  const closingDate = form.watch("closingDate");
  const suggestionsQuery = useCreditCardStatementSuggestions(cardId, closingDate, open);
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
  const [chargeAmounts, setChargeAmounts] = useState<Record<string, number>>({});
  const apiError = activeMutation.error as ApiError | null;
  const handleFormError = useFormErrorHandler(form);
  const isLoadingItems = detailQuery.isLoading || suggestionsQuery.isLoading;

  useEffect(() => {
    if (!open || !itemsSource) return;
    setSelectedInstallmentIds(
      new Set(
        isEdit
          ? includedInstallments.map((item) => item.id)
          : suggestedInstallments.map((item) => item.id),
      ),
    );
    setSelectedChargeKeys(new Set(charges.map(getChargeKey)));
    setChargeAmounts(Object.fromEntries(charges.map((item) => [getChargeKey(item), item.amount])));
  }, [charges, includedInstallments, isEdit, itemsSource, open, suggestedInstallments]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      activeMutation.reset();
      form.reset(EMPTY_VALUES);
      setSelectedInstallmentIds(new Set());
      setSelectedChargeKeys(new Set());
      setChargeAmounts({});
    }
    onOpenChange(nextOpen);
  };

  const handleToggleInstallment = (id: number) => {
    setSelectedInstallmentIds((current) => toggleSetValue(current, id));
  };

  const handleToggleCharge = (key: string) => {
    setSelectedChargeKeys((current) => toggleSetValue(current, key));
  };

  const handleChargeAmountChange = (key: string, amount: number) => {
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
      <DialogContent className="!flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] min-h-0 flex-col overflow-hidden sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:max-w-2xl">
        <DialogHeader>
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
              <div className="rounded-xl border border-border-subtle bg-surface-container-low/40 p-3">
                {isLoadingItems ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-text-quaternary">
                    <Loader2 className="size-4 animate-spin" /> Buscando sugerencias...
                  </div>
                ) : (
                  <>
                    <InstallmentGroup
                      installments={installments}
                      selectedIds={selectedInstallmentIds}
                      currencyCode={currencyCode}
                      onToggle={handleToggleInstallment}
                    />
                    <ChargeGroup
                      charges={charges}
                      selectedKeys={selectedChargeKeys}
                      amounts={chargeAmounts}
                      currencyCode={currencyCode}
                      onToggle={handleToggleCharge}
                      onAmountChange={handleChargeAmountChange}
                    />
                  </>
                )}
              </div>
            </div>
            <DialogFooter className="shrink-0 border-t border-border-subtle pt-4 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleCancel}
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

function InstallmentGroup({
  installments,
  selectedIds,
  currencyCode,
  onToggle,
}: {
  installments: CreditCardStatementInstallmentItemDTO[];
  selectedIds: Set<number>;
  currencyCode: string;
  onToggle: (id: number) => void;
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-foreground">Cuotas</h3>
      {installments.length === 0 ? (
        <p className="py-5 text-sm text-text-quaternary">
          No hay cuotas sugeridas para este cierre.
        </p>
      ) : (
        <div className="mt-2 divide-y divide-border-subtle">
          {installments.map((item) => (
            <InstallmentRow
              key={item.id}
              item={item}
              selected={selectedIds.has(item.id)}
              currencyCode={currencyCode}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </section>
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
          {formatDateOnly(item.purchase.effectiveDate)}
        </span>
      </span>
      <span className="text-sm font-medium text-foreground">
        {formatCurrency(item.amount, item.currencyCode || currencyCode)}
      </span>
    </button>
  );
}

function ChargeGroup({
  charges,
  selectedKeys,
  amounts,
  currencyCode,
  onToggle,
  onAmountChange,
}: {
  charges: CreditCardStatementChargeItemDTO[];
  selectedKeys: Set<string>;
  amounts: Record<string, number>;
  currencyCode: string;
  onToggle: (key: string) => void;
  onAmountChange: (key: string, amount: number) => void;
}) {
  return (
    <section className="mt-5 border-t border-border-subtle pt-4">
      <h3 className="text-sm font-semibold text-foreground">Cargos de suscripciones</h3>
      {charges.length === 0 ? (
        <p className="py-5 text-sm text-text-quaternary">
          No hay cargos sugeridos para este cierre.
        </p>
      ) : (
        <div className="mt-2 divide-y divide-border-subtle">
          {charges.map((item) => (
            <ChargeRow
              key={getChargeKey(item)}
              item={item}
              selected={selectedKeys.has(getChargeKey(item))}
              amount={amounts[getChargeKey(item)] ?? item.amount}
              currencyCode={currencyCode}
              onToggle={onToggle}
              onAmountChange={onAmountChange}
            />
          ))}
        </div>
      )}
    </section>
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
  amount: number;
  currencyCode: string;
  onToggle: (key: string) => void;
  onAmountChange: (key: string, amount: number) => void;
}) {
  const key = getChargeKey(item);
  const handleToggle = () => onToggle(key);
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    onAmountChange(key, Number(event.target.value));
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
          {formatDateOnly(item.subscription.effectiveDate)}
        </p>
      </div>
      <Input
        type="number"
        min="0"
        step="0.01"
        value={amount}
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

function toCreateCharge(item: CreditCardStatementChargeItemDTO, amounts: Record<string, number>) {
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

function getDefaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}
