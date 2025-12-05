import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import OwnerLayout from "./OwnerLayout";
import type { Business, Booking } from "@shared/schema";

interface OwnerStats {
  totalBookings: number;
  todayBookings: number;
  pendingBookings: number;
  revenue: number;
}

export default function OwnerDashboard() {
  const { isAuthenticated } = useAuth();

  const { data: businesses } = useQuery<Business[]>({
    queryKey: ["/api/owner/businesses"],
    enabled: isAuthenticated,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<OwnerStats>({
    queryKey: ["/api/owner/stats"],
    enabled: isAuthenticated,
  });

  const { data: recentBookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/owner/recent-bookings"],
    enabled: isAuthenticated && !!businesses?.[0],
  });

  const selectedBusiness = businesses?.[0];

  return (
    <OwnerLayout title="Pregled" subtitle="Dobrodošli u vaš admin panel">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-today-bookings">
                {statsLoading ? <LoadingSpinner /> : stats?.todayBookings || 0}
              </p>
              <p className="text-xs text-muted-foreground">Danas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-pending-bookings">
                {statsLoading ? <LoadingSpinner /> : stats?.pendingBookings || 0}
              </p>
              <p className="text-xs text-muted-foreground">Na čekanju</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-total-bookings">
                {statsLoading ? <LoadingSpinner /> : stats?.totalBookings || 0}
              </p>
              <p className="text-xs text-muted-foreground">Ukupno</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-revenue">
                {statsLoading ? <LoadingSpinner /> : `${stats?.revenue || 0} KM`}
              </p>
              <p className="text-xs text-muted-foreground">Prihod</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Status */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Business Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Status salona
          </h3>
          {selectedBusiness ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Naziv</span>
                <span className="text-sm font-medium text-foreground">{selectedBusiness.name}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  {selectedBusiness.isActive ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-600">Aktivan</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-600">Neaktivan</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Odobrenje</span>
                <div className="flex items-center gap-2">
                  {selectedBusiness.isApproved ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-600">Odobreno</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-600">Čeka odobrenje</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Ocjena</span>
                <span className="text-sm font-medium text-foreground">
                  ⭐ {selectedBusiness.rating || "0"} ({selectedBusiness.reviewCount || 0} recenzija)
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nema izabranog salona</p>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Nedavne rezervacije
          </h3>
          {bookingsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : recentBookings && recentBookings.length > 0 ? (
            <div className="space-y-3">
              {recentBookings.slice(0, 5).map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(booking.date).toLocaleDateString("sr-Latn")}
                    </p>
                    <p className="text-xs text-muted-foreground">{booking.time}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    booking.status === "confirmed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                    booking.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                    booking.status === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                    "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                  }`}>
                    {booking.status === "confirmed" ? "Potvrđeno" :
                     booking.status === "pending" ? "Na čekanju" :
                     booking.status === "cancelled" ? "Otkazano" : "Završeno"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Nema nedavnih rezervacija</p>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Brze akcije</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <a href="/owner/profile" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center">
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <span className="text-sm font-medium text-foreground">Uredi profil</span>
          </a>
          <a href="/owner/hours" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center">
            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
            <span className="text-sm font-medium text-foreground">Radno vrijeme</span>
          </a>
          <a href="/owner/employees" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center">
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <span className="text-sm font-medium text-foreground">Zaposleni</span>
          </a>
          <a href="/owner/bookings" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center">
            <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
            <span className="text-sm font-medium text-foreground">Rezervacije</span>
          </a>
        </div>
      </Card>
    </OwnerLayout>
  );
}
