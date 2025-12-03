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
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  completed: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800",
  cancelled: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
};

const statusLabels: Record<string, string> = {
  pending: "Na čekanju",
  confirmed: "Potvrđeno",
  completed: "Završeno",
  cancelled: "Otkazano",
};

function getStatusColor(status: string | null): string {
  return status ? (statusColors[status] || statusColors.pending) : statusColors.pending;
}

function getStatusLabel(status: string | null): string {
  return status ? (statusLabels[status] || statusLabels.pending) : statusLabels.pending;
}

export default function UserBookings() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Potrebna prijava",
        description: "Morate se prijaviti da vidite rezervacije",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
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
          window.location.href = "/login";
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
      <header className="px-5 pt-6 pb-4 border-b border-border">
        <h1 className="text-xl font-semibold tracking-tight text-foreground" data-testid="text-bookings-title">
          Moje rezervacije
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Pregled vaših zakazanih termina
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-5 py-5 pb-20 scroll-smooth">
        {bookings?.length === 0 ? (
          <NoBookingsEmptyState />
        ) : (
          <>
            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Nadolazeće
                </h2>
                <div className="space-y-3">
                  {upcomingBookings.map((booking, index) => (
                    <div
                      key={booking.id}
                      className="p-4 bg-card rounded-xl border border-border stagger-item card-press"
                      style={{ animationDelay: `${index * 50}ms` }}
                      data-testid={`booking-card-${booking.id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">
                            {booking.business?.name || "Biznis"}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`mt-1 text-[10px] font-medium border ${getStatusColor(booking.status)}`}
                          >
                            {getStatusLabel(booking.status)}
                          </Badge>
                        </div>
                        {(booking.status === "pending" || booking.status === "confirmed") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-destructive"
                            onClick={() => cancelBookingMutation.mutate(booking.id)}
                            disabled={cancelBookingMutation.isPending}
                            data-testid={`button-cancel-${booking.id}`}
                            aria-label="Otkaži rezervaciju"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(booking.date).toLocaleDateString("sr-Latn", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{booking.time}</span>
                        </div>
                        {booking.business?.address && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{booking.business.address}</span>
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
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Prošle
                </h2>
                <div className="space-y-3">
                  {pastBookings.map((booking, index) => (
                    <div
                      key={booking.id}
                      className="p-4 bg-card rounded-xl border border-border opacity-60 stagger-item"
                      style={{ animationDelay: `${index * 50}ms` }}
                      data-testid={`booking-card-${booking.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">
                            {booking.business?.name || "Biznis"}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`mt-1 text-[10px] font-medium border ${getStatusColor(booking.status)}`}
                          >
                            {getStatusLabel(booking.status)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(booking.date).toLocaleDateString("sr-Latn")}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
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
