/**
 * Transaction Form Modal
 * Modal para crear y editar transacciones con validación dual (client + server)
 */

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateTransaction, useUpdateTransaction } from "./useTransactions";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { transactionSchema, type TransactionFormValues } from "./transactionSchema";
import type { TransactionGetByIdDTO } from "@/api/services/transactions/transactionTypes";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Calendar } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface TransactionFormModalProps {
  mode: "create" | "edit";
  transaction?: TransactionGetByIdDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_FORM_VALUES: TransactionFormValues = {
  isIncome: false, // Por defecto: gasto
  accountId: 0,
  categoryId: 0,
  amount: 0,
  currencyCode: "",
  effectiveDate: new Date().toISOString().split("T")[0], // Fecha de hoy en formato YYYY-MM-DD
  description: "",
  tags: [],
};

// ============================================================================
// Component
// ============================================================================

export function TransactionFormModal({
  mode,
  transaction,
  open,
  onOpenChange,
}: TransactionFormModalProps) {
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [selectedType, setSelectedType] = useState<boolean>(false); // false=gasto, true=ingreso

  // Hooks
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: categories, isLoading: categoriesLoading } = useCategories(selectedType);
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  // Form setup
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  // Observar cambios en accountId para actualizar currencyCode automáticamente
  const watchedAccountId = form.watch("accountId");
  useEffect(() => {
    if (watchedAccountId && accounts) {
      const selectedAccount = accounts.find((acc) => acc.id === watchedAccountId);
      if (selectedAccount) {
        form.setValue("currencyCode", selectedAccount.currency.code);
      }
    }
  }, [watchedAccountId, accounts, form]);

  // Pre-cargar datos en modo edición o resetear en modo creación
  useEffect(() => {
    if (mode === "edit" && transaction) {
      setSelectedType(transaction.isIncome);
      form.reset({
        isIncome: transaction.isIncome,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        amount: transaction.accountMoney.amount,
        currencyCode: transaction.accountMoney.currencyCode,
        effectiveDate: transaction.effectiveDate.split("T")[0], // Extraer solo fecha YYYY-MM-DD
        description: transaction.description || "",
        tags: [],
      });
    } else if (mode === "create") {
      form.reset(DEFAULT_FORM_VALUES);
      setSelectedType(false);
    }
  }, [mode, transaction, form]);

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
   */
  const getFieldErrors = (fieldName: string): string[] => {
    return (
      apiError?.errors?.filter((e) => e.propertyName === fieldName).map((e) => e.message) || []
    );
  };

  // ============================================================================
  // Handlers
  // ============================================================================

  const onSubmit = (data: TransactionFormValues) => {
    setApiError(null);

    // Construir payload alineado con TransactionCreateCommand del backend
    const payload = {
      accountId: data.accountId,
      categoryId: data.categoryId,
      accountMoney: {
        amount: data.amount,
        currencyCode: data.currencyCode,
      },
      effectiveDate: data.effectiveDate, // Backend espera ISO 8601 string
      description: data.description || undefined,
      isIncome: data.isIncome,
      // tags NO se envía (backend no soporta aún)
    };

    if (mode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
        onError: (error: ApiError) => {
          setApiError(error);
        },
      });
    } else if (mode === "edit" && transaction) {
      updateMutation.mutate(
        { id: transaction.id, data: payload },
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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nueva Transacción" : "Editar Transacción"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Errores generales del backend */}
            {apiError && <ErrorAlert error={apiError} />}

            {/* Campo: Tipo (Ingreso/Gasto) */}
            <FormField
              control={form.control}
              name="isIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Transacción</FormLabel>
                  <FormControl>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant={field.value === false ? "destructive" : "outline"}
                        onClick={() => {
                          field.onChange(false);
                          setSelectedType(false);
                          form.setValue("categoryId", 0); // Reset categoría al cambiar tipo
                        }}
                        className="flex-1"
                      >
                        💸 Gasto
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === true ? "success" : "outline"}
                        onClick={() => {
                          field.onChange(true);
                          setSelectedType(true);
                          form.setValue("categoryId", 0); // Reset categoría al cambiar tipo
                        }}
                        className="flex-1"
                      >
                        💰 Ingreso
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  {getFieldErrors("isIncome").map((msg, idx) => (
                    <p key={idx} className="text-sm font-medium text-red-500">
                      {msg}
                    </p>
                  ))}
                </FormItem>
              )}
            />

            {/* Campo: Cuenta */}
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuenta</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    disabled={accountsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una cuenta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.icon.code && <span className="mr-2">{account.icon.code}</span>}
                          {account.name} ({account.currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {getFieldErrors("accountId").map((msg, idx) => (
                    <p key={idx} className="text-sm font-medium text-red-500">
                      {msg}
                    </p>
                  ))}
                </FormItem>
              )}
            />

            {/* Campo: Categoría (filtrada por tipo) */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    disabled={categoriesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          <span className="mr-2">{category.icon.code}</span>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {getFieldErrors("categoryId").map((msg, idx) => (
                    <p key={idx} className="text-sm font-medium text-red-500">
                      {msg}
                    </p>
                  ))}
                </FormItem>
              )}
            />

            {/* Campo: Monto */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                  {getFieldErrors("amount").map((msg, idx) => (
                    <p key={idx} className="text-sm font-medium text-red-500">
                      {msg}
                    </p>
                  ))}
                </FormItem>
              )}
            />

            {/* Campo: Fecha */}
            <FormField
              control={form.control}
              name="effectiveDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type="date" {...field} className="pr-10" />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </FormControl>
                  <FormMessage />
                  {getFieldErrors("effectiveDate").map((msg, idx) => (
                    <p key={idx} className="text-sm font-medium text-red-500">
                      {msg}
                    </p>
                  ))}
                </FormItem>
              )}
            />

            {/* Campo: Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Compra en supermercado, pago de servicios..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {getFieldErrors("description").map((msg, idx) => (
                    <p key={idx} className="text-sm font-medium text-red-500">
                      {msg}
                    </p>
                  ))}
                </FormItem>
              )}
            />

            {/* Campo: Tags (UI-only, disabled) */}
            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Etiquetas (próximamente)
                    <span className="ml-2 text-xs text-slate-500">Backend en desarrollo</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: viaje, trabajo, personal..."
                      disabled
                      className="cursor-not-allowed opacity-50"
                      title="Esta función estará disponible próximamente cuando el backend la soporte"
                    />
                  </FormControl>
                  <p className="text-xs text-slate-500">
                    Podrás agregar etiquetas cuando la función esté disponible en el backend
                  </p>
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
                    ? "Crear Transacción"
                    : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
