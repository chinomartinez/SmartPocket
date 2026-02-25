/**
 * Error Logger Utility
 *
 * Centraliza el logging de errores con contexto adicional.
 * En desarrollo: logs en consola con formato estructurado.
 * En producción: preparado para integrar servicios externos (Sentry, LogRocket, etc.)
 */

import type { ApiError } from "@/api/types";

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface LoggedError {
  timestamp: string;
  message: string;
  stack?: string;
  context?: ErrorContext;
  apiError?: ApiError;
}

class ErrorLogger {
  private isDev = import.meta.env.DEV;

  /**
   * Log de error genérico
   */
  log(error: Error | ApiError, context?: ErrorContext): void {
    const loggedError: LoggedError = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: "stack" in error ? error.stack : undefined,
      context,
    };

    // Si es ApiError, agregar información adicional
    if ("statusCode" in error) {
      loggedError.apiError = error as ApiError;
    }

    if (this.isDev) {
      this.logToDev(loggedError);
    } else {
      this.logToProduction(loggedError);
    }
  }

  /**
   * Log específico para errores de API
   */
  logApiError(apiError: ApiError, context?: ErrorContext): void {
    const loggedError: LoggedError = {
      timestamp: new Date().toISOString(),
      message: apiError.message,
      apiError,
      context,
    };

    if (this.isDev) {
      this.logToDev(loggedError);
    } else {
      this.logToProduction(loggedError);
    }
  }

  /**
   * Log específico para errores de React (ErrorBoundary)
   */
  logReactError(
    error: Error,
    errorInfo: React.ErrorInfo,
    context?: ErrorContext,
  ): void {
    const loggedError: LoggedError = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context: {
        ...context,
        metadata: {
          componentStack: errorInfo.componentStack,
        },
      },
    };

    if (this.isDev) {
      this.logToDev(loggedError);
    } else {
      this.logToProduction(loggedError);
    }
  }

  /**
   * Logging para desarrollo (consola con formato)
   */
  private logToDev(loggedError: LoggedError): void {
    console.group(`🔴 Error: ${loggedError.message}`);
    console.log("⏰ Timestamp:", loggedError.timestamp);

    if (loggedError.apiError) {
      console.log("🌐 API Error:", {
        statusCode: loggedError.apiError.statusCode,
        message: loggedError.apiError.message,
        errors: loggedError.apiError.errors,
        problemDetails: loggedError.apiError.problemDetails,
      });
    }

    if (loggedError.context) {
      console.log("📍 Context:", loggedError.context);
    }

    if (loggedError.stack) {
      console.log("📚 Stack:", loggedError.stack);
    }

    console.groupEnd();
  }

  /**
   * Logging para producción (servicio externo)
   */
  private logToProduction(loggedError: LoggedError): void {
    // TODO: Integrar con servicio de logging externo
    // Ejemplos:

    // Sentry:
    // Sentry.captureException(new Error(loggedError.message), {
    //   extra: loggedError,
    // });

    // LogRocket:
    // LogRocket.captureException(new Error(loggedError.message), {
    //   tags: { context: loggedError.context?.component },
    //   extra: loggedError,
    // });

    // Por ahora, solo console.error en producción
    console.error("[Error]", loggedError.message, loggedError);
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger();
