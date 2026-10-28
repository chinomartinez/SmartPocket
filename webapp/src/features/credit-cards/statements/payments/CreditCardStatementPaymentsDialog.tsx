import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Loader2, WalletCards } from "lucide-react";
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
import { useAccounts } from "@/api/services/accounts/useAccounts";
import type { CreditCardStatementStatus } from "@/api/services/credit-cards/creditCardTypes";
import {
  useCreditCardStatementById,
  useCreditCardStatementPayments,
  useUpdateCreditCardStatementPayments,
} from "@/api/services/credit-cards/useCreditCards";
import type { ApiError } from "@/api/types";
import { compareDateOnly, formatDateOnlyLabel, todayDateOnly } from "@/utils/dateHelpers";
import { PaymentDraftsSection } from "./PaymentDraftsSection";
import { StatementDetailPanel } from "./StatementDetailPanel";
import { createDraftPayments, getStatementDetailItems } from "./paymentHelpers";
import type { DraftPayment } from "./paymentTypes";

interface CreditCardStatementPaymentsDialogProps {
  statementId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

  const handlePaymentChange = (currencyCode: string, changes: Partial<DraftPayment>) => {
    setDraftPayments((current) =>
      current.map((payment) =>
        payment.coveredCurrencyCode === currencyCode ? { ...payment, ...changes } : payment,
      ),
    );
    setValidationError(null);
  };

  const handleConfirmRemove = () => {
    if (!removalCurrency) return;

    handlePaymentChange(removalCurrency, { accountId: undefined, amount: undefined });
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

    const today = todayDateOnly();
    const invalidDate = filledPayments.find(
      (payment) =>
        compareDateOnly(payment.effectiveDate, statement.closingDate) <= 0 ||
        compareDateOnly(payment.effectiveDate, today) > 0,
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
          <div className="flex flex-wrap items-end justify-between gap-3 pr-8 sm:pr-10">
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
                  Vence {formatDateOnlyLabel(statement.dueDate, { day: "2-digit", month: "short" })}
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
