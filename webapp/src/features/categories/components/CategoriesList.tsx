/**
 * Categories List
 * Vista principal para gestión de categorías
 */
import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useCategories } from "../hooks/useCategories";
import type { CategoryGetDTO } from "@/api/services/categories/categoryTypes";
import { CategoryChip } from "./CategoryChip";
import { CategoryChipSkeleton } from "./CategoryChipSkeleton";
import { CategoryFormModal } from "./CategoryFormModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// ============================================================================
// Component
// ============================================================================

export function CategoriesList() {
  // Estado para filtros y modal
  const [typeFilter, setTypeFilter] = useState<boolean>(false); // false = gastos, true = ingresos
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<CategoryGetDTO | undefined>();
  const [modalDefaultType, setModalDefaultType] = useState<boolean>(false);

  // Query de categorías según tipo seleccionado
  const { data: categories, isLoading, isError, error } = useCategories(typeFilter);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleCreate = () => {
    setModalMode("create");
    setSelectedCategory(undefined);
    setModalDefaultType(typeFilter); // Heredar tipo del filtro activo
    setModalOpen(true);
  };

  const handleEdit = (category: CategoryGetDTO) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setModalOpen(true);
  };

  const handleDelete = () => {
    // Callback después de eliminar (opcional para feedback adicional)
    // El toast automático ya se muestra en main.tsx
  };

  // ============================================================================
  // Render States
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header con título y botón crear */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Categorías</h1>
          <p className="text-slate-400">Gestiona las categorías de tus transacciones</p>
        </div>

        <Button
          onClick={handleCreate}
          className="bg-sp-blue-600 hover:bg-sp-blue-700 transition-colors w-full sm:w-auto"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">Nueva Categoría</span>
          <span className="sm:hidden">Nueva</span>
        </Button>
      </div>

      {/* Filtros por tipo */}
      <div className="flex gap-2">
        <Button
          variant={typeFilter === false ? "destructive" : "default"}
          onClick={() => setTypeFilter(false)}
          className="flex-1 sm:flex-initial"
        >
          💸 Gastos
        </Button>
        <Button
          variant={typeFilter === true ? "success" : "default"}
          onClick={() => setTypeFilter(true)}
          className="flex-1 sm:flex-initial"
        >
          💰 Ingresos
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, idx) => (
            <CategoryChipSkeleton key={idx} />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="glass-card rounded-xl p-6 border border-red-500/20 bg-red-500/10">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Error al cargar categorías</h3>
            <p className="text-slate-300">
              {error instanceof Error ? error.message : "Ocurrió un error inesperado"}
            </p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && categories && categories.length === 0 && (
        <Card className="glass-card rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">{typeFilter ? "💰" : "💸"}</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay categorías de {typeFilter ? "ingresos" : "gastos"}
            </h3>
            <p className="text-slate-400 mb-6">
              Crea tu primera categoría de {typeFilter ? "ingresos" : "gastos"} para empezar a
              organizar tus transacciones.
            </p>
            <Button onClick={handleCreate} className="bg-sp-blue-600 hover:bg-sp-blue-700">
              <PlusIcon className="h-5 w-5 mr-2" />
              Crear Categoría
            </Button>
          </div>
        </Card>
      )}

      {/* Success State - Grid de chips */}
      {!isLoading && !isError && categories && categories.length > 0 && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
          {categories.map((category) => (
            <CategoryChip key={category.id} category={category} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {/* Modal de creación/edición */}
      <CategoryFormModal
        mode={modalMode}
        category={selectedCategory}
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultIsIncome={modalDefaultType}
      />
    </div>
  );
}
