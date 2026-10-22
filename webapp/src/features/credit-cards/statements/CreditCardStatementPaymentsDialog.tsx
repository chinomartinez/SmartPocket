import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown, Loader2, Trash2, WalletCards } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
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
  CreditCardStatementStatus,
} from "@/api/services/credit-cards/creditCardTypes";
import {
  useCreditCardStatementById,
  useCreditCardStatementPayments,
  useUpdateCreditCardStatementPayments,
} from "@/api/services/credit-cards/useCreditCards";
import type { ApiError } from "@/api/types";
import { formatCurrency } from "@/utils/formatters";
import { formatDateOnly, formatDateToISO } from "@/utils/dateHelpers";
import { cn } from "@/utils/utils";

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

const STATEMENT_STATUS_LABELS: Record<CreditCardStatementStatus, string> = {
  Closed: "Cerrado",
  PartiallyPaid: "Parcialmente pagado",
  Paid: "Pagado",
};

const STATEMENT_STATUS_CLASSES: Record<CreditCardStatementStatus, string> = {
  Closed: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  PartiallyPaid: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  Paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

const PAID_BADGE_CLASSES = "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
const UNPAID_BADGE_CLASSES = "border-amber-500/30 bg-amber-500/10 text-amber-300";

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
  const [removalCurrency, setRemovalCurrency] = useState<string | null>(null);
  const seededForOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      seededForOpen.current = false;
      setDraftPayments([]);
      setValidationError(null);
      setRemovalCurrency(null);
      return;
    }

    if (!seededForOpen.current && detailQuery.data && paymentsQuery.data) {
      setDraftPayments(createDraftPayments(detailQuery.data, paymentsQuery.data));
      setValidationError(null);
      seededForOpen.current = true;
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
  const statement = detailQuery.data;
  const removalDraft = removalCurrency
    ? draftPayments.find((payment) => payment.coveredCurrencyCode === removalCurrency)
    : undefined;
  const removalIsPersisted = Boolean(removalDraft && removalDraft.id !== null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      updateMutation.reset();
      setDraftPayments([]);
      setValidationError(null);
      setRemovalCurrency(null);
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

  const handleConfirmRemove = () => {
    if (!removalCurrency) return;

    const index = draftPayments.findIndex(
      (payment) => payment.coveredCurrencyCode === removalCurrency,
    );

    if (index >= 0) {
      handlePaymentChange(index, { accountId: undefined, amount: undefined });
    }

    setRemovalCurrency(null);
  };

  const handleSave = () => {
    if (!statement) return;

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
        payment.effectiveDate <= statement.closingDate.slice(0, 10) ||
        payment.effectiveDate > today,
    );

    if (invalidDate) {
      setValidationError("La fecha de cada pago debe ser posterior al cierre y no puede ser futura.");
      return;
    }

    updateMutation.mutate(
      {
        statementId,
        creditCardId: statement.creditCardId,
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
      <DialogContent className="modal-form flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] min-h-0 flex-col overflow-hidden p-4 sm:h-auto sm:max-w-6xl sm:p-6">
        <DialogHeader className="gap-3 border-b border-border-subtle pb-4 text-left">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-8 sm:pr-0">
            <div className="min-w-0 space-y-1">
              <DialogTitle className="flex items-center gap-2">
                <WalletCards className="size-5" /> Gestionar pagos
              </DialogTitle>
              <DialogDescription>
                Registrá los pagos personales asociados al resumen. Esto no ejecuta ni verifica un pago
                bancario.
              </DialogDescription>
            </div>
            {statement && (
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={STATEMENT_STATUS_CLASSES[statement.status]}
                  title="Estado guardado. Se actualiza al guardar."
                >
                  {STATEMENT_STATUS_LABELS[statement.status]}
                </Badge>
                <span className="inline-flex items-center gap-1.5 text-xs text-text-quaternary">
                  <CalendarDays className="size-3.5 shrink-0" />
                  Vence {formatDateOnly(statement.dueDate, { day: "2-digit", month: "short" })}
                </span>
              </div>
            )}
          </div>
        </DialogHeader>

        {apiError && <ErrorAlert error={apiError} />}
        {queryError && <ErrorAlert error={queryError} />}
        {validationError && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {validationError}
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-text-quaternary">
              <Loader2 className="size-4 animate-spin" /> Cargando detalle del resumen...
            </div>
          ) : statement ? (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
              <PaymentDraftsSection
                accounts={accounts}
                draftPayments={draftPayments}
                onPaymentChange={handlePaymentChange}
                onRemovePayment={setRemovalCurrency}
              />
              <StatementDetailPanel items={detailItems} />
            </div>
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

        <DeleteConfirmationDialog
          open={removalCurrency !== null}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setRemovalCurrency(null);
          }}
          onConfirm={handleConfirmRemove}
          itemName={removalCurrency ?? ""}
          itemType="pago"
          title={removalCurrency ? `¿Quitar pago en ${removalCurrency}?` : "¿Quitar pago?"}
          description={
            removalCurrency
              ? removalIsPersisted
                ? `El pago de ${removalCurrency} se eliminará del resumen al guardar los cambios.`
                : `Se descartará el pago de ${removalCurrency} que estás cargando. Todavía no fue guardado.`
              : ""
          }
        />
      </DialogContent>
    </Dialog>
  );
}

function PaymentDraftsSection({
  accounts,
  draftPayments,
  onPaymentChange,
  onRemovePayment,
}: {
  accounts: AccountGetDTO[];
  draftPayments: DraftPayment[];
  onPaymentChange: (index: number, changes: Partial<DraftPayment>) => void;
  onRemovePayment: (currencyCode: string) => void;
}) {
  return (
    <section aria-labelledby="payment-drafts-title" className="space-y-3">
      <div>
        <h3 id="payment-drafts-title" className="font-semibold text-foreground">
          Pagos por moneda
        </h3>
        <p className="text-sm text-text-quaternary">
          Un pago por moneda. El importe es el total pagado, no se acumula.
        </p>
      </div>
      <div className="space-y-3">
        {draftPayments.map((payment, index) => (
          <CurrencyPaymentCard
            key={payment.coveredCurrencyCode}
            payment={payment}
            accounts={accounts}
            onChange={(changes) => onPaymentChange(index, changes)}
            onRemove={() => onRemovePayment(payment.coveredCurrencyCode)}
          />
        ))}
      </div>
    </section>
  );
}

function CurrencyPaymentCard({
  payment,
  accounts,
  onChange,
  onRemove,
}: {
  payment: DraftPayment;
  accounts: AccountGetDTO[];
  onChange: (changes: Partial<DraftPayment>) => void;
  onRemove: () => void;
}) {
  const isPaid = isPaymentComplete(payment);
  const paidAmount =
    payment.amount !== undefined && Number.isFinite(payment.amount) ? payment.amount : 0;
  const pendingAmount = Math.max(payment.includedAmount - paidAmount, 0);
  const hasData = payment.accountId !== undefined || payment.amount !== undefined;
  const accountFieldId = `payment-account-${payment.coveredCurrencyCode}`;
  const amountFieldId = `payment-amount-${payment.coveredCurrencyCode}`;
  const dateFieldId = `payment-date-${payment.coveredCurrencyCode}`;

  return (
    <article className="rounded-lg border border-border-subtle bg-secondary/30 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{payment.coveredCurrencyCode}</h3>
          <Badge variant="outline" className={isPaid ? PAID_BADGE_CLASSES : UNPAID_BADGE_CLASSES}>
            {isPaid ? "Pagado" : "Sin pago"}
          </Badge>
        </div>
        {hasData && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Quitar pago en ${payment.coveredCurrencyCode}`}
            className="ml-auto text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={onRemove}
          >
            <Trash2 className="size-4" />
            Quitar pago
          </Button>
        )}
      </div>

      <dl className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs">
        <div className="flex items-baseline gap-1.5">
          <dt className="text-text-quaternary">Incluido</dt>
          <dd className="font-medium tabular-nums text-foreground">
            {formatCurrency(payment.includedAmount, payment.coveredCurrencyCode)}
          </dd>
        </div>
        <div className="flex items-baseline gap-1.5">
          <dt className="text-text-quaternary">Pagado</dt>
          <dd
            className={cn(
              "font-medium tabular-nums",
              isPaid ? "text-emerald-400" : "text-foreground",
            )}
          >
            {formatCurrency(paidAmount, payment.coveredCurrencyCode)}
          </dd>
        </div>
        <div className="flex items-baseline gap-1.5">
          <dt className="text-text-quaternary">Pendiente</dt>
          <dd
            className={cn(
              "font-medium tabular-nums",
              pendingAmount > 0 ? "text-amber-300" : "text-foreground",
            )}
          >
            {formatCurrency(pendingAmount, payment.coveredCurrencyCode)}
          </dd>
        </div>
      </dl>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-1">
          <Label htmlFor={accountFieldId} className="text-xs font-normal text-text-quaternary">
            Cuenta
          </Label>
          <Select
            value={payment.accountId?.toString()}
            onValueChange={(value) => onChange({ accountId: Number(value) })}
          >
            <SelectTrigger id={accountFieldId} className="w-full">
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
        </div>
        <div className="space-y-1">
          <Label htmlFor={amountFieldId} className="text-xs font-normal text-text-quaternary">
            Importe
          </Label>
          <Input
            id={amountFieldId}
            type="number"
            min="0"
            step="0.01"
            value={payment.amount ?? ""}
            onChange={(event) =>
              onChange({
                amount: event.target.value === "" ? undefined : event.target.valueAsNumber,
              })
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={dateFieldId} className="text-xs font-normal text-text-quaternary">
            Fecha
          </Label>
          <Input
            id={dateFieldId}
            type="date"
            value={payment.effectiveDate}
            onChange={(event) => onChange({ effectiveDate: event.target.value })}
          />
        </div>
      </div>
    </article>
  );
}

function StatementDetailPanel({ items }: { items: StatementDetailItem[] }) {
  const [isOpen, setIsOpen] = useState(true);
  const hasMultipleCurrencies =
    new Set(items.map((item) => item.currencyCode)).size > 1;
  const itemsLabel = items.length === 1 ? "1 item incluido" : `${items.length} items incluidos`;

  return (
    <section
      aria-labelledby="statement-detail-title"
      className="rounded-lg border border-border-subtle"
    >
      <h3 id="statement-detail-title">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="statement-detail-body"
          onClick={() => setIsOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-hover-muted focus-visible:ring-2 focus-visible:ring-sp-blue-400 focus-visible:outline-none"
        >
          <span className="min-w-0">
            <span className="block font-semibold text-foreground">Detalle del resumen</span>
            <span className="block text-xs font-normal text-text-quaternary">{itemsLabel}</span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-text-quaternary transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </button>
      </h3>

      <div id="statement-detail-body" hidden={!isOpen}>
        {items.length === 0 ? (
          <p className="border-t border-border-subtle px-4 py-3 text-sm text-text-quaternary">
            Sin items incluidos.
          </p>
        ) : (
          <ul className="divide-y divide-border-subtle/70 border-t border-border-subtle">
            {items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.description}
                  </p>
                  <p className="truncate text-xs text-text-quaternary">
                    {item.typeLabel} ·{" "}
                    {formatDateOnly(item.effectiveDate, { day: "2-digit", month: "short" })}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm tabular-nums whitespace-nowrap text-foreground">
                    {formatCurrency(item.amount, item.currencyCode)}
                  </p>
                  {hasMultipleCurrencies && (
                    <p className="text-xs text-text-quaternary">{item.currencyCode}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function isPaymentComplete(payment: DraftPayment) {
  return (
    payment.accountId !== undefined &&
    payment.amount !== undefined &&
    Number.isFinite(payment.amount) &&
    payment.amount > 0 &&
    payment.effectiveDate !== ""
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
  return formatDateToISO(new Date());
}
