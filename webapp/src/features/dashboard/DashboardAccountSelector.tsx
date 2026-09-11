import { IconBox } from "@/components/iconBoxes/IconBox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AccountGetDTO } from "@/api/services/accounts/accountTypes";

interface DashboardAccountSelectorProps {
  accounts: AccountGetDTO[];
  value: number;
  onChange: (accountId: number) => void;
}

export function DashboardAccountSelector({
  accounts,
  value,
  onChange,
}: DashboardAccountSelectorProps) {
  const selectedAccount = accounts.find((account) => account.id === value);

  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          Cuenta seleccionada
        </p>
        <p className="text-sm text-muted-foreground">
          El dashboard muestra solo movimientos de esta cuenta.
        </p>
      </div>

      <Select value={String(value)} onValueChange={(nextValue) => onChange(Number(nextValue))}>
        <SelectTrigger className="w-full sm:w-[280px]">
          <SelectValue>
            {selectedAccount && (
              <span className="flex items-center gap-2">
                <IconBox icon={selectedAccount.icon} size="xs" showBackground={false} />
                <span className="truncate">
                  {selectedAccount.name} ({selectedAccount.currency.code})
                </span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={String(account.id)}>
              <span className="flex items-center gap-2">
                <IconBox icon={account.icon} size="xs" showBackground={false} />
                <span>
                  {account.name} ({account.currency.code})
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
