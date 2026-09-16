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
