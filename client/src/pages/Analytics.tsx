import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, TrendingUp, DollarSign, CheckCircle, BarChart3, PieChart, Calendar } from "lucide-react";
import { Link } from "wouter";
import { MobileContainer } from "@/components/MobileContainer";
import { LoadingScreen } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface AnalyticsData {
  bookingsByDate: { date: string; count: number; revenue: number }[];
  bookingsByStatus: { status: string; count: number }[];
  bookingsByService: { serviceName: string; count: number; revenue: number }[];
  totalRevenue: number;
  averageBookingValue: number;
  completionRate: number;
}

const statusLabels: Record<string, string> = {
  pending: "Na čekanju",
  confirmed: "Potvrđeno",
  completed: "Završeno",
  cancelled: "Otkazano",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500",
  confirmed: "bg-emerald-500",
  completed: "bg-sky-500",
  cancelled: "bg-red-500",
};

export default function Analytics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [dateRange, setDateRange] = useState<"7" | "30" | "90">("30");

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - parseInt(dateRange));
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics", dateRange],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      const response = await fetch(
        `/api/admin/analytics?startDate=${startDate}&endDate=${endDate}`,
        { credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Potrebna prijava",
        description: "Morate se prijaviti da pristupite analitici",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || isLoading) {
    return (
      <MobileContainer>
        <LoadingScreen />
      </MobileContainer>
    );
  }

  const maxBookingsPerDay = Math.max(...(analytics?.bookingsByDate.map(d => d.count) || [1]));
  const totalBookings = analytics?.bookingsByStatus.reduce((sum, s) => sum + s.count, 0) || 0;

  return (
    <MobileContainer>
      {/* Header */}
      <header className="px-5 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-lg" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground" data-testid="text-analytics-title">
              Izvještaji
            </h1>
            <p className="text-xs text-muted-foreground">Analitika vašeg poslovanja</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 pb-20 scroll-smooth">
        {/* Date Range Selector */}
        <div className="flex gap-2 mb-6">
          {[
            { value: "7", label: "7 dana" },
            { value: "30", label: "30 dana" },
            { value: "90", label: "90 dana" },
          ].map((range) => (
            <Button
              key={range.value}
              variant={dateRange === range.value ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(range.value as "7" | "30" | "90")}
              className="text-xs flex-1"
              data-testid={`range-${range.value}`}
            >
              {range.label}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Ukupan prihod</span>
            </div>
            <p className="text-2xl font-semibold text-foreground" data-testid="metric-revenue">
              {analytics?.totalRevenue?.toFixed(2) || "0.00"} KM
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-sky-500" />
              <span className="text-xs text-muted-foreground">Prosječna vrijednost</span>
            </div>
            <p className="text-2xl font-semibold text-foreground" data-testid="metric-average">
              {analytics?.averageBookingValue?.toFixed(2) || "0.00"} KM
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Stopa završetka</span>
            </div>
            <p className="text-2xl font-semibold text-foreground" data-testid="metric-completion">
              {analytics?.completionRate?.toFixed(0) || "0"}%
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Ukupno rezervacija</span>
            </div>
            <p className="text-2xl font-semibold text-foreground" data-testid="metric-total">
              {totalBookings}
            </p>
          </Card>
        </div>

        {/* Bookings by Status */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Rezervacije po statusu</h2>
          </div>
          {analytics?.bookingsByStatus && analytics.bookingsByStatus.length > 0 ? (
            <div className="space-y-3">
              {analytics.bookingsByStatus.map((item) => (
                <div key={item.status} data-testid={`status-${item.status}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-foreground">{statusLabels[item.status] || item.status}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.count} ({totalBookings > 0 ? ((item.count / totalBookings) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                  <Progress 
                    value={totalBookings > 0 ? (item.count / totalBookings) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Nema podataka</p>
          )}
        </Card>

        {/* Top Services */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Najpopularnije usluge</h2>
          </div>
          {analytics?.bookingsByService && analytics.bookingsByService.length > 0 ? (
            <div className="space-y-3">
              {analytics.bookingsByService.slice(0, 5).map((item, index) => (
                <div 
                  key={item.serviceName} 
                  className="flex items-center justify-between"
                  data-testid={`service-${index}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm text-foreground">{item.serviceName}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{item.count} rez.</p>
                    <p className="text-[10px] text-muted-foreground">{item.revenue.toFixed(2)} KM</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Nema podataka</p>
          )}
        </Card>

        {/* Daily Bookings Chart */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Rezervacije po danima</h2>
          </div>
          {analytics?.bookingsByDate && analytics.bookingsByDate.length > 0 ? (
            <div className="space-y-2">
              {analytics.bookingsByDate.slice(-10).map((item) => (
                <div key={item.date} className="flex items-center gap-3" data-testid={`date-${item.date}`}>
                  <span className="text-[10px] text-muted-foreground w-16 flex-shrink-0">
                    {new Date(item.date).toLocaleDateString("sr-Latn", { day: "numeric", month: "short" })}
                  </span>
                  <div className="flex-1 bg-secondary/50 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${(item.count / maxBookingsPerDay) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-foreground w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Nema podataka za odabrani period</p>
          )}
        </Card>
      </main>
    </MobileContainer>
  );
}
