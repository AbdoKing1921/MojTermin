import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import OwnerLayout from "./OwnerLayout";
import type { Business } from "@shared/schema";

interface AnalyticsData {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  completionRate: number;
  bookingsByDay: { date: string; count: number }[];
  bookingsByService: { service: string; count: number; revenue: number }[];
  topEmployees: { name: string; bookings: number; revenue: number }[];
}

export default function OwnerAnalytics() {
  const { isAuthenticated } = useAuth();
  const [dateRange, setDateRange] = useState<"7" | "30" | "90">("30");

  const { data: businesses, isLoading: businessesLoading } = useQuery<Business[]>({
    queryKey: ["/api/owner/businesses"],
    enabled: isAuthenticated,
  });

  const selectedBusiness = businesses?.[0];

  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/owner/businesses", selectedBusiness?.id, "analytics", dateRange],
    enabled: !!selectedBusiness?.id,
  });

  if (businessesLoading) {
    return (
      <OwnerLayout title="Analitika">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Analitika" subtitle="Pratite performanse vašeg salona">
      <div className="space-y-6">
        {/* Date Range Selector */}
        <div className="flex gap-2">
          {[
            { value: "7", label: "7 dana" },
            { value: "30", label: "30 dana" },
            { value: "90", label: "90 dana" },
          ].map((option) => (
            <Button
              key={option.value}
              variant={dateRange === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(option.value as "7" | "30" | "90")}
              data-testid={`button-range-${option.value}`}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {analyticsLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground" data-testid="metric-total-bookings">
                      {analytics?.totalBookings || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Ukupno rezervacija</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground" data-testid="metric-revenue">
                      {analytics?.totalRevenue || 0} KM
                    </p>
                    <p className="text-xs text-muted-foreground">Ukupan prihod</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground" data-testid="metric-avg-value">
                      {analytics?.averageBookingValue?.toFixed(2) || 0} KM
                    </p>
                    <p className="text-xs text-muted-foreground">Prosječna vrijednost</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground" data-testid="metric-completion-rate">
                      {analytics?.completionRate?.toFixed(0) || 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Stopa završetka</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Booking Status Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Status rezervacija
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-700 dark:text-emerald-400">Potvrđeno</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                    {analytics?.confirmedBookings || 0}
                  </p>
                </div>
                <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-sky-600" />
                    <span className="text-sm text-sky-700 dark:text-sky-400">Završeno</span>
                  </div>
                  <p className="text-2xl font-bold text-sky-700 dark:text-sky-400">
                    {analytics?.completedBookings || 0}
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700 dark:text-red-400">Otkazano</span>
                  </div>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {analytics?.cancelledBookings || 0}
                  </p>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-700 dark:text-amber-400">Na čekanju</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                    {(analytics?.totalBookings || 0) - 
                     (analytics?.confirmedBookings || 0) - 
                     (analytics?.completedBookings || 0) - 
                     (analytics?.cancelledBookings || 0)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Services Performance */}
            {analytics?.bookingsByService && analytics.bookingsByService.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Najpopularnije usluge
                </h3>
                <div className="space-y-3">
                  {analytics.bookingsByService.slice(0, 5).map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                          {index + 1}
                        </span>
                        <span className="font-medium text-foreground">{service.service}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{service.count} rez.</p>
                        <p className="text-xs text-muted-foreground">{service.revenue} KM</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Top Employees */}
            {analytics?.topEmployees && analytics.topEmployees.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Najbolji zaposleni
                </h3>
                <div className="space-y-3">
                  {analytics.topEmployees.slice(0, 5).map((employee, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                          {index + 1}
                        </span>
                        <span className="font-medium text-foreground">{employee.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{employee.bookings} rez.</p>
                        <p className="text-xs text-muted-foreground">{employee.revenue} KM</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Empty State */}
            {(!analytics || analytics.totalBookings === 0) && (
              <Card className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Nema podataka</h3>
                <p className="text-sm text-muted-foreground">
                  Nema dovoljno podataka za prikaz analitike za izabrani period.
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </OwnerLayout>
  );
}
