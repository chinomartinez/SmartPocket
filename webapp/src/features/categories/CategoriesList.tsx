/**
 * Categories List
 * Vista principal para gestión de categorías con modo de reordenamiento
 */
import { useState, useRef, useCallback } from "react";
import { PlusIcon, ArrowsUpDownIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCategories, useReorderCategories } from "./useCategories";
import type { CategoryGetDTO } from "@/api/services/categories/categoryTypes";
import type { CategoryReorderItem } from "@/api/services/categories/categoryTypes";
import { CategoryChip } from "./CategoryChip";
import { CategoryChipSkeleton } from "./CategoryChipSkeleton";
import { CategoryFormModal } from "./CategoryFormModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SortableContainer, SortableItem, moveItem } from "./dnd";

// ============================================================================
// Types
// ============================================================================

interface ReorderSnapshot {
  gastos: CategoryGetDTO[];
  ingresos: CategoryGetDTO[];
}

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

  // Reorder state
  const [isReordering, setIsReordering] = useState(false);
  const [pendingGastos, setPendingGastos] = useState<CategoryGetDTO[]>([]);
  const [pendingIngresos, setPendingIngresos] = useState<CategoryGetDTO[]>([]);
  const originalSnapshot = useRef<ReorderSnapshot | null>(null);

  // Query de categorías según tipo seleccionado
  const { data: gastosData } = useCategories(false);
  const { data: ingresosData } = useCategories(true);
  const { data: categories, isLoading, isError, error } = useCategories(typeFilter);

  const reorderMutation = useReorderCategories();

  // ============================================================================
  // Reorder Handlers
  // ============================================================================

  const handleStartReorder = () => {
    const gastos = gastosData ? [...gastosData] : [];
    const ingresos = ingresosData ? [...ingresosData] : [];

    originalSnapshot.current = { gastos, ingresos };
    setPendingGastos(gastos);
    setPendingIngresos(ingresos);
    setIsReordering(true);
  };

  const handleCancelReorder = () => {
    setIsReordering(false);
    setPendingGastos([]);
    setPendingIngresos([]);
    originalSnapshot.current = null;
  };

  const handleSaveReorder = () => {
    const items: CategoryReorderItem[] = [
      ...pendingGastos.map((c, idx) => ({ id: c.id, sortOrder: idx })),
      ...pendingIngresos.map((c, idx) => ({ id: c.id, sortOrder: idx })),
    ];

    reorderMutation.mutate(
      { items },
      {
        onSuccess: () => {
          setIsReordering(false);
          setPendingGastos([]);
          setPendingIngresos([]);
          originalSnapshot.current = null;
        },
      },
    );
  };

  const handleDragEnd = useCallback(
    (activeId: string | number, overId: string | number) => {
      const currentList = typeFilter ? pendingIngresos : pendingGastos;
      const setList = typeFilter ? setPendingIngresos : setPendingGastos;

      const oldIndex = currentList.findIndex((c) => c.id === activeId);
      const newIndex = currentList.findIndex((c) => c.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        setList(moveItem(currentList, oldIndex, newIndex));
      }
    },
    [typeFilter, pendingIngresos, pendingGastos],
  );

  // ============================================================================
  // CRUD Handlers
  // ============================================================================

  const handleCreate = () => {
    setModalMode("create");
    setSelectedCategory(undefined);
    setModalDefaultType(typeFilter);
    setModalOpen(true);
  };

  const handleEdit = (category: CategoryGetDTO) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setModalOpen(true);
  };

  // ============================================================================
  // Derived state
  // ============================================================================

  const displayCategories = isReordering
    ? typeFilter
      ? pendingIngresos
      : pendingGastos
    : categories;

  const sortableIds = isReordering ? (displayCategories ?? []).map((c) => c.id) : [];

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header con título y botones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Categorías</h1>
          <p className="text-slate-400">Gestiona las categorías de tus transacciones</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {isReordering ? (
            <>
              <Button
                onClick={handleSaveReorder}
                disabled={reorderMutation.isPending}
                className="bg-green-600 hover:bg-green-700 transition-colors flex-1 sm:flex-initial"
              >
                <CheckIcon className="h-5 w-5 mr-2" />
                {reorderMutation.isPending ? "Guardando..." : "Guardar Orden"}
              </Button>
              <Button
                onClick={handleCancelReorder}
                disabled={reorderMutation.isPending}
                variant="destructive"
                className="flex-1 sm:flex-initial"
              >
                <XMarkIcon className="h-5 w-5 mr-2" />
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleStartReorder}
                disabled={isLoading || isError}
                variant="default"
                className="flex-1 sm:flex-initial"
              >
                <ArrowsUpDownIcon className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Reordenar Categorías</span>
                <span className="sm:hidden">Reordenar</span>
              </Button>
              <Button
                onClick={handleCreate}
                className="bg-sp-blue-600 hover:bg-sp-blue-700 transition-colors flex-1 sm:flex-initial"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Nueva Categoría</span>
                <span className="sm:hidden">Nueva</span>
              </Button>
            </>
          )}
        </div>
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

      {/* Reorder mode indicator */}
      {isReordering && (
        <Card className="glass-card rounded-xl p-4 border border-sp-blue-500/30 bg-sp-blue-500/10">
          <p className="text-sm text-sp-blue-300 text-center">
            ✋ Arrastra las categorías para reordenarlas. Puedes cambiar entre pestañas de Gastos e
            Ingresos. Los cambios se guardarán juntos al confirmar.
          </p>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !isReordering && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, idx) => (
            <CategoryChipSkeleton key={idx} />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isReordering && (
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
      {!isLoading &&
        !isError &&
        !isReordering &&
        displayCategories &&
        displayCategories.length === 0 && (
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

      {/* Success State - Grid de chips (normal or reorder mode) */}
      {displayCategories &&
        displayCategories.length > 0 &&
        (isReordering ? (
          <SortableContainer items={sortableIds} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
              {displayCategories.map((category) => (
                <SortableItem key={category.id} id={category.id}>
                  <CategoryChip
                    category={category}
                    onEdit={handleEdit}
                    isReordering={isReordering}
                  />
                </SortableItem>
              ))}
            </div>
          </SortableContainer>
        ) : (
          !isLoading &&
          !isError && (
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
              {displayCategories.map((category) => (
                <CategoryChip key={category.id} category={category} onEdit={handleEdit} />
              ))}
            </div>
          )
        ))}

      {/* Modal de creación/edición (disabled during reorder) */}
      {!isReordering && (
        <CategoryFormModal
          mode={modalMode}
          category={selectedCategory}
          open={modalOpen}
          onOpenChange={setModalOpen}
          defaultIsIncome={modalDefaultType}
        />
      )}
    </div>
  );
}
