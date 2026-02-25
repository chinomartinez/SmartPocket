/**
 * TestErrors Component (TEMPORAL)
 *
 * Componente para probar el sistema de manejo de errores.
 * Incluye tests para Toast, ErrorAlert, ErrorBoundary y errorLogger.
 *
 * ELIMINAR después de validar que todo funciona correctamente.
 */

import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ErrorAlert";
import { errorLogger } from "@/utils/errorLogger";

// Componente que falla intencionalmente (para ErrorBoundary)
function CrashComponent({ shouldCrash }: { shouldCrash: boolean }) {
  if (shouldCrash) {
    throw new Error("¡Componente falló intencionalmente! (ErrorBoundary test)");
  }
  return <p className="text-green-400">✅ Componente funcionando correctamente</p>;
}

import SmartPocketLayout from "@/layout/SmartPocketLayout";
import type { ApiError, ErrorDetail } from "@/api/types";

export function TestErrors() {
  const [showCrash, setShowCrash] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);

  // Simulación de mutation con error
  const testMutation = useMutation({
    mutationFn: async (errorType: string) => {
      // Simular delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      let errors: ErrorDetail[] = [];

      if (errorType === "validation") {
        errors = [
          {
            message: "El email es requerido",
            severity: "danger",
          },
          {
            message: "Formato de email inválido",
            severity: "danger",
          },
          {
            message: "La contraseña debe tener al menos 8 caracteres",
            severity: "danger",
          },
        ];
      }

      // Simular diferentes tipos de errores
      const mockError: ApiError = {
        message:
          errorType === "validation"
            ? "Error de validación. Verifica los datos ingresados."
            : "Error del servidor. Intenta nuevamente más tarde.",
        statusCode: errorType === "validation" ? 400 : 500,
        errors: errors,
      };

      throw mockError;
    },
    onError: (error) => {
      const err = error as ApiError;
      // Los errores 400 no muestran toast (se manejan manualmente)
      if (err.statusCode === 400) {
        setApiError(err);
      }
      // Los errores 500+ ya muestran toast automático (TanStack Query)
    },
  });

  const handleToastError = () => {
    toast.error("Este es un toast de error manual", {
      description: "Descripción adicional del error",
    });
  };

  const handleToastSuccess = () => {
    toast.success("¡Operación exitosa!");
  };

  const handleValidationError = () => {
    testMutation.mutate("validation");
  };

  const handleServerError = () => {
    testMutation.mutate("server");
  };

  const handleManualLog = () => {
    const mockError: ApiError = {
      message: "Error manual loggeado",
      statusCode: 418,
    };

    errorLogger.logApiError(mockError, {
      component: "TestErrors",
      action: "manual_test",
      metadata: { test: true },
    });

    toast.info("Revisa la consola para ver el log estructurado");
  };

  return (
    <>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl text-white">🧪 Test de Sistema de Errores</CardTitle>
          <p className="text-slate-400 text-sm">
            Componente temporal para validar el manejo de errores. Eliminar después de las pruebas.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test 1: Toasts */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">1. Toast Notifications</h3>
            <p className="text-sm text-slate-400">
              Notificaciones no intrusivas (esquina de la pantalla)
            </p>
            <div className="flex gap-3">
              <Button onClick={handleToastError} variant="destructive">
                Toast Error
              </Button>
              <Button onClick={handleToastSuccess} className="bg-emerald-600 hover:bg-emerald-700">
                Toast Success
              </Button>
            </div>
          </div>

          {/* Test 2: ErrorAlert (validación) */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">2. ErrorAlert Component</h3>
            <p className="text-sm text-slate-400">
              Alertas inline para errores de validación generales (400)
            </p>
            <Button onClick={handleValidationError} disabled={testMutation.isPending}>
              {testMutation.isPending ? "Cargando..." : "Simular Error de Validación"}
            </Button>
            {apiError && (
              <ErrorAlert error={apiError} onDismiss={() => setApiError(null)} className="mt-3" />
            )}
          </div>

          {/* Test 3: Toast automático (500+) */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              3. Toast Automático (TanStack Query)
            </h3>
            <p className="text-sm text-slate-400">Errores 500+ muestran toast automáticamente</p>
            <Button onClick={handleServerError} disabled={testMutation.isPending}>
              {testMutation.isPending ? "Cargando..." : "Simular Error del Servidor (500)"}
            </Button>
          </div>

          {/* Test 4: ErrorLogger */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">4. Error Logger</h3>
            <p className="text-sm text-slate-400">Logs estructurados en consola (abre DevTools)</p>
            <Button onClick={handleManualLog} variant="outline">
              Loggear Error Manual
            </Button>
          </div>

          {/* Test 5: ErrorBoundary */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">5. Error Boundary</h3>
            <p className="text-sm text-slate-400">
              Captura errores de React (componentes que crashean)
            </p>
            <div className="space-y-3">
              <Button onClick={() => setShowCrash(!showCrash)} variant="destructive">
                {showCrash ? "Resetear Componente" : "Crashear Componente"}
              </Button>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <CrashComponent shouldCrash={showCrash} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-slate-500 mt-6">
        ⚠️ Este componente es temporal y debe eliminarse después de las pruebas
      </div>
    </>
  );
}
