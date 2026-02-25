/**
 * ErrorAlert Component
 *
 * Muestra errores inline (validación, formularios) usando shadcn Alert.
 * Recibe ApiError del errorHandler y muestra mensaje + errores de validación.
 */

import { OctagonXIcon, XIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ApiError } from "@/api/types";

export interface ErrorAlertProps {
  error: ApiError | null;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorAlert({ error, onDismiss, className }: ErrorAlertProps) {
  if (!error || !error.errors) return null;
  if (error.errors.length === 0) return null;

  const validationErrors = (error.errors || [])
    .filter((err) => !err.propertyName)
    .map((err) => err.message);

  if (validationErrors.length === 0) return null;

  return (
    <Alert variant="destructive" className={className}>
      <OctagonXIcon />
      <AlertTitle className="flex items-center justify-between">
        <span>{error.message}</span>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-70 hover:opacity-100"
            onClick={onDismiss}
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        )}
      </AlertTitle>
      {validationErrors.length > 0 && (
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-2">
            {validationErrors.map((errorMsg, idx) => (
              <li key={idx}>{errorMsg}</li>
            ))}
          </ul>
        </AlertDescription>
      )}
    </Alert>
  );
}
