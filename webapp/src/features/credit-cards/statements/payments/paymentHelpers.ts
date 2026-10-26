import type {
  CreditCardStatementDetailDTO,
  CreditCardStatementPaymentDTO,
} from "@/api/services/credit-cards/creditCardTypes";
import { formatDateToISO } from "@/utils/dateHelpers";
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
      effectiveDate: payment?.effectiveDate.slice(0, 10) ?? getTodayDate(),
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

function getInstallmentDate(effectiveDate: string, installmentNumber: number) {
  const date = new Date(`${effectiveDate}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + installmentNumber - 1);
  return date.toISOString().slice(0, 10);
}

export function getTodayDate() {
  return formatDateToISO(new Date());
}
