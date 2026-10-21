import { useEffect, useMemo, useState } from "react";
import { Loader2, WalletCards } from "lucide-react";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AccountGetDTO } from "@/api/services/accounts/accountTypes";
import { useAccounts } from "@/api/services/accounts/useAccounts";
import type {
  CreditCardStatementDetailDTO,
  CreditCardStatementPaymentDTO,
} from "@/api/services/credit-cards/creditCardTypes";
import {
  useCreditCardStatementById,
  useCreditCardStatementPayments,
  useUpdateCreditCardStatementPayments,
} from "@/api/services/credit-cards/useCreditCards";
import type { ApiError } from "@/api/types";
import { formatCurrency } from "@/utils/formatters";
import { formatDateOnly } from "@/utils/dateHelpers";

interface CreditCardStatementPaymentsDialogProps {
  statementId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DraftPayment {
  id: number | null;
  accountId: number | undefined;
  amount: number | undefined;
  effectiveDate: string;
  coveredCurrencyCode: string;
  includedAmount: number;
}

interface StatementDetailItem {
  id: string;
  description: string;
  typeLabel: string;
  effectiveDate: string;
  currencyCode: string;
  amount: number;
}

export function CreditCardStatementPaymentsDialog({
  statementId,
  open,
  onOpenChange,
}: CreditCardStatementPaymentsDialogProps) {
  const detailQuery = useCreditCardStatementById(statementId, open);
  const paymentsQuery = useCreditCardStatementPayments(statementId, open);
  const accountsQuery = useAccounts();
  const updateMutation = useUpdateCreditCardStatementPayments();
  const [draftPayments, setDraftPayments] = useState<DraftPayment[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setDraftPayments([]);
      setValidationError(null);
      return;
    }

    if (detailQuery.data && paymentsQuery.data) {
      setDraftPayments(createDraftPayments(detailQuery.data, paymentsQuery.data));
      setValidationError(null);
    }
  }, [detailQuery.data, open, paymentsQuery.data]);

  const detailItems = useMemo(
    () => (detailQuery.data ? getStatementDetailItems(detailQuery.data) : []),
    [detailQuery.data],
  );

  const apiError = updateMutation.error as ApiError | null;
  const isLoading = detailQuery.isLoading || paymentsQuery.isLoading || accountsQuery.isLoading;
  const queryError = detailQuery.error ?? paymentsQuery.error ?? accountsQuery.error;
  const accounts = accountsQuery.data ?? [];
  const currencySummaries = detailQuery.data?.totals.currencySummaries ?? [];

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      updateMutation.reset();
      setDraftPayments([]);
      setValidationError(null);
    }

    onOpenChange(nextOpen);
  };

  const handlePaymentChange = (index: number, changes: Partial<DraftPayment>) => {
    setDraftPayments((current) =>
      current.map((payment, paymentIndex) =>
        paymentIndex === index ? { ...payment, ...changes } : payment,
      ),
    );
    setValidationError(null);
  };

  const handleSave = () => {
    if (!detailQuery.data) return;

    const filledPayments = draftPayments.filter(
      (payment) => payment.accountId !== undefined || payment.amount !== undefined,
    );
    const incompletePayment = filledPayments.find(
      (payment) =>
        payment.accountId === undefined ||
        payment.amount === undefined ||
        !Number.isFinite(payment.amount) ||
        payment.amount <= 0 ||
        !payment.effectiveDate,
    );

    if (incompletePayment) {
      setValidationError("Completá cuenta, importe y fecha para cada pago iniciado.");
      return;
    }

    const today = getTodayDate();
    const invalidDate = filledPayments.find(
      (payment) =>
        payment.effectiveDate <= detailQuery.data.closingDate.slice(0, 10) ||
        payment.effectiveDate > today,
    );

    if (invalidDate) {
      setValidationError("La fecha de cada pago debe ser posterior al cierre y no puede ser futura.");
      return;
    }

    updateMutation.mutate(
      {
        statementId,
        creditCardId: detailQuery.data.creditCardId,
        data: {
          payments: filledPayments.map((payment) => ({
            id: payment.id,
            accountId: payment.accountId!,
            amount: payment.amount!,
            effectiveDate: payment.effectiveDate,
            coveredCurrencyCode: payment.coveredCurrencyCode,
          })),
        },
      },
      {
        onSuccess: () => handleOpenChange(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="!flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] min-h-0 flex-col overflow-hidden sm:max-w-6xl">
        <DialogHeader className="pb-4 border-b border-border-subtle">
          <DialogTitle className="flex items-center gap-2">
            <WalletCards className="size-5" /> Gestionar pagos
          </DialogTitle>
          <DialogDescription>
            Registrá los pagos personales asociados al resumen. Esto no ejecuta ni verifica un pago bancario.
          </DialogDescription>
        </DialogHeader>

        {apiError && <ErrorAlert error={apiError} />}
        {queryError && <ErrorAlert error={queryError} />}
        {validationError && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {validationError}
          </p>
        )}

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-text-quaternary">
              <Loader2 className="size-4 animate-spin" /> Cargando detalle del resumen...
            </div>
          ) : detailQuery.data ? (
            <>
              <StatementItemsTable
                items={detailItems}
                currencyCodes={currencySummaries.map((summary) => summary.currencyCode)}
              />
              <PaymentDraftList
                accounts={accounts}
                draftPayments={draftPayments}
                onPaymentChange={handlePaymentChange}
              />
            </>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 gap-3 border-t border-border-subtle pt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => handleOpenChange(false)}
            disabled={updateMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={handleSave}
            disabled={isLoading || updateMutation.isPending}
          >
            {updateMutation.isPending ? "Guardando..." : "Guardar pagos"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatementItemsTable({
  items,
  currencyCodes,
}: {
  items: StatementDetailItem[];
  currencyCodes: string[];
}) {
  return (
    <section aria-labelledby="statement-items-title" className="space-y-3">
      <div>
        <h3 id="statement-items-title" className="font-semibold text-foreground">
          Detalle del resumen
        </h3>
        <p className="text-sm text-text-quaternary">Items incluidos, ordenados por fecha efectiva.</p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border-subtle">
        <table className="min-w-[640px] w-full text-left text-sm">
          <thead className="bg-secondary text-xs text-text-quaternary">
            <tr>
              <th className="sticky left-0 z-10 min-w-52 bg-secondary px-3 py-2">Item</th>
              <th className="whitespace-nowrap px-3 py-2">Fecha</th>
              {currencyCodes.map((currencyCode) => (
                <th key={currencyCode} className="whitespace-nowrap px-3 py-2 text-right">
                  {currencyCode}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/70">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="sticky left-0 bg-background px-3 py-2">
                  <p className="max-w-64 truncate font-medium text-foreground">{item.description}</p>
                  <p className="text-xs text-text-quaternary">{item.typeLabel}</p>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-text-quaternary">
                  {formatDateOnly(item.effectiveDate, { day: "2-digit", month: "short" })}
                </td>
                {currencyCodes.map((currencyCode) => (
                  <td key={currencyCode} className="whitespace-nowrap px-3 py-2 text-right text-foreground">
                    {item.currencyCode === currencyCode
                      ? formatCurrency(item.amount, currencyCode)
                      : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PaymentDraftList({
  accounts,
  draftPayments,
  onPaymentChange,
}: {
  accounts: AccountGetDTO[];
  draftPayments: DraftPayment[];
  onPaymentChange: (index: number, changes: Partial<DraftPayment>) => void;
}) {
  return (
    <section aria-labelledby="payment-draft-title" className="space-y-3">
      <div>
        <h3 id="payment-draft-title" className="font-semibold text-foreground">
          Pagos por moneda cubierta
        </h3>
        <p className="text-sm text-text-quaternary">
          Una fila vacía significa que esa moneda todavía no fue pagada.
        </p>
      </div>
      <div className="space-y-3">
        {draftPayments.map((payment, index) => (
          <div
            key={payment.coveredCurrencyCode}
            className="grid gap-3 rounded-lg border border-border-subtle bg-secondary/30 p-3 md:grid-cols-[1fr_1.4fr_1fr_1fr] md:items-end"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{payment.coveredCurrencyCode}</p>
              <p className="text-xs text-text-quaternary">
                Incluido: {formatCurrency(payment.includedAmount, payment.coveredCurrencyCode)}
              </p>
            </div>
            <label className="space-y-1 text-xs text-text-quaternary">
              Cuenta
              <Select
                value={payment.accountId?.toString()}
                onValueChange={(value) => onPaymentChange(index, { accountId: Number(value) })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name} · {account.currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-1 text-xs text-text-quaternary">
              Importe real debitado
              <Input
                type="number"
                min="0"
                step="0.01"
                value={payment.amount ?? ""}
                onChange={(event) =>
                  onPaymentChange(index, {
                    amount: event.target.value === "" ? undefined : event.target.valueAsNumber,
                  })
                }
              />
            </label>
            <label className="space-y-1 text-xs text-text-quaternary">
              Fecha del pago
              <Input
                type="date"
                value={payment.effectiveDate}
                onChange={(event) => onPaymentChange(index, { effectiveDate: event.target.value })}
              />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}

function createDraftPayments(
  detail: CreditCardStatementDetailDTO,
  payments: CreditCardStatementPaymentDTO[],
): DraftPayment[] {
  return detail.totals.currencySummaries.map((summary) => {
    const payment = payments.find((item) => item.coveredCurrencyCode === summary.currencyCode);

    return {
      id: payment?.id ?? null,
      accountId: payment?.account.id,
      amount: payment?.amount,
      effectiveDate: payment?.effectiveDate.slice(0, 10) ?? getTodayDate(),
      coveredCurrencyCode: summary.currencyCode,
      includedAmount: summary.includedAmount,
    };
  });
}

function getStatementDetailItems(detail: CreditCardStatementDetailDTO): StatementDetailItem[] {
  return [
    ...detail.includedInstallmentItems.map((item) => ({
      id: `installment-${item.id}`,
      description: item.purchase.description,
      typeLabel: `Cuota ${item.installmentNumber}`,
      effectiveDate: getInstallmentDate(item.purchase.effectiveDate, item.installmentNumber),
      currencyCode: item.currencyCode,
      amount: item.amount,
    })),
    ...detail.includedChargeItems.map((item) => ({
      id: `charge-${item.id ?? `${item.subscription.id}-${item.chargeNumber}`}`,
      description: item.subscription.description,
      typeLabel: `Cargo ${item.chargeNumber}`,
      effectiveDate: item.subscription.effectiveDate,
      currencyCode: item.currencyCode,
      amount: item.amount,
    })),
  ].sort((first, second) => first.effectiveDate.localeCompare(second.effectiveDate));
}

function getInstallmentDate(effectiveDate: string, installmentNumber: number) {
  const date = new Date(`${effectiveDate}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + installmentNumber - 1);
  return date.toISOString().slice(0, 10);
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}
