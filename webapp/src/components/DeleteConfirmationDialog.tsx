/**
 * Delete Confirmation Dialog
 * Componente reutilizable para confirmación de eliminación de entidades
 * Mantiene consistencia en UX de eliminación en toda la app
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationDialogProps {
  /** Controla visibilidad del dialog */
  open: boolean;
  /** Handler para cambiar visibilidad */
  onOpenChange: (open: boolean) => void;
  /** Handler ejecutado al confirmar eliminación */
  onConfirm: () => void;
  /** Nombre del item a eliminar (se muestra en el mensaje) */
  itemName: string;
  /** Tipo de item (ej: "cuenta", "categoría", "transacción") */
  itemType?: string;
  /** Estado de loading durante eliminación */
  isDeleting?: boolean;
  /** Título del dialog (override default) */
  title?: string;
  /** Descripción del dialog (override default) */
  description?: string;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  itemType = "elemento",
  isDeleting = false,
  title,
  description,
}: DeleteConfirmationDialogProps) {
  // Defaults dinámicos basados en itemType
  const defaultTitle = `¿Eliminar ${itemType}?`;
  const defaultDescription = `¿Estás seguro de que deseas eliminar ${itemType === "elemento" ? "este elemento" : `la ${itemType} "${itemName}"`}? Esta acción no se puede deshacer.`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-card border-slate-700">
        <AlertDialogHeader>
          <AlertDialogTitle>{title || defaultTitle}</AlertDialogTitle>
          <AlertDialogDescription>{description || defaultDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
