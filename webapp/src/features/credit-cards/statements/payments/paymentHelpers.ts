import type {
  CreditCardStatementDetailDTO,
  CreditCardStatementPaymentDTO,
} from "@/api/services/credit-cards/creditCardTypes";
import { toDateOnlyUtc, todayDateOnly } from "@/utils/dateHelpers";
import type { DraftPayment, StatementDetailItem } from "./paymentTypes";

export function isPaymentComplete(payment: DraftPayment) {
  return (
    payment.accountId !== undefined &&
    payment.amount !== undefined &&
    Number.isFinite(payment.amount) &&
    payment.amount > 0 &&
    payment.effectiveDate !== ""
  );
}

export function createDraftPayments(
  detail: CreditCardStatementDetailDTO,
  payments: CreditCardStatementPaymentDTO[],
): DraftPayment[] {
  return detail.totals.currencySummaries.map((summary) => {
    const payment = payments.find((item) => item.coveredCurrencyCode === summary.currencyCode);

    return {
      id: payment?.id ?? null,
      accountId: payment?.account.id,
      amount: payment?.amount,
      effectiveDate: payment ? payment.effectiveDate : todayDateOnly(),
      coveredCurrencyCode: summary.currencyCode,
      includedAmount: summary.includedAmount,
    };
  });
}

export function getStatementDetailItems(
  detail: CreditCardStatementDetailDTO,
): StatementDetailItem[] {
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

/**
 * Fecha de la cuota N de una compra.
 * Se calcula en UTC a propósito para replicar el AddMonths de EF Core sobre SQLite:
 * el backend normaliza el overflow de fin de mes (31/01 + 1 mes = 03/03), no lo
 * recorta al último día del mes. No cambiar a toDateOnly(): el cálculo debe ser
 * independiente de la zona horaria.
 */
export function getInstallmentDate(effectiveDate: string, installmentNumber: number) {
  const date = new Date(`${effectiveDate}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + installmentNumber - 1);
  return toDateOnlyUtc(date);
}
