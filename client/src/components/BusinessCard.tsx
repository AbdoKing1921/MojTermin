import { Link } from "wouter";
import { Star, MapPin } from "lucide-react";
import type { Business } from "@shared/schema";

interface BusinessCardProps {
  business: Business;
  index?: number;
}

const gradients = [
  "business-gradient-1",
  "business-gradient-2",
  "business-gradient-3",
  "business-gradient-4",
];

export function BusinessCard({ business, index = 0 }: BusinessCardProps) {
  const gradientClass = gradients[index % gradients.length];

  return (
    <Link
      href={`/business/${business.id}`}
      className="category-card soft-shadow rounded-xl overflow-hidden flex-shrink-0 w-56 bg-card block border border-border"
      data-testid={`business-card-${business.id}`}
    >
      <div className={`h-32 ${gradientClass} flex items-center justify-center relative`}>
        {business.isSponsored && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded">
            Sponzorisano
          </div>
        )}
        {business.imageUrl ? (
          <img 
            src={business.imageUrl} 
            alt={business.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-white/40 text-lg font-semibold">
              {business.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground mb-1 truncate">{business.name}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{business.city || "Lokacija"}</span>
          {business.distance && (
            <>
              <span className="mx-0.5">·</span>
              <span>{business.distance}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-foreground">
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
