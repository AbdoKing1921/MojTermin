import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
  };

  return (
    <div
      className={cn(
        "rounded-full border-primary/20 border-t-primary animate-spin",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Učitavanje..."
    >
      <span className="sr-only">Učitavanje...</span>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 animate-fade-in" data-testid="loading-screen">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground animate-pulse-subtle">Učitavanje...</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="w-44 flex-shrink-0 rounded-xl overflow-hidden" data-testid="skeleton-card">
      <div className="h-28 skeleton-shimmer rounded-xl" />
      <div className="p-3 space-y-2">
        <div className="h-4 skeleton-shimmer rounded w-3/4" />
        <div className="h-3 skeleton-shimmer rounded w-1/2" />
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="w-20 flex-shrink-0 flex flex-col items-center gap-2" data-testid="skeleton-category">
      <div className="w-14 h-14 skeleton-shimmer rounded-xl" />
      <div className="h-3 skeleton-shimmer rounded w-12" />
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="p-4 border border-border rounded-xl space-y-3" data-testid="skeleton-list-item">
      <div className="flex items-center justify-between">
        <div className="h-5 skeleton-shimmer rounded w-32" />
        <div className="h-5 skeleton-shimmer rounded-full w-16" />
      </div>
      <div className="h-4 skeleton-shimmer rounded w-48" />
      <div className="h-3 skeleton-shimmer rounded w-24" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="p-5 space-y-6 animate-fade-in" data-testid="skeleton-page">
      <div className="h-8 skeleton-shimmer rounded w-48" />
      <div className="space-y-4">
        <ListItemSkeleton />
        <ListItemSkeleton />
        <ListItemSkeleton />
      </div>
    </div>
  );
}
