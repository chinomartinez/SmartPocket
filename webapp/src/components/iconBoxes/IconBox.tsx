/**
 * Icon Box
 * Componente reutilizable para renderizar iconos de categorías/cuentas
 * Centraliza la lógica de visualización y facilita migración futura a Heroicons
 */
import type { IconDTO } from "@/api/services/shared/sharedTypes";
import { getIconSymbol } from "./iconMap";

type IconSize = "xs" | "sm" | "md" | "lg" | "xl";
type IconShape = "square" | "rounded" | "circle";

interface IconBoxProps {
  icon: IconDTO;
  /** Tamaño del icono */
  size?: IconSize;
  /** Forma del contenedor */
  shape?: IconShape;
  /** Opacidad del background (10, 20, 30) */
  backgroundOpacity?: 10 | 20 | 30;
  /** Mostrar background coloreado */
  showBackground?: boolean;
  /** Clases adicionales para el contenedor */
  className?: string;
  /** Handler de click */
  onClick?: () => void;
  /** Activar efecto hover scale */
  animated?: boolean;
}

const SIZE_CLASSES: Record<IconSize, string> = {
  xs: "w-6 h-6 text-sm", // 24px
  sm: "w-10 h-10 text-lg", // 40px
  md: "w-14 h-14 text-2xl", // 56px
  lg: "w-20 h-20 text-3xl", // 80px
  xl: "w-24 h-24 text-4xl", // 96px
};

const SHAPE_CLASSES: Record<IconShape, string> = {
  square: "rounded-none",
  rounded: "rounded-lg",
  circle: "rounded-full",
};

export function IconBox({
  icon: { code, colorHex },
  size = "sm",
  shape = "rounded",
  backgroundOpacity = 20,
  showBackground = true,
  className = "",
  onClick,
  animated = false,
}: IconBoxProps) {
  const iconSymbol = getIconSymbol(code);

  // Construir clases CSS
  const sizeClass = SIZE_CLASSES[size];
  const shapeClass = SHAPE_CLASSES[shape];
  const interactiveClass = onClick ? "cursor-pointer" : "";
  const animatedClass = animated
    ? "transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-sp-purple-500/30"
    : "";

  // Background style inline (Tailwind no soporta opacidades dinámicas)
  const backgroundStyle = showBackground
    ? {
        backgroundColor: `${colorHex}${backgroundOpacity === 10 ? "1A" : backgroundOpacity === 20 ? "33" : "4D"}`, // hex opacity
        color: colorHex,
      }
    : {
        color: colorHex,
      };

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-center ${sizeClass} ${shapeClass} ${interactiveClass} ${animatedClass} ${className}`.trim()}
      style={backgroundStyle}
    >
      {iconSymbol}
    </div>
  );
}
