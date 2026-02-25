/**
 * API Types
 *
 * Interfaces y tipos para la capa de comunicación HTTP.
 * Independientes de la implementación (Axios, Fetch, etc.)
 */

/**
 * Configuración de opciones para requests HTTP
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number;
}

/**
 * Respuesta genérica de la API
 * Abstracción independiente de la librería HTTP (Axios, Fetch, etc.)
 */
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: ErrorDetail[];
  problemDetails?: ProblemDetails;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: ErrorDetail[];
  [key: string]: unknown;
}

export interface ErrorDetail {
  message: string;
  severity: "danger" | "warning";
  propertyName?: string;
}
