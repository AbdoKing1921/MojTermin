import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Clock, Users, DollarSign, Check, X, Plus, Building2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { MobileContainer } from "@/components/MobileContainer";
import { LoadingScreen } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Business, Booking, User } from "@shared/schema";

interface BookingWithUser extends Booking {
  user?: User;
}

interface OwnerStats {
  totalBookings: number;
  todayBookings: number;
  pendingBookings: number;
  revenue: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400",
  completed: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400",
  cancelled: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400",
};

const statusLabels: Record<string, string> = {
  pending: "Na čekanju",
  confirmed: "Potvrđeno",
  completed: "Završeno",
  cancelled: "Otkazano",
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Potrebna prijava",
        description: "Morate se prijaviti da pristupite panelu",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: businesses, isLoading: businessesLoading } = useQuery<Business[]>({
    queryKey: ["/api/admin/businesses"],
    enabled: isAuthenticated,
  });

  const { data: stats } = useQuery<OwnerStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<BookingWithUser[]>({
    queryKey: ["/api/admin/businesses", selectedBusiness, "bookings"],
    enabled: !!selectedBusiness,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      return apiRequest("PATCH", `/api/admin/bookings/${bookingId}/status`, { status });
    },
    onSuccess: () => {
      toast({ title: "Status ažuriran" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses", selectedBusiness, "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  if (authLoading || businessesLoading) {
    return (
      <MobileContainer>
        <LoadingScreen />
      </MobileContainer>
    );
  }

  const hasBusinesses = businesses && businesses.length > 0;

  return (
    <MobileContainer>
      {/* Header */}
      <header className="px-5 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/">
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-lg" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground" data-testid="text-admin-title">
              Admin Panel
            </h1>
            <p className="text-xs text-muted-foreground">Upravljajte vašim biznisima</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 pb-20 scroll-smooth">
        {!hasBusinesses ? (
          /* No businesses - prompt to create one */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Nemate registrovan biznis</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Kreirajte svoj prvi biznis da počnete primati rezervacije
            </p>
            <Link href="/admin/create-business">
              <Button className="gap-2" data-testid="button-create-business">
                <Plus className="w-4 h-4" />
                Kreiraj biznis
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Danas</span>
                </div>
                <p className="text-2xl font-semibold text-foreground" data-testid="stat-today">
                  {stats?.todayBookings || 0}
                </p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground">Na čekanju</span>
                </div>
                <p className="text-2xl font-semibold text-foreground" data-testid="stat-pending">
                  {stats?.pendingBookings || 0}
                </p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">Ukupno</span>
                </div>
                <p className="text-2xl font-semibold text-foreground" data-testid="stat-total">
                  {stats?.totalBookings || 0}
                </p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-sky-500" />
                  <span className="text-xs text-muted-foreground">Prihod</span>
                </div>
                <p className="text-2xl font-semibold text-foreground" data-testid="stat-revenue">
                  {stats?.revenue || 0} KM
                </p>
              </div>
            </div>

            {/* Business Selector */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-foreground mb-3">Vaši biznisi</h2>
              <div className="flex flex-wrap gap-2">
                {businesses.map((business) => (
                  <Button
                    key={business.id}
                    variant={selectedBusiness === business.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedBusiness(business.id)}
                    className="text-xs"
                    data-testid={`business-tab-${business.id}`}
                  >
                    {business.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Bookings List */}
            {selectedBusiness && (
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-3">Rezervacije</h2>
                {bookingsLoading ? (
                  <LoadingScreen />
                ) : !bookings || bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Nema rezervacija za ovaj biznis</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-card rounded-xl p-4 border border-border"
                        data-testid={`admin-booking-${booking.id}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {booking.user?.firstName} {booking.user?.lastName || ""}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {booking.user?.email || booking.user?.phone || "Nema kontakt"}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-medium border ${statusColors[booking.status || "pending"]}`}
                          >
                            {statusLabels[booking.status || "pending"]}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(booking.date).toLocaleDateString("sr-Latn")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{booking.time}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {booking.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 h-8 text-xs"
                              onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: "confirmed" })}
                              disabled={updateStatusMutation.isPending}
                              data-testid={`confirm-${booking.id}`}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Potvrdi
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
                              onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: "cancelled" })}
                              disabled={updateStatusMutation.isPending}
                              data-testid={`cancel-${booking.id}`}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Odbij
                            </Button>
                          </div>
                        )}
                        {booking.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-8 text-xs"
                            onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: "completed" })}
                            disabled={updateStatusMutation.isPending}
                            data-testid={`complete-${booking.id}`}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Označi kao završeno
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Create Business Button */}
            <div className="mt-6 pt-4 border-t border-border">
              <Link href="/admin/create-business">
                <Button variant="outline" className="w-full gap-2" data-testid="button-add-business">
                  <Plus className="w-4 h-4" />
                  Dodaj novi biznis
                </Button>
              </Link>
            </div>
          </>
        )}
      </main>
    </MobileContainer>
  );
}
