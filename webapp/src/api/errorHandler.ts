/**
 * API Error Handler
 *
 * Maneja errores de la API y los transforma en mensajes user-friendly.
 */

import { AxiosError } from "axios";
import type { ApiError, ProblemDetails } from "./types";

const clientErrorMessages: Record<number, string> = {
  400: "Error de validación. Verifica los datos ingresados.",
  401: "No autorizado. Por favor inicia sesión.",
  403: "No tienes permisos para realizar esta acción.",
  404: "Recurso no encontrado.",
};

const codeErrorMessages: Record<string, string> = {
  ERR_NETWORK: "Error de conexión. Verifica tu conexión a internet.",
  ECONNABORTED: "La solicitud tardó demasiado. Intenta nuevamente.",
};

/**
 * Procesa errores de Axios y retorna un objeto ApiError estructurado
 */
export function handleApiError(error: unknown): ApiError {
  // Error de Axios (respuesta HTTP con error)
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const problemDetails = error.response?.data as ProblemDetails | any;

    const message =
      getMessageFromStatusCode(statusCode) ||
      codeErrorMessages[error.code ?? ""] ||
      problemDetails?.title ||
      error.message ||
      "Ocurrió un error inesperado.";

    return {
      message,
      statusCode,
      errors: problemDetails?.errors ?? [],
      problemDetails,
    };
  }

  // Error genérico (no Axios)
  return {
    message: "Ocurrió un error inesperado.",
  };
}

function getMessageFromStatusCode(statusCode?: number): string | undefined {
  if (!statusCode) return undefined;

  if (statusCode >= 500) {
    return "Error del servidor. Intenta nuevamente más tarde.";
  }

  return clientErrorMessages[statusCode];
}
