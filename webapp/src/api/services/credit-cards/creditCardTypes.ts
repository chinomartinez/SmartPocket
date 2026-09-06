import type { IconDTO } from "../shared/sharedTypes";

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
