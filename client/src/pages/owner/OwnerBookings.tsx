import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  Check, 
  X, 
  User,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import OwnerLayout from "./OwnerLayout";
import type { Business, Booking, User as UserType } from "@shared/schema";

interface BookingWithDetails extends Booking {
  user?: UserType;
  service?: { name: string; price: string };
  employee?: { name: string };
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
  completed: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400",
  cancelled: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabels: Record<string, string> = {
  pending: "Na čekanju",
  confirmed: "Potvrđeno",
  completed: "Završeno",
  cancelled: "Otkazano",
};

export default function OwnerBookings() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: businesses, isLoading: businessesLoading } = useQuery<Business[]>({
    queryKey: ["/api/owner/businesses"],
    enabled: isAuthenticated,
  });

  const selectedBusiness = businesses?.[0];

  const { data: bookings, isLoading: bookingsLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/owner/businesses", selectedBusiness?.id, "bookings", selectedDate],
    enabled: !!selectedBusiness?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      return apiRequest("PATCH", `/api/owner/bookings/${bookingId}/status`, { status });
    },
    onSuccess: () => {
      toast({ title: "Status ažuriran" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses", selectedBusiness?.id, "bookings", selectedDate] });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/stats"] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const navigateDate = (direction: "prev" | "next") => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const filteredBookings = bookings?.filter(booking => {
    if (statusFilter === "all") return true;
    return booking.status === statusFilter;
  });

  if (businessesLoading) {
    return (
      <OwnerLayout title="Rezervacije">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Rezervacije" subtitle="Pregledajte i upravljajte rezervacijama">
      <div className="space-y-6">
        {/* Date Navigation & Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Date Navigator */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate("prev")}
                data-testid="button-prev-date"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
                data-testid="input-date"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate("next")}
                data-testid="button-next-date"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Date Buttons */}
            <div className="flex gap-2">
              <Button
                variant={selectedDate === new Date().toISOString().split("T")[0] ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
              >
                Danas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setSelectedDate(tomorrow.toISOString().split("T")[0]);
                }}
              >
                Sutra
              </Button>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 ml-auto">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve</SelectItem>
                  <SelectItem value="pending">Na čekanju</SelectItem>
                  <SelectItem value="confirmed">Potvrđeno</SelectItem>
                  <SelectItem value="completed">Završeno</SelectItem>
                  <SelectItem value="cancelled">Otkazano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Date Display */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">
            {new Date(selectedDate).toLocaleDateString("sr-Latn", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredBookings?.length || 0} rezervacija
          </p>
        </div>

        {/* Bookings List */}
        {bookingsLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : !filteredBookings || filteredBookings.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Nema rezervacija</h3>
            <p className="text-sm text-muted-foreground">
              Za ovaj dan nema {statusFilter !== "all" ? `${statusLabels[statusFilter].toLowerCase()} ` : ""}rezervacija
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((booking) => (
                <Card key={booking.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Time & Status */}
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <p className="text-xl font-bold text-foreground">{booking.time}</p>
                        {booking.endTime && (
                          <p className="text-xs text-muted-foreground">do {booking.endTime}</p>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${statusColors[booking.status || "pending"]}`}
                      >
                        {statusLabels[booking.status || "pending"]}
                      </Badge>
                    </div>

                    {/* Customer Info */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {booking.user?.firstName} {booking.user?.lastName}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {booking.user?.phone && (
                          <a href={`tel:${booking.user.phone}`} className="flex items-center gap-1 hover:text-foreground">
                            <Phone className="w-3.5 h-3.5" />
                            {booking.user.phone}
                          </a>
                        )}
                        {booking.user?.email && (
                          <a href={`mailto:${booking.user.email}`} className="flex items-center gap-1 hover:text-foreground">
                            <Mail className="w-3.5 h-3.5" />
                            {booking.user.email}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Service & Employee */}
                    <div className="min-w-[150px]">
                      {booking.service && (
                        <p className="font-medium text-foreground">{booking.service.name}</p>
                      )}
                      {booking.employee && (
                        <p className="text-sm text-muted-foreground">
                          Izvršilac: {booking.employee.name}
                        </p>
                      )}
                      {booking.totalPrice && (
                        <p className="text-sm font-medium text-primary mt-1">
                          {booking.totalPrice} KM
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ 
                              bookingId: booking.id, 
                              status: "confirmed" 
                            })}
                            disabled={updateStatusMutation.isPending}
                            className="gap-1"
                            data-testid={`button-confirm-${booking.id}`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            Potvrdi
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive gap-1"
                            onClick={() => updateStatusMutation.mutate({ 
                              bookingId: booking.id, 
                              status: "cancelled" 
                            })}
                            disabled={updateStatusMutation.isPending}
                            data-testid={`button-cancel-${booking.id}`}
                          >
                            <X className="w-3.5 h-3.5" />
                            Odbij
                          </Button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ 
                            bookingId: booking.id, 
                            status: "completed" 
                          })}
                          disabled={updateStatusMutation.isPending}
                          className="gap-1"
                          data-testid={`button-complete-${booking.id}`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Završi
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {booking.notes && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Napomena:</span> {booking.notes}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
