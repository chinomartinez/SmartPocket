/**
 * Category Chip
 * Componente circular compacto para mostrar categorías
 */
import type { CategoryGetDTO } from "@/api/services/categories/categoryTypes";
import { IconBox } from "@/components/iconBoxes/IconBox";

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
      <IconBox
        icon={category.icon}
        size="lg"
        shape="circle"
        backgroundOpacity={30}
        animated={isClickable}
      />

      {/* Nombre de la categoría */}
      <div className="w-25 text-center">
        <p className="text-sm text-white font-medium leading-tight line-clamp-2">{category.name}</p>
        {category.isDefault && <p className="text-xs text-slate-500 mt-0.5">Sistema</p>}
      </div>
    </button>
  );
}
