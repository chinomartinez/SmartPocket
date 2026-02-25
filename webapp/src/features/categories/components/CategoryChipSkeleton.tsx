/**
 * Category Chip Skeleton
 * Loading placeholder para CategoryChip
 */
import { Skeleton } from "@/components/ui/skeleton";

// ============================================================================
// Component
// ============================================================================

export function CategoryChipSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 p-2">
      {/* Círculo skeleton */}
      <Skeleton className="w-20 h-20 rounded-full bg-slate-700/50" />

      {/* Nombre skeleton (2 líneas) */}
      <div className="w-20 flex flex-col items-center gap-1">
        <Skeleton className="h-3 w-16 bg-slate-700/50" />
        <Skeleton className="h-3 w-12 bg-slate-700/50" />
      </div>
    </div>
  );
}
