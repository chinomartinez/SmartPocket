import { describe, it, expect } from "vitest";
import { handleApiError } from "./errorHandler";
import { AxiosError } from "axios";

describe("handleApiError", () => {
  it("maneja errores de validación (400)", () => {
    const axiosError = new AxiosError(
      "Validation Error",
      "400",
      undefined,
      undefined,
      {
        status: 400,
        statusText: "Bad Request",
        data: {
          errors: {
            email: ["Email es requerido"],
            password: ["Contraseña muy corta"],
          },
        },
        headers: {},
        config: {} as any,
      },
    );

    const result = handleApiError(axiosError);

    expect(result.statusCode).toBe(400);
    expect(result.message).toBe(
      "Error de validación. Verifica los datos ingresados.",
    );
    expect(result.errors).toEqual({
      email: ["Email es requerido"],
      password: ["Contraseña muy corta"],
    });
  });

  it("maneja error de autenticación (401)", () => {
    const axiosError = new AxiosError(
      "Unauthorized",
      "401",
      undefined,
      undefined,
      {
        status: 401,
        statusText: "Unauthorized",
        data: {},
        headers: {},
        config: {} as any,
      },
    );

    const result = handleApiError(axiosError);

    expect(result.statusCode).toBe(401);
    expect(result.message).toBe("No autorizado. Por favor inicia sesión.");
  });

  it("maneja errores del servidor (500+)", () => {
    const axiosError = new AxiosError(
      "Internal Server Error",
      "500",
      undefined,
      undefined,
      {
        status: 500,
        statusText: "Internal Server Error",
        data: {},
        headers: {},
        config: {} as any,
      },
    );

    const result = handleApiError(axiosError);

    expect(result.statusCode).toBe(500);
    expect(result.message).toBe(
      "Error del servidor. Intenta nuevamente más tarde.",
    );
  });

  it("maneja errores de red (ERR_NETWORK)", () => {
    const axiosError = new AxiosError("Network Error", "ERR_NETWORK");

    const result = handleApiError(axiosError);

    expect(result.statusCode).toBeUndefined();
    expect(result.message).toBe(
      "Error de conexión. Verifica tu conexión a internet.",
    );
  });

  it("maneja errores genéricos no-Axios", () => {
    const genericError = new Error("Unexpected error");

    const result = handleApiError(genericError);

    expect(result.message).toBe("Ocurrió un error inesperado.");
    expect(result.statusCode).toBeUndefined();
  });
});
