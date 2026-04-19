/**
 * AccountCardSkeleton Component
 * Skeleton loader para AccountCard
 */

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AccountCardSkeleton() {
  return (
    <Card className="glass-card overflow-hidden">
      <div className="p-6">
        {/* Header: Icono + Nombre */}
        <div className="flex items-start gap-4 mb-6">
          {/* Icono skeleton */}
          <Skeleton className="w-12 h-12 rounded-xl" />

          {/* Nombre skeleton */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Balance skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-40" />
        </div>

        {/* Footer skeleton */}
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    </Card>
  );
}
