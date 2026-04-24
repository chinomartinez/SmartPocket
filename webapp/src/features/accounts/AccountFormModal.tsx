/**
 * Account Form Modal
 * Modal para crear y editar cuentas con validación dual (client + server)
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAccount, useUpdateAccount } from "@/features/accounts/useAccounts";
import { useCurrencies } from "@/hooks/useCurrencies";
import { useFormErrorHandler } from "@/hooks/useFormErrorHandler";
import { accountSchema, type AccountFormValues } from "./accountSchema";
import type { AccountGetDTO } from "@/api/services/accounts/accountTypes";
import type { ApiError } from "@/api/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorAlert } from "@/components/ErrorAlert";
import { getAccountIcons } from "@/components/iconBoxes/iconMap";

// ============================================================================
// Types
// ============================================================================

interface AccountFormModalProps {
  mode: "create" | "edit";
  account?: AccountGetDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_FORM_VALUES: AccountFormValues = {
  name: "",
  icon: {
    code: "money-bag",
    colorHex: "#3B82F6",
  },
  currencyCode: "",
  balance: 0,
  includeInBalanceGlobal: true,
};

// ============================================================================
// Component
// ============================================================================

export function AccountFormModal({ mode, account, open, onOpenChange }: AccountFormModalProps) {
  // Hooks
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies();
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const activeMutation = mode === "create" ? createMutation : updateMutation;

  // Form setup con sincronización automática via 'values'
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    values:
      mode === "edit" && account
        ? {
            name: account.name,
            icon: account.icon,
            currencyCode: account.currency.code,
            balance: account.balance,
            includeInBalanceGlobal: account.includeInBalanceGlobal,
          }
        : DEFAULT_FORM_VALUES,
  });

  const handleFormError = useFormErrorHandler(form);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      activeMutation.reset();
      form.reset(DEFAULT_FORM_VALUES);
    }
    onOpenChange(isOpen);
  };

  const onSubmit = (data: AccountFormValues) => {
    if (mode === "create") {
      createMutation.mutate(data, {
        onSuccess: () => handleOpenChange(false),
        onError: handleFormError,
      });
    } else if (mode === "edit" && account) {
      updateMutation.mutate(
        { id: account.id, data },
        {
          onSuccess: () => handleOpenChange(false),
          onError: handleFormError,
        },
      );
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  const isSubmitting = activeMutation.isPending;
  const apiError = activeMutation.error as ApiError | null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nueva Cuenta" : "Editar Cuenta"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Errores generales del backend (sin propertyName) */}
            {apiError && <ErrorAlert error={apiError} />}

            {/* Campo: Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Cuenta Personal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Ícono */}
            <FormField
              control={form.control}
              name="icon.code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícono</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-6 gap-2">
                      {getAccountIcons().map((option) => (
                        <button
                          key={option.code}
                          type="button"
                          onClick={() => field.onChange(option.code)}
                          className={`
                            h-12 flex items-center justify-center text-2xl rounded-lg
                            transition-all duration-200 border-2
                            ${
                              field.value === option.code
                                ? "border-sp-blue-500 bg-sp-blue-500/20 scale-110"
                                : "border-slate-700 hover:border-sp-blue-400/50 hover:bg-slate-700/50"
                            }
                          `}
                          title={option.label}
                        >
                          {option.symbol}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Color */}
            <FormField
              control={form.control}
              name="icon.colorHex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={field.value}
                        onChange={field.onChange}
                        className="h-10 w-16 rounded-lg border-2 border-slate-700 bg-transparent cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="#3B82F6"
                        className="flex-1 uppercase"
                      />
                      <div
                        className="h-10 w-10 rounded-lg border-2 border-slate-700"
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Moneda */}
            <FormField
              control={form.control}
              name="currencyCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moneda</FormLabel>
                  <Select
                    key={`currency-${mode}-${account?.id || "new"}`}
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                    disabled={currenciesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una moneda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies?.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.symbol} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Saldo */}
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo {mode === "edit" && "(solo lectura)"}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      readOnly={mode === "edit"}
                      disabled={mode === "edit"}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Incluir en Balance Global */}
            <FormField
              control={form.control}
              name="includeInBalanceGlobal"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-slate-700 p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Incluir en balance global</FormLabel>
                    <p className="text-sm text-slate-400">
                      Esta cuenta se incluirá en el cálculo del balance total
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Guardando..."
                  : mode === "create"
                    ? "Crear Cuenta"
                    : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
