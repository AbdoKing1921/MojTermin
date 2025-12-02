import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, X } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { LoadingScreen } from "@/components/LoadingSpinner";
import { NoBookingsEmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Booking, Business } from "@shared/schema";

interface BookingWithBusiness extends Booking {
  business?: Business;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusLabels: Record<string, string> = {
  pending: "Na čekanju",
  confirmed: "Potvrđeno",
  completed: "Završeno",
  cancelled: "Otkazano",
};

export default function UserBookings() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Potrebna prijava",
        description: "Morate se prijaviti da vidite rezervacije",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: bookings, isLoading } = useQuery<BookingWithBusiness[]>({
    queryKey: ["/api/bookings"],
    enabled: isAuthenticated,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      return apiRequest("PATCH", `/api/bookings/${bookingId}/cancel`);
    },
    onSuccess: () => {
      toast({
        title: "Rezervacija otkazana",
        description: "Vaša rezervacija je uspješno otkazana",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
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
        description: "Nije moguće otkazati rezervaciju",
        variant: "destructive",
      });
    },
  });

  if (authLoading || isLoading) {
    return (
      <MobileContainer>
        <LoadingScreen />
      </MobileContainer>
    );
  }

  const upcomingBookings = bookings?.filter(
    (b) => b.status === "pending" || b.status === "confirmed"
  ) || [];

  const pastBookings = bookings?.filter(
    (b) => b.status === "completed" || b.status === "cancelled"
  ) || [];

  return (
    <MobileContainer>
      {/* Header */}
      <header className="px-6 pt-8 pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground" data-testid="text-bookings-title">
          Moje rezervacije
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pregled svih vaših zakazanih termina
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-24 scroll-smooth">
        {bookings?.length === 0 ? (
          <NoBookingsEmptyState />
        ) : (
          <>
            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
                  Nadolazeće
                </h2>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 bg-card rounded-2xl soft-shadow border border-border"
                      data-testid={`booking-card-${booking.id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-base font-bold text-foreground">
                            {booking.business?.name || "Biznis"}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={statusColors[booking.status]}
                          >
                            {statusLabels[booking.status]}
                          </Badge>
                        </div>
                        {(booking.status === "pending" || booking.status === "confirmed") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => cancelBookingMutation.mutate(booking.id)}
                            disabled={cancelBookingMutation.isPending}
                            data-testid={`button-cancel-${booking.id}`}
                            aria-label="Otkaži rezervaciju"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(booking.date).toLocaleDateString("sr-Latn", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{booking.time}</span>
                        </div>
                        {booking.business?.address && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{booking.business.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
                  Prošle
                </h2>
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 bg-card rounded-2xl soft-shadow border border-border opacity-75"
                      data-testid={`booking-card-${booking.id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-base font-bold text-foreground">
                            {booking.business?.name || "Biznis"}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={statusColors[booking.status]}
                          >
                            {statusLabels[booking.status]}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(booking.date).toLocaleDateString("sr-Latn")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{booking.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <BottomNavigation />
    </MobileContainer>
  );
}
