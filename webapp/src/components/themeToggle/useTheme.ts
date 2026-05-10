/**
 * useTheme Hook
 * Hook para manejar el tema (light/dark) de la aplicación
 *
 * Persiste la preferencia en localStorage y sincroniza con la clase .dark en <html>
 */

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "sp-theme";

/**
 * Obtener la preferencia del sistema operativo
 */
function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Aplicar el tema al <html>
 */
function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

/**
 * Hook useTheme
 *
 * @returns {Object} - theme, setTheme, effectiveTheme
 */
export function useTheme() {
  // Estado del tema (light | dark | system)
  const [theme, setThemeState] = useState<Theme>(() => {
    // Leer del localStorage o usar 'system' por defecto
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return stored || "system";
  });

  // Tema efectivo (light | dark) - resuelve 'system' a light o dark
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (!stored || stored === "system") {
      return getSystemTheme();
    }
    return stored as "light" | "dark";
  });

  // Función para cambiar el tema
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);

    // Determinar el tema efectivo
    const resolvedTheme = newTheme === "system" ? getSystemTheme() : newTheme;
    setEffectiveTheme(resolvedTheme);
    applyTheme(resolvedTheme);
  };

  // Efecto para aplicar el tema inicial y escuchar cambios del sistema
  useEffect(() => {
    // Aplicar tema inicial
    applyTheme(effectiveTheme);

    // Listener para cambios en la preferencia del sistema (solo si theme === 'system')
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        const newEffectiveTheme = e.matches ? "dark" : "light";
        setEffectiveTheme(newEffectiveTheme);
        applyTheme(newEffectiveTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, effectiveTheme]);

  return {
    theme, // 'light' | 'dark' | 'system'
    setTheme,
    effectiveTheme, // 'light' | 'dark' (resuelto)
  };
}
