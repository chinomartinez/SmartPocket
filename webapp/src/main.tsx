import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { ApiError } from "@/api/types";
import "./index.css";
import { AppRouter } from "./router/AppRouter";

// Configurar TanStack Query con error handling global
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      const apiError = error as ApiError;
      onCentralError(apiError);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      const apiError = error as ApiError;
      onCentralError(apiError);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
      retry: 1, // 1 reintento en caso de error
      refetchOnWindowFocus: false, // No refetch al volver a la ventana
    },
  },
});

function onCentralError(error: ApiError) {
  if (!error) return;

  if (error.message) {
    toast.error(error.message);
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
