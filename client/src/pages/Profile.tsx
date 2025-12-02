import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LogOut, User as UserIcon, Mail, Phone, Building2, Calendar, Settings } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { LoadingScreen } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { User, Booking } from "@shared/schema";
import { Link } from "wouter";

export default function Profile() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Potrebna prijava",
        description: "Morate se prijaviti da vidite profil",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: bookingStats } = useQuery<{ total: number; upcoming: number }>({
    queryKey: ["/api/bookings/stats"],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <MobileContainer>
        <LoadingScreen />
      </MobileContainer>
    );
  }

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName || user?.email?.split("@")[0] || "Korisnik";

  return (
    <MobileContainer>
      {/* Header */}
      <header className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-profile-title">
            Profil
          </h1>
          <a href="/api/logout">
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              data-testid="button-logout"
              aria-label="Odjava"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 pb-24 scroll-smooth">
        {/* Profile Card */}
        <div className="bg-card rounded-3xl p-6 soft-shadow mb-6 text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarImage 
              src={user?.profileImageUrl || undefined} 
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {displayName[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-xl font-bold text-foreground mb-1" data-testid="text-user-name">
            {displayName}
          </h2>
          {user?.email && (
            <p className="text-sm text-muted-foreground" data-testid="text-user-email">
              {user.email}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-2xl p-4 soft-shadow text-center">
            <p className="text-2xl font-bold text-primary" data-testid="text-total-bookings">
              {bookingStats?.total || 0}
            </p>
            <p className="text-xs text-muted-foreground">Ukupno rezervacija</p>
          </div>
          <div className="bg-card rounded-2xl p-4 soft-shadow text-center">
            <p className="text-2xl font-bold text-primary" data-testid="text-upcoming-bookings">
              {bookingStats?.upcoming || 0}
            </p>
            <p className="text-xs text-muted-foreground">Nadolazeće</p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-card rounded-2xl soft-shadow overflow-hidden mb-6">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Mail className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email || "Nije postavljeno"}
              </p>
            </div>
          </div>
          
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Phone className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Telefon</p>
              <p className="text-sm font-medium text-foreground">
                {user?.phone || "Nije postavljeno"}
              </p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Član od</p>
              <p className="text-sm font-medium text-foreground">
                {user?.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString("sr-Latn", {
                      year: "numeric",
                      month: "long",
                    })
                  : "Nepoznato"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Link href="/bookings">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-12"
              data-testid="link-my-bookings"
            >
              <Calendar className="w-5 h-5" />
              Moje rezervacije
            </Button>
          </Link>
          
          {user?.role === "business_owner" && (
            <Link href="/admin">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
                data-testid="link-admin-panel"
              >
                <Building2 className="w-5 h-5" />
                Admin panel
              </Button>
            </Link>
          )}
        </div>
      </main>

      <BottomNavigation />
    </MobileContainer>
  );
}
