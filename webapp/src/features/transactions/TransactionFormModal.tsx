/**
 * Transaction Form Modal
 * Modal para crear y editar transacciones con validación dual (client + server)
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateTransaction, useUpdateTransaction, useTransaction } from "./useTransactions";
import { useAccounts } from "@/features/accounts/useAccounts";
import { useCategories } from "@/features/categories/useCategories";
import { transactionSchema, type TransactionFormValues } from "./transactionSchema";
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
import { IconBox } from "@/components/iconBoxes/IconBox";

interface TransactionFormModalProps {
  mode: "create" | "edit";
  transactionId?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_FORM_VALUES: TransactionFormValues = {
  isIncome: false,
  accountId: 0,
  categoryId: 0,
  amount: 0,
  currencyCode: "",
  effectiveDate: new Date().toISOString().split("T")[0],
  description: "",
  tags: [],
};

export function TransactionFormModal({
  mode,
  transactionId,
  open,
  onOpenChange,
}: TransactionFormModalProps) {
  // Fetch transaction data solo en modo edición
  const { data: transaction, isLoading: fetchingTransaction } = useTransaction(transactionId!, {
    enabled: mode === "edit" && !!transactionId && open,
  });

  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const activeMutation = mode === "create" ? createMutation : updateMutation;

  // Form con sincronización automática via 'values' (reemplaza useEffect de reset)
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    values:
      mode === "edit" && transaction
        ? {
            isIncome: transaction.isIncome,
            accountId: transaction.accountId,
            categoryId: transaction.categoryId,
            amount: transaction.accountMoney.amount,
            currencyCode: transaction.accountMoney.currencyCode,
            effectiveDate: transaction.effectiveDate.split("T")[0],
            description: transaction.description || "",
            tags: [],
          }
        : DEFAULT_FORM_VALUES,
  });

  // Estado derivado: tipo de transacción determina categorías disponibles
  const isIncome = form.watch("isIncome");
  const { data: categories, isLoading: categoriesLoading } = useCategories(isIncome);

  const getFieldErrors = (fieldName: string): string[] => {
    const apiError = activeMutation.error as ApiError | null;
    return (
      apiError?.errors?.filter((e) => e.propertyName === fieldName).map((e) => e.message) || []
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      activeMutation.reset();
      form.reset(DEFAULT_FORM_VALUES);
    }
    onOpenChange(isOpen);
  };

  const onSubmit = (data: TransactionFormValues) => {
    const payload = {
      accountId: data.accountId,
      categoryId: data.categoryId,
      accountMoney: {
        amount: data.amount,
        currencyCode: data.currencyCode,
      },
      effectiveDate: data.effectiveDate,
      description: data.description || undefined,
      isIncome: data.isIncome,
    };

    if (mode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => handleOpenChange(false),
      });
    } else {
      updateMutation.mutate(
        { id: transactionId!, data: payload },
        {
          onSuccess: () => handleOpenChange(false),
        },
      );
    }
  };

  const isLoadingData =
    mode === "edit" && (fetchingTransaction || accountsLoading || categoriesLoading);

  const isSubmitting = activeMutation.isPending;
  const apiError = activeMutation.error as ApiError | null;

  if (isLoadingData) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Cargando transacción...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sp-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nueva Transacción" : "Editar Transacción"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {apiError && <ErrorAlert error={apiError} />}

            {/* Tipo de Transacción */}
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
                          form.setValue("categoryId", 0);
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
                          form.setValue("categoryId", 0);
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

            {/* Cuenta */}
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuenta</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const accountId = parseInt(value);
                      field.onChange(accountId);

                      // Sincronizar moneda automáticamente
                      const selectedAccount = accounts?.find((acc) => acc.id === accountId);
                      if (selectedAccount) {
                        form.setValue("currencyCode", selectedAccount.currency.code);
                      }
                    }}
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
                          <div className="flex items-center gap-2">
                            <IconBox
                              icon={account.icon}
                              size="xs"
                              shape="rounded"
                              backgroundOpacity={20}
                            />
                            <span>
                              {account.name} ({account.currency.code})
                            </span>
                          </div>
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

            {/* Categoría */}
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
                          <div className="flex items-center gap-2">
                            <IconBox
                              icon={category.icon}
                              size="xs"
                              shape="rounded"
                              backgroundOpacity={20}
                            />
                            <span>{category.name}</span>
                          </div>
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

            {/* Monto */}
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

            {/* Fecha */}
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

            {/* Descripción */}
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

            {/* Tags (próximamente) */}
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
