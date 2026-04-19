/**
 * Category Chip
 * Componente circular compacto para mostrar categorías
 */
import type { CategoryGetDTO } from "@/api/services/categories/categoryTypes";
import { getIconSymbol } from "./iconHelpers";

// ============================================================================
// Types
// ============================================================================

interface CategoryChipProps {
  category: CategoryGetDTO;
  onEdit: (category: CategoryGetDTO) => void;
  isReordering?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function CategoryChip({ category, onEdit, isReordering = false }: CategoryChipProps) {
  const iconSymbol = getIconSymbol(category.icon.code);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleClick = () => {
    if (isReordering) return;
    // Solo permitir edición si NO es categoría default
    if (!category.isDefault) {
      onEdit(category);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  const isClickable = !isReordering && !category.isDefault;

  return (
    <button
      onClick={handleClick}
      disabled={!isClickable}
      className={`group flex flex-col items-center gap-2 p-2 transition-all duration-200 ${
        isClickable ? "cursor-pointer" : "cursor-default opacity-75"
      }`}
    >
      {/* Círculo con icono */}
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all duration-200 ${
          isClickable
            ? "group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-sp-purple-500/30"
            : ""
        }`}
        style={{
          backgroundColor: `${category.icon.colorHex}30`,
          color: category.icon.colorHex,
        }}
      >
        {iconSymbol}
      </div>

      {/* Nombre de la categoría */}
      <div className="w-25 text-center">
        <p className="text-sm text-white font-medium leading-tight line-clamp-2">{category.name}</p>
        {category.isDefault && <p className="text-xs text-slate-500 mt-0.5">Sistema</p>}
      </div>
    </button>
  );
}
