/**
 * Transfer Form Modal
 * Modal para crear y editar transferencias con validación dual (client + server)
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateTransfer,
  useUpdateTransfer,
  useTransfer,
  useDeleteTransfer,
} from "@/api/services/transfers/useTransfers";
import { useAccounts } from "@/api/services/accounts/useAccounts";
import { transferSchema, type TransferFormValues } from "./transferSchema";
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
import { Calendar, Trash2, ArrowRight } from "lucide-react";
import { IconBox } from "@/components/iconBoxes/IconBox";
import { ErrorAlert } from "@/components/ErrorAlert";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { AddCurrentTimeToDate } from "@/utils/dateHelpers";

interface TransferFormModalProps {
  transferId?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_FORM_VALUES: TransferFormValues = {
  originAccountId: 0,
  destinationAccountId: 0,
  amount: 0,
  effectiveDate: new Date().toISOString().split("T")[0],
  description: "",
};

export function TransferFormModal({ transferId, open, onOpenChange }: TransferFormModalProps) {
  // Derivar modo del transferId
  const mode: "create" | "edit" = transferId ? "edit" : "create";

  // Fetch transfer data solo en modo edición
  const { data: transfer, isLoading: fetchingTransfer } = useTransfer(transferId!, {
    enabled: mode === "edit" && !!transferId && open,
  });

  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const createMutation = useCreateTransfer();
  const updateMutation = useUpdateTransfer();
  const deleteMutation = useDeleteTransfer();
  const activeMutation = mode === "create" ? createMutation : updateMutation;

  // Calcular cuenta principal para usar como default en origen
  const principalAccountId = accounts?.find((a) => a.isPrincipal)?.id;

  // Form con sincronización automática via 'values'
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    values:
      mode === "edit" && transfer
        ? {
            originAccountId: transfer.originAccount.id,
            destinationAccountId: transfer.destinationAccount.id,
            amount: transfer.amount,
            effectiveDate: transfer.effectiveDate.split("T")[0],
            description: transfer.description || "",
          }
        : {
            ...DEFAULT_FORM_VALUES,
            originAccountId: principalAccountId ?? 0,
          },
  });

  // Estado de dialog de confirmación de eliminación
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Calcular visibilidad del botón de eliminar (solo en modo edit)
  const showDeleteButton = mode === "edit" && !!transfer;

  const handleFormError = useFormErrorHandler(form);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      activeMutation.reset();
      deleteMutation.reset();
      form.reset(DEFAULT_FORM_VALUES);
    }
    onOpenChange(isOpen);
  };

  const handleDelete = () => {
    if (!transferId) return;

    deleteMutation.mutate(transferId, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        handleOpenChange(false);
      },
      onError: () => {
        setShowDeleteDialog(false);
      },
    });
  };

  const onSubmit = (data: TransferFormValues) => {
    const payload = {
      originAccountId: data.originAccountId,
      destinationAccountId: data.destinationAccountId,
      amount: data.amount,
      effectiveDate: AddCurrentTimeToDate(data.effectiveDate),
      description: data.description || undefined,
    };

    if (mode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => handleOpenChange(false),
        onError: handleFormError,
      });
    } else {
      updateMutation.mutate(
        { id: transferId!, data: payload },
        {
          onSuccess: () => handleOpenChange(false),
          onError: handleFormError,
        },
      );
    }
  };

  // Si es modo edición, esperar transferencia y cuentas.
  // Si es modo creación, solo esperar cuentas para mostrar opciones.
  const isLoadingData = mode === "edit" ? fetchingTransfer && accountsLoading : accountsLoading;

  const isSubmitting = activeMutation.isPending;
  const apiError = activeMutation.error as ApiError | null;

  if (isLoadingData) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md modal-form">
          <DialogHeader>
            <DialogTitle>Cargando transferencia...</DialogTitle>
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
            {mode === "create" ? "Nueva Transferencia" : "Editar Transferencia"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {apiError && <ErrorAlert error={apiError} />}

            {/* Cuenta Origen */}
            <FormField
              control={form.control}
              name="originAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground text-center block">
                    Cuenta Origen
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
                        <SelectValue placeholder="Selecciona cuenta origen" />
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

            {/* Indicador visual de dirección */}
            <div className="flex justify-center -mt-2 mb-2">
              <div className="rounded-full bg-muted/50 p-2">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Cuenta Destino */}
            <FormField
              control={form.control}
              name="destinationAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground text-center block">
                    Cuenta Destino
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value === 0 ? "" : field.value.toString()}
                    disabled={accountsLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full justify-center [&>span]:flex [&>span]:items-center [&>span]:gap-2">
                        <SelectValue placeholder="Selecciona cuenta destino" />
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

            {/* Monto */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                    Monto
                  </FormLabel>
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
                      placeholder="Ej: Transferencia de ahorros a cuenta corriente..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botones de acción */}
            <div className="flex justify-between items-center pt-4">
              {/* Botón Eliminar - Solo en modo edit */}
              {showDeleteButton ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isSubmitting}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              ) : (
                <div /> // Placeholder para mantener espacio
              )}

              {/* Botones principales */}
              <div className="flex gap-3">
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
                      ? "Crear Transferencia"
                      : "Guardar Cambios"}
                </Button>
              </div>
            </div>
          </form>
        </Form>

        {/* Dialog de confirmación de eliminación */}
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          itemName=""
          itemType="transferencia"
          description="¿Estás seguro de que deseas eliminar esta transferencia? Esta acción no se puede deshacer."
          isDeleting={deleteMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
