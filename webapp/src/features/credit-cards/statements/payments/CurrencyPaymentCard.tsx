import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/utils/utils";
import { isPaymentComplete } from "./paymentHelpers";
import type { DraftPayment } from "./paymentTypes";

const PAID_BADGE_CLASSES = "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
const UNPAID_BADGE_CLASSES = "border-amber-500/30 bg-amber-500/10 text-amber-300";

export function CurrencyPaymentCard({
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
  const [areFieldsOpen, setAreFieldsOpen] = useState(false);
  const isPaid = isPaymentComplete(payment);
  const paidAmount =
    payment.amount !== undefined && Number.isFinite(payment.amount) ? payment.amount : 0;
  const pendingAmount = Math.max(payment.includedAmount - paidAmount, 0);
  const hasData = payment.accountId !== undefined || payment.amount !== undefined;
  const fieldsId = `payment-fields-${payment.coveredCurrencyCode}`;
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

      <button
        type="button"
        aria-expanded={areFieldsOpen}
        aria-controls={fieldsId}
        onClick={() => setAreFieldsOpen((current) => !current)}
        className="mt-2 flex w-full items-center justify-between gap-2 border-t border-border-subtle/60 pt-2 text-left text-xs font-medium text-sp-blue-300 transition-colors hover:text-sp-blue-200 focus-visible:ring-2 focus-visible:ring-sp-blue-400 focus-visible:outline-none sm:hidden"
      >
        <span>{areFieldsOpen ? "Ocultar" : isPaid ? "Editar pago" : "Cargar pago"}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 transition-transform", areFieldsOpen && "rotate-180")}
        />
      </button>

      <div
        id={fieldsId}
        className={cn(
          "mt-3 grid gap-3 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)]",
          !areFieldsOpen && "hidden sm:grid",
        )}
      >
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
