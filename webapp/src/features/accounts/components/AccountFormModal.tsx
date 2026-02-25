/**
 * Account Form Modal
 * Modal para crear y editar cuentas con validación dual (client + server)
 */

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAccount, useUpdateAccount } from "@/features/accounts/hooks/useAccounts";
import { useCurrencies } from "@/hooks/useCurrencies";
import { accountSchema, type AccountFormValues } from "../schemas/accountSchema";
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
import { getAllIconOptions, getOrDefaultIconOption } from "../utils/iconHelpers";

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
  const [apiError, setApiError] = useState<ApiError | null>(null);

  // Hooks
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies();
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();

  // Form setup
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  // Pre-cargar datos en modo edición o resetear en modo creación
  useEffect(() => {
    if (mode === "edit" && account) {
      let _icon = {
        code: getOrDefaultIconOption(account.icon.code).code,
        colorHex: account.icon.colorHex,
      };

      form.reset({
        name: account.name,
        icon: _icon,
        currencyCode: account.currency.code,
        balance: account.balance,
        includeInBalanceGlobal: account.includeInBalanceGlobal,
      });
    } else if (mode === "create") {
      form.reset(DEFAULT_FORM_VALUES);
    }
  }, [mode, account, form]);

  // Limpiar errores al abrir/cerrar modal
  useEffect(() => {
    if (open) {
      setApiError(null);
    }
  }, [open]);

  // ============================================================================
  // Helpers
  // ============================================================================

  /**
   * Helper para obtener errores de un campo específico desde el backend
   * Retorna array de strings para soportar múltiples errores por propiedad
   */
  const getFieldErrors = (fieldName: string): string[] => {
    return (
      apiError?.errors?.filter((e) => e.propertyName === fieldName).map((e) => e.message) || []
    );
  };

  // ============================================================================
  // Handlers
  // ============================================================================

  const onSubmit = (data: AccountFormValues) => {
    setApiError(null);

    if (mode === "create") {
      createMutation.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
        onError: (error: ApiError) => {
          setApiError(error);
        },
      });
    } else if (mode === "edit" && account) {
      updateMutation.mutate(
        { id: account.id, data },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
          onError: (error: ApiError) => {
            setApiError(error);
          },
        },
      );
    }
  };

  const handleCancel = () => {
    form.reset();
    setApiError(null);
    onOpenChange(false);
  };

  // ============================================================================
  // Render
  // ============================================================================

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  {/* Errores de zod (client-side) */}
                  <FormMessage />
                  {/* Errores del backend (server-side) - múltiples */}
                  {getFieldErrors("name").map((msg, idx) => (
                    <p key={idx} className="text-sm font-medium text-red-500">
                      {msg}
                    </p>
                  ))}
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
                      {getAllIconOptions().map((option) => (
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
                  {getFieldErrors("icon.code").map((msg, idx) => (
                    <p key={idx} className="text-sm font-medium text-red-500">
                      {msg}
                    </p>
                  ))}
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
                  {getFieldErrors("icon.colorHex").map((msg, idx) => (
                    <p key={idx} className="text-sm font-medium text-red-500">
                      {msg}
                    </p>
                  ))}
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
                  {getFieldErrors("currencyCode").map((msg, idx) => (
                    <p key={idx} className="text-sm font-medium text-red-500">
                      {msg}
                    </p>
                  ))}
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
                  {getFieldErrors("balance").map((msg, idx) => (
                    <p key={idx} className="text-sm font-medium text-red-500">
                      {msg}
                    </p>
                  ))}
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
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
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
