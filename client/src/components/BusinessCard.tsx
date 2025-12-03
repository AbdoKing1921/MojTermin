import { Link } from "wouter";
import { Star, MapPin, ChevronRight, Sparkles } from "lucide-react";
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
        className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all group"
        data-testid={`business-card-${business.id}`}
      >
        {/* Image/Avatar */}
        <div className={`w-20 h-20 rounded-xl ${gradientClass} flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md relative`}>
          {business.imageUrl ? (
            <img 
              src={business.imageUrl} 
              alt={business.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <span className="text-white text-2xl font-bold drop-shadow-sm relative z-10">
                {business.name.charAt(0)}
              </span>
            </>
          )}
          {business.isSponsored && (
            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {business.name}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-muted/80 flex items-center justify-center">
                <MapPin className="w-3 h-3 text-muted-foreground" />
              </div>
              <span className="truncate">{business.city || "Lokacija"}</span>
            </div>
            {business.distance && (
              <>
                <span className="text-muted-foreground/50">·</span>
                <span>{business.distance}</span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 px-2.5 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  {business.rating || "0.0"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                ({business.reviewCount || 0})
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
              <ChevronRight className="w-4 h-4 text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default vertical card
  return (
    <Link
      href={`/business/${business.id}`}
      className="block rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all group"
      data-testid={`business-card-${business.id}`}
    >
      <div className={`h-36 ${gradientClass} flex items-center justify-center relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
        
        {business.isSponsored && (
          <Badge className="absolute top-3 right-3 bg-amber-400 text-amber-900 border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />
            Top
          </Badge>
        )}
        {business.imageUrl ? (
          <img 
            src={business.imageUrl} 
            alt={business.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg relative z-10">
            <span className="text-white text-2xl font-bold drop-shadow-md">
              {business.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-foreground mb-2 truncate group-hover:text-primary transition-colors">
          {business.name}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <div className="w-5 h-5 rounded-md bg-muted/80 flex items-center justify-center">
            <MapPin className="w-3 h-3" />
          </div>
          <span className="truncate">{business.city || "Lokacija"}</span>
          {business.distance && (
            <>
              <span className="text-muted-foreground/50">·</span>
              <span className="font-medium">{business.distance}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 px-2.5 py-1 rounded-lg">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
              {business.rating || "0.0"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            ({business.reviewCount || 0} recenzija)
          </span>
        </div>
      </div>
    </Link>
  );
}
