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
      <div className="relative h-44 business-gradient-1">
        {business.imageUrl ? (
          <img 
            src={business.imageUrl} 
            alt={business.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-white/40 text-xl font-semibold">
                {business.name.charAt(0)}
              </span>
            </div>
          </div>
        )}
        
        {/* Back Button */}
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 w-9 h-9 rounded-lg bg-white/90 backdrop-blur-sm"
            data-testid="button-back"
            aria-label="Nazad"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </Button>
        </Link>

        {/* Sponsored Badge */}
        {business.isSponsored && (
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded">
            Sponzorisano
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-5 py-5 pb-24 scroll-smooth">
        {/* Business Info */}
        <div className="mb-5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground mb-2" data-testid="text-business-name">
            {business.name}
          </h1>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">
                {business.rating || "0.0"}
              </span>
              <span className="text-xs text-muted-foreground">
                ({business.reviewCount || 0} recenzija)
              </span>
            </div>
          </div>

          {business.description && (
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {business.description}
            </p>
          )}

          {/* Contact Info */}
          <div className="space-y-2 p-3 bg-secondary/50 rounded-lg">
            {business.address && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{business.address}, {business.city}</span>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{business.phone}</span>
              </div>
            )}
            {business.email && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>{business.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>
                {business.openTime || "09:00"} - {business.closeTime || "18:00"}
              </span>
            </div>
          </div>
        </div>

        {/* Services */}
        {services && services.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Usluge</h2>
            <div className="space-y-2">
              {services.map((service) => (
                <div 
                  key={service.id}
                  className="p-3 bg-card rounded-lg border border-border flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-medium text-foreground">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {service.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {service.duration} min
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {service.price} KM
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Book Button */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 py-4 bg-card/95 backdrop-blur-sm border-t border-border">
        <Link href={`/book/${business.id}`}>
          <Button 
            className="w-full h-11 text-sm font-semibold rounded-lg"
            data-testid="button-book"
          >
            Zakažite termin
          </Button>
        </Link>
      </footer>
    </MobileContainer>
  );
}
