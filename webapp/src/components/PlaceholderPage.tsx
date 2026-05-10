/**
 * PlaceholderPage Component
 *
 * Página placeholder para features que se implementarán en fases futuras.
 */

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({
  title,
  description = "Funcionalidad disponible en Fase 3",
}: PlaceholderPageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
