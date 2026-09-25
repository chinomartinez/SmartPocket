import type { IconDTO } from "../shared/sharedTypes";
import type { PagedListResponse } from "../shared/sharedTypes";
import type { MoneyDTO } from "../transactions/transactionTypes";

export interface DayRangeDTO {
  startDay: number;
  endDay: number;
}

export interface CreditCardListItemDTO {
  id: number;
  name: string;
  icon: IconDTO;
  currencyCode: string;
  creditLimit: number;
  statementClosingRange: DayRangeDTO;
  paymentDueRange: DayRangeDTO;
}

export interface CreditCardCreateCommand {
  name: string;
  icon: IconDTO;
  currencyCode: string;
  creditLimit: number;
  statementClosingRange: DayRangeDTO;
  paymentDueRange: DayRangeDTO;
}

export interface CreditCardOverviewDTO {
  creditCardId: number;
  currencyCode: string;
  creditLimit: number;
  pendingAmount: number;
  estimatedAvailableAmount: number;
  pendingInstallmentsCount: number;
  unpaidStatementsCount: number;
  isEstimate: boolean;
}

export type CreditCardActivityType = "Purchase" | "Subscription";

export type CreditCardActivityStatus =
  | "InProgress"
  | "Paid"
  | "Finished"
  | "Active"
  | "Cancelled";

export interface CreditCardActivityListItemDTO {
  id: number;
  type: CreditCardActivityType;
  description: string;
  category: {
    id: number;
    name: string;
    icon: IconDTO;
  };
  amount: number;
  currencyCode: string;
  effectiveDate: string;
  status: CreditCardActivityStatus;
  installmentsCount: number | null;
  installmentsPaidCount: number | null;
  chargeCount: number | null;
}

export interface CreditCardActivityFilters {
  page: number;
  pageSize: number;
  type?: CreditCardActivityType;
  search?: string;
}

export type CreditCardActivityPage = PagedListResponse<CreditCardActivityListItemDTO>;

export type CreditCardStatementStatus = "Closed" | "Paid";

export interface CreditCardStatementListItemDTO {
  id: number;
  creditCardId: number;
  description: string;
  closingDate: string;
  dueDate: string;
  status: CreditCardStatementStatus;
  totalItemsInCardCurrency: number;
  totalItemsInUsd: number | null;
  installmentsCount: number;
  chargesCount: number;
}

export interface CreditCardStatementCategoryDTO {
  id: number;
  name: string;
  icon: IconDTO;
}

export interface CreditCardStatementPurchaseDTO {
  id: number;
  description: string;
  effectiveDate: string;
  category: CreditCardStatementCategoryDTO;
}

export interface CreditCardStatementSubscriptionDTO {
  id: number;
  description: string;
  effectiveDate: string;
  category: CreditCardStatementCategoryDTO;
}

export interface CreditCardStatementInstallmentItemDTO {
  id: number;
  amount: number;
  currencyCode: string;
  installmentNumber: number;
  purchase: CreditCardStatementPurchaseDTO;
}

export interface CreditCardStatementChargeItemDTO {
  id: number | null;
  amount: number;
  currencyCode: string;
  chargeNumber: number;
  subscription: CreditCardStatementSubscriptionDTO;
}

export interface CreditCardStatementSuggestionsDTO {
  suggestedInstallmentItems: CreditCardStatementInstallmentItemDTO[];
  suggestedChargeItems: CreditCardStatementChargeItemDTO[];
}

export interface CreditCardStatementTotalsDTO {
  totalItemsInCardCurrency: number;
  totalItemsInUsd: number | null;
  totalPaidInCardCurrency: number | null;
  totalPaidInUsd: number | null;
}

export interface CreditCardStatementDetailDTO extends CreditCardStatementListItemDTO {
  includedInstallmentItems: CreditCardStatementInstallmentItemDTO[];
  includedChargeItems: CreditCardStatementChargeItemDTO[];
  totals: CreditCardStatementTotalsDTO;
}

export interface CreditCardStatementListRequest {
  creditCardId: number;
  page: number;
  pageSize: number;
}

export interface CreditCardStatementCreateCommand {
  creditCardId: number;
  description: string;
  closingDate: string;
  dueDate: string;
  installmentIds: number[];
  subscriptionCharges: CreditCardStatementChargeCreateCommand[];
}

export interface CreditCardStatementChargeCreateCommand {
  subscriptionId: number;
  chargeNumber: number;
  amount: number;
}

export interface CreditCardStatementUpdateCommand {
  creditCardId: number;
  description: string;
  closingDate: string;
  dueDate: string;
  installmentIds: number[];
  subsChargesForUpdate: CreditCardStatementChargeUpdateCommand[];
  subsChargesForCreate: CreditCardStatementChargeCreateCommand[];
}

export interface CreditCardStatementChargeUpdateCommand {
  id: number;
  chargeNumber: number;
  amount: number;
}

export type CreditCardStatementPage = PagedListResponse<CreditCardStatementListItemDTO>;

export interface CreditCardPurchaseCommand {
  creditCardId: number;
  categoryId: number;
  description: string;
  effectiveDate: string;
  purchaseAmount: MoneyDTO;
  installments: number;
}

export interface CreditCardSubscriptionCommand {
  creditCardId: number;
  categoryId: number;
  description: string;
  effectiveDate: string;
  subscriptionAmount: MoneyDTO;
}
