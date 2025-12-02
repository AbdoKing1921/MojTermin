import { type LucideIcon, Calendar, Search, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Calendar,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">{description}</p>
      {actionLabel && (actionHref || onAction) && (
        actionHref ? (
          <Link href={actionHref}>
            <Button data-testid="button-empty-action">{actionLabel}</Button>
          </Link>
        ) : (
          <Button onClick={onAction} data-testid="button-empty-action">
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
}

export function NoBookingsEmptyState() {
  return (
    <EmptyState
      icon={Calendar}
      title="Nemate rezervacija"
      description="Započnite rezervaciju pronalaženjem usluge koja vam odgovara"
      actionLabel="Pretraži usluge"
      actionHref="/"
    />
  );
}

export function NoSearchResultsEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="Nema rezultata"
      description={`Nismo pronašli rezultate za "${query}". Pokušajte s drugačijim pojmom.`}
    />
  );
}

export function NoBusinessesEmptyState() {
  return (
    <EmptyState
      icon={Building2}
      title="Nema biznisa"
      description="Trenutno nema dostupnih biznisa u ovoj kategoriji"
      actionLabel="Nazad na početnu"
      actionHref="/"
    />
  );
}
