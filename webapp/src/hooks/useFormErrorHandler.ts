/**
 * useFormErrorHandler Hook
 *
 * Hook para manejar errores de API y automáticamente inyectarlos en React Hook Form.
 * Usa mapeo case-insensitive para emparejar propertyNames del backend con campos del form.
 *
 * @example
 * const form = useForm<MyFormValues>({...});
 * const handleFormError = useFormErrorHandler(form);
 *
 * createMutation.mutate(payload, {
 *   onSuccess: () => handleSuccess(),
 *   onError: handleFormError,
 * });
 */

import { useCallback } from "react";
import type { UseFormReturn, FieldValues, Path } from "react-hook-form";
import type { ApiError } from "@/api/types";

export function useFormErrorHandler<T extends FieldValues>(form: UseFormReturn<T>) {
  return useCallback(
    (error: unknown) => {
      const apiError = error as ApiError;
      if (!apiError?.errors) return;

      const formValues = form.getValues();

      // Crear mapa case-insensitive: lowercase → nombre real del campo
      const fieldMap: Record<string, string> = {};
      for (const key of Object.keys(formValues)) {
        fieldMap[key.toLowerCase()] = key;
      }

      // Inyectar errores de campo en RHF
      apiError.errors.forEach((e) => {
        if (e.propertyName) {
          const lookup = e.propertyName.toLowerCase();
          const realFieldName = fieldMap[lookup];

          if (realFieldName) {
            form.setError(realFieldName as Path<T>, {
              type: "server",
              message: e.message,
            });
          }
        }
      });
    },
    [form],
  );
}
