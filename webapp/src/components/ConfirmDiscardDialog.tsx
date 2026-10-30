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

interface ConfirmDiscardDialogProps {
  /** Controla visibilidad del dialog */
  open: boolean;
  /** Handler para cambiar visibilidad */
  onOpenChange: (open: boolean) => void;
  /** Handler ejecutado al confirmar el descarte */
  onConfirm: () => void;
  /** Título del dialog (override default) */
  title?: string;
  /** Descripción del dialog (override default) */
  description?: string;
}

/**
 * Confirmación reutilizable para descartar cambios sin guardar.
 */
export function ConfirmDiscardDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "¿Descartar cambios?",
  description = "Los cambios que no guardaste se perderán. Esta acción no se puede deshacer.",
}: ConfirmDiscardDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-card border-border-subtle">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700 hover:text-white"
          >
            Descartar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
