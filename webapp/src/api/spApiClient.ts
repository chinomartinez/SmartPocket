/**
 * HTTP Client (spApiClient)
 *
 * Cliente HTTP basado en Axios con abstracción a través de ApiResponse<T>.
 * Retorna objetos normalizados independientes de Axios.
 */

import axios from "axios";
import type { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { handleApiError } from "./errorHandler";
import { errorLogger } from "@/utils/errorLogger";
import type { ApiResponse, RequestConfig } from "./types";

// Configuración base
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * Instancia de Axios (singleton interno)
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }

    // TODO (Fase futura - Autenticación): Agregar token JWT
    // const token = localStorage.getItem('auth_token');
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error: AxiosError) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = handleApiError(error);

    // Log centralizado del error con contexto
    errorLogger.logApiError(apiError, {
      action: "axios_request",
      metadata: {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        statusCode: apiError.statusCode,
      },
    });

    return Promise.reject(apiError);
  },
);

/**
 * Función helper privada para mapear AxiosResponse a ApiResponse
 * Reutilizada por todos los métodos HTTP
 */
function mapToApiResponse<T>(axiosResponse: AxiosResponse<T>): ApiResponse<T> {
  return {
    data: axiosResponse.data,
    status: axiosResponse.status,
    statusText: axiosResponse.statusText,
    headers: axiosResponse.headers as Record<string, string>,
  };
}

/**
 * Cliente HTTP normalizado
 * Objeto literal con métodos HTTP que retornan ApiResponse<T>
 */
export const spApiClient = {
  /**
   * GET request
   */
  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const axiosResponse = await axiosInstance.get<T>(url, config);
    return mapToApiResponse(axiosResponse);
  },

  /**
   * POST request
   */
  async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    const axiosResponse = await axiosInstance.post<T>(url, data, config);
    return mapToApiResponse(axiosResponse);
  },

  /**
   * PUT request (actualización completa)
   */
  async put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    const axiosResponse = await axiosInstance.put<T>(url, data, config);
    return mapToApiResponse(axiosResponse);
  },

  /**
   * PATCH request (actualización parcial)
   */
  async patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    const axiosResponse = await axiosInstance.patch<T>(url, data, config);
    return mapToApiResponse(axiosResponse);
  },

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const axiosResponse = await axiosInstance.delete<T>(url, config);
    return mapToApiResponse(axiosResponse);
  },
};
