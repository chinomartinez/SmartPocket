/**
 * PlaceholderPage Component
 * 
 * Página placeholder para features que se implementarán en fases futuras.
 */

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description = 'Funcionalidad disponible en Fase 3' }: PlaceholderPageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-sp-blue-900 to-slate-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
        <p className="text-slate-300">{description}</p>
      </div>
    </div>
  );
}
