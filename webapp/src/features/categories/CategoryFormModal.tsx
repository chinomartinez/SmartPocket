/**
 * Category Form Modal
 * Modal para crear y editar categorías con validación dual (client + server)
 */

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "@heroicons/react/24/outline";
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/features/categories/useCategories";
import { categorySchema, type CategoryFormValues } from "./categorySchema";
import type { CategoryGetDTO } from "@/api/services/categories/categoryTypes";
import type { ApiError } from "@/api/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
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
import { ErrorAlert } from "@/components/ErrorAlert";
import { getCategoryIcons } from "@/components/iconBoxes/iconMap";

// ============================================================================
// Types
// ============================================================================

interface CategoryFormModalProps {
  mode: "create" | "edit";
  category?: CategoryGetDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultIsIncome?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_FORM_VALUES: CategoryFormValues = {
  name: "",
  icon: {
    code: "other",
    colorHex: "#3B82F6",
  },
  isIncome: false,
};

// ============================================================================
// Component
// ============================================================================

export function CategoryFormModal({
  mode,
  category,
  open,
  onOpenChange,
  defaultIsIncome,
}: CategoryFormModalProps) {
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Estado para controlar el tipo de categoría (afecta iconos mostrados)
  const initialType = mode === "edit" && category ? category.isIncome : (defaultIsIncome ?? false);
  const [selectedType, setSelectedType] = useState<boolean>(initialType);

  // Hooks
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  // Form setup
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  // Pre-cargar datos en modo edición o resetear en modo creación
  useEffect(() => {
    if (mode === "edit" && category) {
      form.reset({
        name: category.name,
        icon: category.icon,
        isIncome: category.isIncome,
      });

      setSelectedType(category.isIncome);
    } else if (mode === "create") {
      const createDefaults = {
        ...DEFAULT_FORM_VALUES,
        isIncome: defaultIsIncome ?? false,
      };
      form.reset(createDefaults);
      setSelectedType(defaultIsIncome ?? false);
    }
  }, [mode, category, form, defaultIsIncome]);

  // Limpiar errores al abrir/cerrar modal
  useEffect(() => {
    if (open) {
      setApiError(null);
    }
  }, [open]);

  // Filtrar iconos según tipo seleccionado
  const availableIcons = useMemo(() => getCategoryIcons(selectedType), [selectedType]);

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

  const onSubmit = (data: CategoryFormValues) => {
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
    } else if (mode === "edit" && category) {
      updateMutation.mutate(
        { id: category.id, data },
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

  const handleDelete = () => {
    if (!category) return;

    deleteMutation.mutate(category.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        onOpenChange(false);
      },
      onError: () => {
        // Toast automático ya se muestra en main.tsx
        setShowDeleteDialog(false);
      },
    });
  };

  // ============================================================================
  // Render
  // ============================================================================

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const showDeleteButton = mode === "edit" && category && !category.isDefault;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nueva Categoría" : "Editar Categoría"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Error Alert - Solo errores generales (sin propertyName) */}
            <ErrorAlert error={apiError} />

            {/* Campo: Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Comida, Salario, Transporte..." {...field} />
                  </FormControl>
                  <FormMessage />
                  {/* Errores del servidor para este campo */}
                  {getFieldErrors("name").map((error, idx) => (
                    <p key={idx} className="text-sm font-medium text-red-500">
                      {error}
                    </p>
                  ))}
                </FormItem>
              )}
            />

            {/* Campo: Tipo (Ingreso/Gasto) - Solo en modo create */}
            {mode === "create" && (
              <FormField
                control={form.control}
                name="isIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Categoría</FormLabel>
                    <FormControl>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant={field.value === false ? "default" : "outline"}
                          onClick={() => {
                            field.onChange(false);
                            setSelectedType(false);
                          }}
                          className="flex-1"
                        >
                          💸 Gasto
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === true ? "default" : "outline"}
                          onClick={() => {
                            field.onChange(true);
                            setSelectedType(true);
                          }}
                          className="flex-1"
                        >
                          💰 Ingreso
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    {getFieldErrors("isIncome").map((error, idx) => (
                      <p key={idx} className="text-sm font-medium text-red-500">
                        {error}
                      </p>
                    ))}
                  </FormItem>
                )}
              />
            )}

            {/* Campo: Icono */}
            <FormField
              control={form.control}
              name="icon.code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícono</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {availableIcons.map((option) => (
                        <button
                          key={option.code}
                          type="button"
                          onClick={() => field.onChange(option.code)}
                          className={`h-12 flex items-center justify-center text-2xl rounded-lg
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
                  {getFieldErrors("icon.code").map((error, idx) => (
                    <p key={idx} className="text-sm font-medium text-red-500">
                      {error}
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
                      {/* Native color input */}
                      <input
                        type="color"
                        value={field.value}
                        onChange={field.onChange}
                        className="h-10 w-16 rounded-lg border-2 border-slate-700 bg-transparent cursor-pointer"
                      />
                      {/* Text input para edición manual */}
                      <Input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="#3B82F6"
                        className="flex-1 uppercase"
                      />
                      {/* Preview visual */}
                      <div
                        className="h-10 w-10 rounded-lg border-2 border-slate-700 flex-shrink-0"
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  {getFieldErrors("icon.colorHex").map((error, idx) => (
                    <p key={idx} className="text-sm font-medium text-red-500">
                      {error}
                    </p>
                  ))}
                </FormItem>
              )}
            />

            {/* Botones de acción */}
            <div className="flex justify-between items-center pt-4">
              {/* Botón Eliminar - Solo en modo edit y si NO es default */}
              {showDeleteButton ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isLoading}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              ) : (
                <div />
              )}

              {/* Botones principales */}
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Guardando..." : mode === "create" ? "Crear" : "Guardar"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>

      {/* Dialog de confirmación de eliminación */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        itemName={category?.name || ""}
        itemType="categoría"
        isDeleting={deleteMutation.isPending}
      />
    </Dialog>
  );
}
