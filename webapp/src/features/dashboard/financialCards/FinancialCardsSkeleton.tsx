import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function FinancialCardsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-6 mb-6 md:mb-8">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="glass-card p-2 md:p-4">
          {/* Mobile version */}
          <div className="md:hidden">
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-4 w-20 mb-0.5" />
            <Skeleton className="h-2 w-12" />
          </div>

          {/* Desktop version */}
          <div className="hidden md:block">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </Card>
      ))}
    </div>
  );
}
