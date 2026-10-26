import type { AccountGetDTO } from "@/api/services/accounts/accountTypes";
import { CurrencyPaymentCard } from "./CurrencyPaymentCard";
import type { DraftPayment } from "./paymentTypes";

export function PaymentDraftsSection({
  accounts,
  draftPayments,
  onPaymentChange,
  onRemovePayment,
}: {
  accounts: AccountGetDTO[];
  draftPayments: DraftPayment[];
  onPaymentChange: (currencyCode: string, changes: Partial<DraftPayment>) => void;
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
        {draftPayments.map((payment) => (
          <CurrencyPaymentCard
            key={payment.coveredCurrencyCode}
            payment={payment}
            accounts={accounts}
            onChange={(changes) => onPaymentChange(payment.coveredCurrencyCode, changes)}
            onRemove={() => onRemovePayment(payment.coveredCurrencyCode)}
          />
        ))}
      </div>
    </section>
  );
}
