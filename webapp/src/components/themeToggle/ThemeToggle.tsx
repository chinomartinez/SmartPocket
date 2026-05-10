/**
 * ThemeToggle Component
 * Botón para cambiar entre light/dark/system theme
 *
 * Ciclo: light → dark → system → light
 */

import { SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/themeToggle/useTheme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Ciclo: light → dark → system → light
  const handleToggle = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  // Determinar ícono según el tema actual
  const Icon = theme === "light" ? SunIcon : theme === "dark" ? MoonIcon : ComputerDesktopIcon;

  // Tooltip text
  const tooltipText =
    theme === "light" ? "Modo claro" : theme === "dark" ? "Modo oscuro" : "Modo sistema";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="text-muted-foreground hover:bg-hover-muted transition-all duration-300"
      title={tooltipText}
    >
      <Icon className="size-6 transition-transform duration-300 hover:rotate-12" />
    </Button>
  );
}
