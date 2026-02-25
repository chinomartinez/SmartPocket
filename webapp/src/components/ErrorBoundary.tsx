/**
 * ErrorBoundary Component
 * 
 * Captura errores de React no manejados (crashes de componentes).
 * Muestra una UI de fallback elegante y previene que la app entera crashee.
 */

import { Component, type ReactNode } from 'react';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { errorLogger } from '@/utils/errorLogger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log centralizado del error
    errorLogger.logReactError(error, errorInfo, {
      component: 'ErrorBoundary',
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Si se provee un fallback custom, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback por defecto con glassmorphism
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sp-blue-900 to-slate-900 flex items-center justify-center p-4">
          <Card className="glass-card max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                <AlertTriangleIcon className="h-8 w-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl text-white">
                Algo salió mal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-slate-300">
                La aplicación encontró un error inesperado. Por favor intenta recargar la página.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <div className="rounded-lg bg-slate-800/50 p-4 border border-slate-700">
                  <p className="text-xs font-mono text-red-400 break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  className="bg-sp-blue-600 hover:bg-sp-blue-700"
                >
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Intentar de nuevo
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Ir al inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
