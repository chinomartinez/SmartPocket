import { Skeleton } from "@/components/ui/skeleton";

export function HeroBalanceCardSkeleton() {
  return (
    <div className="glass-card glass-strong rounded-2xl p-5 md:p-6 relative overflow-hidden">
      {/* Decorative circle */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "rgba(59, 130, 246, 0.06)" }}
      />

      {/* Section label */}
      <Skeleton className="h-4 w-24 mb-6" />

      {/* Balance total + variation badge */}
      <div className="flex items-end gap-3 md:gap-4 mb-5 md:mb-6">
        <Skeleton className="h-12 md:h-14 w-48 md:w-64" />
        <Skeleton className="h-6 w-16 mb-1" />
      </div>

      {/* Accounts list */}
      <div className="flex gap-4 md:gap-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
