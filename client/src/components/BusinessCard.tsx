import { Link } from "wouter";
import { Star, MapPin, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Business } from "@shared/schema";

interface BusinessCardProps {
  business: Business;
  index?: number;
  variant?: "default" | "horizontal";
}

const gradients = [
  "business-gradient-1",
  "business-gradient-2",
  "business-gradient-3",
  "business-gradient-4",
];

export function BusinessCard({ business, index = 0, variant = "default" }: BusinessCardProps) {
  const gradientClass = gradients[index % gradients.length];

  if (variant === "horizontal") {
    return (
      <Link
        href={`/business/${business.id}`}
        className="flex items-center gap-4 p-3 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all group"
        data-testid={`business-card-${business.id}`}
      >
        {/* Image/Avatar */}
        <div className={`w-20 h-20 rounded-xl ${gradientClass} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
          {business.imageUrl ? (
            <img 
              src={business.imageUrl} 
              alt={business.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-xl font-bold">
              {business.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {business.name}
            </h3>
            {business.isSponsored && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 flex-shrink-0">
                Top
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{business.city || "Lokacija"}</span>
            </div>
            {business.distance && (
              <>
                <span>·</span>
                <span>{business.distance}</span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                  {business.rating || "0.0"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {business.reviewCount || 0} recenzija
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </Link>
    );
  }

  // Default vertical card
  return (
    <Link
      href={`/business/${business.id}`}
      className="block rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all group"
      data-testid={`business-card-${business.id}`}
    >
      <div className={`h-36 ${gradientClass} flex items-center justify-center relative`}>
        {business.isSponsored && (
          <Badge className="absolute top-2 right-2 text-[10px]">
            Sponzorisano
          </Badge>
        )}
        {business.imageUrl ? (
          <img 
            src={business.imageUrl} 
            alt={business.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
            <span className="text-white/60 text-2xl font-bold">
              {business.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1.5 truncate group-hover:text-primary transition-colors">
          {business.name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{business.city || "Lokacija"}</span>
          {business.distance && (
            <>
              <span>·</span>
              <span>{business.distance}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {business.rating || "0.0"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            ({business.reviewCount || 0})
          </span>
        </div>
      </div>
    </Link>
  );
}
