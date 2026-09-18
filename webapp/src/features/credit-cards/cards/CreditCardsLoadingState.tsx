import { Skeleton } from "@/components/ui/skeleton";

export function CreditCardsLoadingState() {
  return (
    <div className="space-y-8 pb-8">
      <Skeleton className="h-20 w-full max-w-xl" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-48" />
        ))}
      </div>
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
