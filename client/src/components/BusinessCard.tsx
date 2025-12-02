import { Link } from "wouter";
import { Star, MapPin, Gem, Scissors, Tag, Clock } from "lucide-react";
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

const placeholderIcons = [Gem, Scissors, Tag, Clock];

export function BusinessCard({ business, index = 0 }: BusinessCardProps) {
  const gradientClass = gradients[index % gradients.length];
  const PlaceholderIcon = placeholderIcons[index % placeholderIcons.length];

  return (
    <Link
      href={`/business/${business.id}`}
      className="category-card soft-shadow rounded-2xl overflow-hidden flex-shrink-0 w-64 bg-card block"
      data-testid={`business-card-${business.id}`}
    >
      <div className={`h-36 ${gradientClass} flex items-center justify-center relative`}>
        {business.isSponsored && (
          <div className="absolute top-3 right-3 bg-[#FBBF24] text-[#78350F] text-xs font-bold px-2.5 py-1 rounded-full">
            Sponsored
          </div>
        )}
        {business.imageUrl ? (
          <img 
            src={business.imageUrl} 
            alt={business.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <PlaceholderIcon className="w-12 h-12 text-gray-100" strokeWidth={2} />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-base font-bold text-foreground mb-1">{business.name}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3 h-3" />
          <span>{business.city || "Downtown"}</span>
          {business.distance && (
            <>
              <span className="mx-1">•</span>
              <span>{business.distance}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" />
            <span className="text-sm font-bold text-foreground">
              {business.rating || "0.0"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            ({business.reviewCount || 0} reviews)
          </span>
        </div>
      </div>
    </Link>
  );
}
