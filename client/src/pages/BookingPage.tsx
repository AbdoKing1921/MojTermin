import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Check } from "lucide-react";
import { Link } from "wouter";
import { MobileContainer } from "@/components/MobileContainer";
import { LoadingScreen } from "@/components/LoadingSpinner";
import { BookingCalendar } from "@/components/BookingCalendar";
import { TimeSlots } from "@/components/TimeSlots";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Business, Service } from "@shared/schema";

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Potrebna prijava",
        description: "Morate se prijaviti da biste zakazali termin",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: business, isLoading: businessLoading } = useQuery<Business>({
    queryKey: ["/api/businesses", id],
    enabled: !!id,
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/businesses", id, "services"],
    enabled: !!id,
  });

  const { data: bookedSlots } = useQuery<string[]>({
    queryKey: ["/api/businesses", id, "booked-slots", selectedDate?.toISOString().split("T")[0]],
    enabled: !!id && !!selectedDate,
  });

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedTime) {
        throw new Error("Molimo odaberite datum i vrijeme");
      }

      const dateStr = selectedDate.toISOString().split("T")[0];
      
      return apiRequest("POST", "/api/bookings", {
        businessId: id,
        serviceId: selectedService,
        date: dateStr,
        time: selectedTime,
      });
    },
    onSuccess: () => {
      toast({
        title: "Uspješno zakazano!",
        description: "Vaša rezervacija je potvrđena.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      navigate("/bookings");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Neautorizovano",
          description: "Prijavite se ponovo...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Greška",
        description: error.message || "Došlo je do greške pri rezervaciji",
        variant: "destructive",
      });
    },
  });

  if (businessLoading || authLoading) {
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

  const canBook = selectedDate && selectedTime;

  return (
    <MobileContainer>
      {/* Header */}
      <header className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href={`/business/${id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-lg"
              data-testid="button-back"
              aria-label="Nazad"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-base font-semibold text-foreground" data-testid="text-booking-title">
              Zakažite termin
            </h1>
            <p className="text-xs text-muted-foreground">{business.name}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-5 py-5 pb-24 scroll-smooth">
        {/* Service Selection */}
        {services && services.length > 0 && (
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Odaberite uslugu</h3>
            <div className="space-y-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedService(service.id)}
                  className={`w-full p-3 rounded-lg text-left border transition-colors ${
                    selectedService === service.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:bg-secondary"
                  }`}
                  data-testid={`service-${service.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className={`text-xs mt-0.5 ${
                        selectedService === service.id 
                          ? "text-primary-foreground/70" 
                          : "text-muted-foreground"
                      }`}>
                        {service.duration} min
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{service.price} KM</span>
                      {selectedService === service.id && (
                        <Check className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Date Selection */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Odaberite datum</h3>
          <BookingCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </section>

        {/* Time Selection */}
        {selectedDate && (
          <section className="mb-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Odaberite vrijeme</h3>
            <TimeSlots
              selectedTime={selectedTime}
              onTimeSelect={setSelectedTime}
              openTime={business.openTime || "09:00"}
              closeTime={business.closeTime || "18:00"}
              slotDuration={business.slotDuration || 30}
              bookedSlots={bookedSlots || []}
            />
          </section>
        )}
      </main>

      {/* Book Button */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 py-4 bg-card/95 backdrop-blur-sm border-t border-border">
        <Button
          className="w-full h-11 text-sm font-semibold rounded-lg"
          disabled={!canBook || createBookingMutation.isPending}
          onClick={() => createBookingMutation.mutate()}
          data-testid="button-confirm-booking"
        >
          {createBookingMutation.isPending ? "Zakazivanje..." : "Potvrdi rezervaciju"}
        </Button>
        {canBook && (
          <p className="text-center text-xs text-muted-foreground mt-2">
            {selectedDate?.toLocaleDateString("sr-Latn")} u {selectedTime}
          </p>
        )}
      </footer>
    </MobileContainer>
  );
}
