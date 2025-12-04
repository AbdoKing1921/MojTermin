import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Clock, Users, DollarSign, Check, X, Plus, Building2, ArrowLeft, CalendarOff, Trash2, ChevronLeft, ChevronRight, BarChart3, Shield, Settings } from "lucide-react";
import { Link } from "wouter";
import { MobileContainer } from "@/components/MobileContainer";
import { LoadingScreen } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Business, Booking, User, BlockedSlot } from "@shared/schema";

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
  const [activeTab, setActiveTab] = useState<"bookings" | "availability">("bookings");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [blockStartTime, setBlockStartTime] = useState("09:00");
  const [blockEndTime, setBlockEndTime] = useState("10:00");
  const [blockReason, setBlockReason] = useState("");

  const { data: businesses, isLoading: businessesLoading } = useQuery<Business[]>({
    queryKey: ["/api/admin/businesses"],
    enabled: isAuthenticated,
  });

  const { data: stats } = useQuery<OwnerStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<BookingWithUser[]>({
    queryKey: [`/api/admin/businesses/${selectedBusiness}/bookings`],
    enabled: !!selectedBusiness,
  });

  const { data: blockedSlots } = useQuery<BlockedSlot[]>({
    queryKey: [`/api/admin/businesses/${selectedBusiness}/blocked-slots`, selectedDate],
    queryFn: async () => {
      const startDate = new Date(selectedDate);
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 30);
      const response = await fetch(
        `/api/admin/businesses/${selectedBusiness}/blocked-slots?startDate=${startDate.toISOString().split("T")[0]}&endDate=${endDate.toISOString().split("T")[0]}`,
        { credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to fetch blocked slots");
      return response.json();
    },
    enabled: !!selectedBusiness,
  });

  useEffect(() => {
    if (businesses && businesses.length > 0 && !selectedBusiness) {
      setSelectedBusiness(businesses[0].id);
    }
  }, [businesses, selectedBusiness]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Potrebna prijava",
        description: "Morate se prijaviti da pristupite panelu",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      return apiRequest("PATCH", `/api/admin/bookings/${bookingId}/status`, { status });
    },
    onSuccess: () => {
      toast({ title: "Status ažuriran" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/businesses/${selectedBusiness}/bookings`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/login";
        return;
      }
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const blockSlotMutation = useMutation({
    mutationFn: async (data: { date: string; startTime: string; endTime: string; reason?: string }) => {
      return apiRequest("POST", `/api/admin/businesses/${selectedBusiness}/block-slot`, data);
    },
    onSuccess: () => {
      toast({ title: "Termin blokiran", description: "Termin je uspješno blokiran" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/businesses/${selectedBusiness}/blocked-slots`, selectedDate] });
      setBlockReason("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/login";
        return;
      }
      toast({ title: "Greška", description: "Nije moguće blokirati termin", variant: "destructive" });
    },
  });

  const deleteBlockedSlotMutation = useMutation({
    mutationFn: async (slotId: string) => {
      return apiRequest("DELETE", `/api/admin/blocked-slots/${slotId}`);
    },
    onSuccess: () => {
      toast({ title: "Blokada uklonjena" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/businesses/${selectedBusiness}/blocked-slots`, selectedDate] });
    },
    onError: () => {
      toast({ title: "Greška", description: "Nije moguće ukloniti blokadu", variant: "destructive" });
    },
  });

  const handleBlockSlot = () => {
    if (!selectedDate || !blockStartTime || !blockEndTime) return;
    if (blockStartTime >= blockEndTime) {
      toast({ title: "Greška", description: "Završno vrijeme mora biti nakon početnog", variant: "destructive" });
      return;
    }
    blockSlotMutation.mutate({
      date: selectedDate,
      startTime: blockStartTime,
      endTime: blockEndTime,
      reason: blockReason || undefined,
    });
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const time = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
        times.push(time);
      }
    }
    return times;
  };

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
        {/* Super Admin Buttons - Always visible for admins */}
        {user?.role === "admin" && (
          <div className="mb-6 space-y-3">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Glavni Administrator
            </h2>
            <Link href="/admin/businesses">
              <Button variant="outline" className="w-full gap-2 border-primary/30 text-primary" data-testid="button-approve-businesses">
                <Building2 className="w-4 h-4" />
                Odobravanje salona
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full gap-2 border-primary/30 text-primary" data-testid="button-manage-users">
                <Shield className="w-4 h-4" />
                Upravljanje korisnicima
              </Button>
            </Link>
          </div>
        )}

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
            <div className="mb-4">
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

            {/* Business Management Links */}
            {selectedBusiness && (
              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <Link href={`/admin/business/${selectedBusiness}/edit`}>
                    <Button variant="outline" className="w-full text-xs gap-1.5 border-primary/30 text-primary" data-testid="button-edit-business">
                      <Settings className="w-3.5 h-3.5" />
                      Uredi biznis
                    </Button>
                  </Link>
                  <Link href={`/admin/business/${selectedBusiness}/employees`}>
                    <Button variant="outline" className="w-full text-xs gap-1.5" data-testid="button-manage-employees">
                      <Users className="w-3.5 h-3.5" />
                      Zaposleni
                    </Button>
                  </Link>
                  <Link href={`/admin/business/${selectedBusiness}/schedule`}>
                    <Button variant="outline" className="w-full text-xs gap-1.5" data-testid="button-manage-schedule">
                      <Clock className="w-3.5 h-3.5" />
                      Radno vrijeme
                    </Button>
                  </Link>
                  <Link href="/admin/analytics">
                    <Button variant="outline" className="w-full text-xs gap-1.5" data-testid="button-analytics">
                      <BarChart3 className="w-3.5 h-3.5" />
                      Analitika
                    </Button>
                  </Link>
                </div>
                <Link href="/admin/create-business">
                  <Button variant="outline" className="w-full text-xs gap-1.5" data-testid="button-new-business">
                    <Plus className="w-3.5 h-3.5" />
                    Novi biznis
                  </Button>
                </Link>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={activeTab === "bookings" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("bookings")}
                className="text-xs gap-1.5"
                data-testid="tab-bookings"
              >
                <Calendar className="w-3.5 h-3.5" />
                Rezervacije
              </Button>
              <Button
                variant={activeTab === "availability" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("availability")}
                className="text-xs gap-1.5"
                data-testid="tab-availability"
              >
                <CalendarOff className="w-3.5 h-3.5" />
                Dostupnost
              </Button>
            </div>

            {/* Bookings List */}
            {activeTab === "bookings" && selectedBusiness && (
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

            {/* Availability Calendar */}
            {activeTab === "availability" && selectedBusiness && (
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-3">Upravljanje dostupnošću</h2>
                
                {/* Date Navigator */}
                <div className="flex items-center justify-between mb-4 bg-card rounded-xl p-3 border border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const date = new Date(selectedDate);
                      date.setDate(date.getDate() - 1);
                      setSelectedDate(date.toISOString().split("T")[0]);
                    }}
                    data-testid="button-prev-day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      {new Date(selectedDate).toLocaleDateString("sr-Latn", { 
                        weekday: "long", 
                        day: "numeric", 
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const date = new Date(selectedDate);
                      date.setDate(date.getDate() + 1);
                      setSelectedDate(date.toISOString().split("T")[0]);
                    }}
                    data-testid="button-next-day"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Block Slot Form */}
                <div className="bg-card rounded-xl p-4 border border-border mb-4">
                  <h3 className="text-xs font-semibold text-foreground mb-3">Blokiraj termin</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">Od</label>
                      <Select value={blockStartTime} onValueChange={setBlockStartTime}>
                        <SelectTrigger className="h-9 text-xs" data-testid="select-start-time">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {generateTimeOptions().map((time) => (
                            <SelectItem key={time} value={time} className="text-xs">
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">Do</label>
                      <Select value={blockEndTime} onValueChange={setBlockEndTime}>
                        <SelectTrigger className="h-9 text-xs" data-testid="select-end-time">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {generateTimeOptions().map((time) => (
                            <SelectItem key={time} value={time} className="text-xs">
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="text-[10px] text-muted-foreground mb-1 block">Razlog (opcionalno)</label>
                    <Input
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="npr. Pauza za ručak"
                      className="h-9 text-xs"
                      data-testid="input-block-reason"
                    />
                  </div>
                  <Button
                    onClick={handleBlockSlot}
                    disabled={blockSlotMutation.isPending}
                    className="w-full text-xs"
                    size="sm"
                    data-testid="button-block-slot"
                  >
                    <CalendarOff className="w-3.5 h-3.5 mr-1.5" />
                    {blockSlotMutation.isPending ? "Blokiram..." : "Blokiraj termin"}
                  </Button>
                </div>

                {/* Blocked Slots List */}
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-3">Blokirani termini</h3>
                  {blockedSlots && blockedSlots.length > 0 ? (
                    <div className="space-y-2">
                      {blockedSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="bg-card rounded-lg p-3 border border-border flex items-center justify-between"
                          data-testid={`blocked-slot-${slot.id}`}
                        >
                          <div>
                            <p className="text-xs font-medium text-foreground">
                              {new Date(slot.date).toLocaleDateString("sr-Latn")} • {slot.startTime} - {slot.endTime}
                            </p>
                            {slot.reason && (
                              <p className="text-[10px] text-muted-foreground">{slot.reason}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-destructive hover:text-destructive"
                            onClick={() => deleteBlockedSlotMutation.mutate(slot.id)}
                            disabled={deleteBlockedSlotMutation.isPending}
                            data-testid={`delete-blocked-${slot.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CalendarOff className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Nema blokiranih termina</p>
                      <p className="text-xs text-muted-foreground/60">Blokirajte termine kada niste dostupni</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-border space-y-3">
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full gap-2" data-testid="button-analytics">
                  <BarChart3 className="w-4 h-4" />
                  Izvještaji i analitika
                </Button>
              </Link>
              <Link href="/admin/create-business">
                <Button variant="outline" className="w-full gap-2" data-testid="button-add-business">
                  <Plus className="w-4 h-4" />
                  Dodaj novi biznis
                </Button>
              </Link>
              {user?.role === "admin" && (
                <>
                  <Link href="/admin/businesses">
                    <Button variant="outline" className="w-full gap-2 border-primary/30 text-primary" data-testid="button-approve-businesses">
                      <Building2 className="w-4 h-4" />
                      Odobravanje salona
                    </Button>
                  </Link>
                  <Link href="/admin/users">
                    <Button variant="outline" className="w-full gap-2 border-primary/30 text-primary" data-testid="button-manage-users">
                      <Shield className="w-4 h-4" />
                      Upravljanje korisnicima
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </MobileContainer>
  );
}
