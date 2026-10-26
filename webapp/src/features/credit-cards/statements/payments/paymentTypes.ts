export interface DraftPayment {
  id: number | null;
  accountId: number | undefined;
  amount: number | undefined;
  effectiveDate: string;
  coveredCurrencyCode: string;
  includedAmount: number;
}

export interface StatementDetailItem {
  id: string;
  description: string;
  typeLabel: string;
  effectiveDate: string;
  currencyCode: string;
  amount: number;
}
