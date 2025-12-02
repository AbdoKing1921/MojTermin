import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Star, MapPin, Clock, Phone, Mail } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { LoadingScreen } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import type { Business, Service } from "@shared/schema";

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: business, isLoading: businessLoading } = useQuery<Business>({
    queryKey: ["/api/businesses", id],
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/businesses", id, "services"],
  });

  if (businessLoading) {
    return (
      <MobileContainer>
        <LoadingScreen />
      </MobileContainer>
    );
  }

  if (!business) {
    return (
      <MobileContainer>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Biznis nije pronađen</p>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      {/* Hero Image */}
      <div className="relative h-48 business-gradient-1">
        {business.imageUrl ? (
          <img 
            src={business.imageUrl} 
            alt={business.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20" />
          </div>
        )}
        
        {/* Back Button */}
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm"
            data-testid="button-back"
            aria-label="Nazad"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
        </Link>

        {/* Sponsored Badge */}
        {business.isSponsored && (
          <div className="absolute top-6 right-6 bg-[#FBBF24] text-[#78350F] text-xs font-bold px-2.5 py-1 rounded-full">
            Sponsored
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-32 scroll-smooth -mt-4 bg-card rounded-t-3xl relative">
        {/* Business Info */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-business-name">
            {business.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
              <span className="text-sm font-bold text-foreground">
                {business.rating || "0.0"}
              </span>
              <span className="text-xs text-muted-foreground">
                ({business.reviewCount || 0} recenzija)
              </span>
            </div>
          </div>

          {business.description && (
            <p className="text-sm text-muted-foreground mb-4">
              {business.description}
            </p>
          )}

          {/* Contact Info */}
          <div className="space-y-2">
            {business.address && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{business.address}, {business.city}</span>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{business.phone}</span>
              </div>
            )}
            {business.email && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>{business.email}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>
                {business.openTime || "09:00"} - {business.closeTime || "18:00"}
              </span>
            </div>
          </div>
        </div>

        {/* Services */}
        {services && services.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Usluge</h2>
            <div className="space-y-3">
              {services.map((service) => (
                <div 
                  key={service.id}
                  className="p-4 bg-secondary rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {service.duration} min
                    </p>
                  </div>
                  <span className="text-base font-bold text-primary">
                    {service.price} KM
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Book Button */}
      <footer className="absolute bottom-0 left-0 right-0 px-6 py-5 bg-card border-t border-border">
        <Link href={`/book/${business.id}`}>
          <Button 
            className="w-full py-6 text-base font-bold rounded-2xl"
            data-testid="button-book"
          >
            Zakažite termin
          </Button>
        </Link>
      </footer>
    </MobileContainer>
  );
}
