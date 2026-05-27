/**
 * Transaction Form Modal
 * Modal para crear y editar transacciones con validación dual (client + server)
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateTransaction, useUpdateTransaction, useTransaction } from "./useTransactions";
import { useAccounts } from "@/features/accounts/useAccounts";
import { useCategories } from "@/features/categories/useCategories";
import { transactionSchema, type TransactionFormValues } from "./transactionSchema";
import { useFormErrorHandler } from "@/hooks/useFormErrorHandler";
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
import { Calendar } from "lucide-react";
import { IconBox } from "@/components/iconBoxes/IconBox";
import { ErrorAlert } from "@/components/ErrorAlert";
import { MiniCalculator } from "./MiniCalculator";
import { cn } from "@/utils/utils";
import { AddCurrentTimeToDate } from "@/utils/dateHelpers";

interface TransactionFormModalProps {
  transactionId?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_FORM_VALUES: TransactionFormValues = {
  isIncome: false,
  accountId: 0,
  categoryId: 0,
  amount: 0,
  effectiveDate: new Date().toISOString().split("T")[0],
  description: "",
  tags: [],
};

export function TransactionFormModal({
  transactionId,
  open,
  onOpenChange,
}: TransactionFormModalProps) {
  // Derivar modo del transactionId
  const mode: "create" | "edit" = transactionId ? "edit" : "create";

  // Fetch transaction data solo en modo edición
  const { data: transaction, isLoading: fetchingTransaction } = useTransaction(transactionId!, {
    enabled: mode === "edit" && !!transactionId && open,
  });

  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const activeMutation = mode === "create" ? createMutation : updateMutation;

  // Calcular cuenta principal para usar como default
  const principalAccountId = accounts?.find((a) => a.isPrincipal)?.id;

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
            effectiveDate: transaction.effectiveDate.split("T")[0],
            description: transaction.description || "",
            tags: [],
          }
        : {
            ...DEFAULT_FORM_VALUES,
            accountId: principalAccountId ?? 0,
          },
  });

  // Estado derivado: tipo de transacción determina categorías disponibles
  const isIncome = form.watch("isIncome");
  const { data: categories, isLoading: categoriesLoading } = useCategories(isIncome);

  // Estado de mini calculadora
  const [showCalculator, setShowCalculator] = useState(false);

  // Cerrar calculadora al cambiar tipo de transacción
  useEffect(() => {
    if (showCalculator) {
      setShowCalculator(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIncome]);

  var handleFormError = useFormErrorHandler(form);

  const handleUseCalculatorResult = (value: number) => {
    form.setValue("amount", value);
    setShowCalculator(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      activeMutation.reset();
      form.reset(DEFAULT_FORM_VALUES);
    }
    onOpenChange(isOpen);
  };

  const onSubmit = (data: TransactionFormValues) => {
    // Obtener currencyCode de la cuenta seleccionada
    const selectedAccount = accounts?.find((acc) => acc.id === data.accountId);

    const payload = {
      accountId: data.accountId,
      categoryId: data.categoryId,
      accountMoney: {
        amount: data.amount,
        currencyCode: selectedAccount?.currency.code ?? "",
      },
      effectiveDate: AddCurrentTimeToDate(data.effectiveDate),
      description: data.description || undefined,
      isIncome: data.isIncome,
    };

    if (mode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => handleOpenChange(false),
        onError: handleFormError,
      });
    } else {
      updateMutation.mutate(
        { id: transactionId!, data: payload },
        {
          onSuccess: () => handleOpenChange(false),
          onError: handleFormError,
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
        <DialogContent className="sm:max-w-md modal-form">
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto modal-form">
        <DialogHeader className="mb-4 pb-4 border-b border-slate-700/50">
          <DialogTitle>
            {mode === "create" ? "Nueva Transacción" : "Editar Transacción"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {apiError && <ErrorAlert error={apiError} />}

            {/* Cuenta */}
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground text-center block">
                    Cuenta
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={
                      field.value === 0
                        ? (principalAccountId?.toString() ?? "")
                        : field.value.toString()
                    }
                    disabled={accountsLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full justify-center [&>span]:flex [&>span]:items-center [&>span]:gap-2">
                        <SelectValue placeholder="Selecciona una cuenta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent position="popper" align="center">
                      {accounts?.map((account) => (
                        <SelectItem
                          key={account.id}
                          value={account.id.toString()}
                          className="justify-center"
                        >
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
                </FormItem>
              )}
            />

            {/* Tipo de Transacción */}
            <FormField
              control={form.control}
              name="isIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                    Tipo de Transacción
                  </FormLabel>
                  <FormControl>
                    <div className="flex gap-2 p-1 rounded-xl bg-muted/50">
                      <button
                        type="button"
                        onClick={() => field.onChange(false)}
                        className={cn(
                          "flex-1 py-2 px-3 sm:px-4 rounded-lg text-sm font-semibold transition-all duration-200 border",
                          field.value === false
                            ? "bg-destructive/15 text-destructive border-destructive/30"
                            : "text-muted-foreground border-transparent hover:bg-muted/30",
                        )}
                      >
                        💸 Gasto
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange(true)}
                        className={cn(
                          "flex-1 py-2 px-3 sm:px-4 rounded-lg text-sm font-semibold transition-all duration-200 border",
                          field.value === true
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "text-muted-foreground border-transparent hover:bg-muted/30",
                        )}
                      >
                        💰 Ingreso
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Monto con Mini Calculadora */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                    Monto
                  </FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowCalculator(!showCalculator)}
                        className={cn(
                          "shrink-0 text-lg",
                          showCalculator && "bg-sp-blue-500/20 border border-sp-blue-500/40",
                        )}
                        title="Mini Calculadora"
                      >
                        🔢
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mini Calculadora (se muestra condicionalmente) */}
            {showCalculator && (
              <MiniCalculator
                onClose={() => setShowCalculator(false)}
                onUseResult={handleUseCalculatorResult}
              />
            )}

            {/* Campos ocultos cuando calculadora está activa */}
            {!showCalculator && (
              <>
                {/* Categoría */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                        Categoría
                      </FormLabel>
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
                    </FormItem>
                  )}
                />

                {/* Fecha */}
                <FormField
                  control={form.control}
                  name="effectiveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                        Fecha
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="date" {...field} className="pr-10" />
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descripción */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                        Descripción (opcional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ej: Compra en supermercado, pago de servicios..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags (próximamente) */}
                <FormField
                  control={form.control}
                  name="tags"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                        Etiquetas (próximamente)
                        <span className="ml-2 text-[10px] normal-case tracking-normal font-normal text-text-tertiary">
                          Backend en desarrollo
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: viaje, trabajo, personal..."
                          disabled
                          className="cursor-not-allowed opacity-50"
                          title="Esta función estará disponible próximamente cuando el backend la soporte"
                        />
                      </FormControl>
                      <p className="text-xs text-text-tertiary">
                        Podrás agregar etiquetas cuando la función esté disponible en el backend
                      </p>
                    </FormItem>
                  )}
                />
              </>
            )}

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
