import { cn } from "@/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-lg", className)} />;
}

export function MeetingCardSkeleton() {
  return (
    <div className="bg-surface-1 border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3.5 w-1/3" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-4/5" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 w-20 rounded-xl" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </div>
  );
}
