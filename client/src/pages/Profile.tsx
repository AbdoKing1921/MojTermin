import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Mail, Phone, Calendar, Building2, Settings2, ShieldCheck } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { LoadingScreen } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function Profile() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading, logout, isLoggingOut } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated && !isLoggingOut) {
      toast({
        title: "Potrebna prijava",
        description: "Morate se prijaviti da vidite profil",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, isLoggingOut, toast]);

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
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-foreground" data-testid="text-profile-title">
          Profil
        </h1>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 text-muted-foreground hover:text-destructive"
          data-testid="button-logout"
          aria-label="Odjava"
          onClick={() => logout({
            onSuccess: () => {
              toast({
                title: "Uspješna odjava",
                description: "Vidimo se uskoro!",
              });
            },
            onError: () => {
              toast({
                title: "Greška",
                description: "Nije moguće odjaviti se. Pokušajte ponovo.",
                variant: "destructive",
              });
            },
          })}
          disabled={isLoggingOut}
        >
          <LogOut className={`w-4 h-4 ${isLoggingOut ? 'animate-spin' : ''}`} />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-5 pb-20 scroll-smooth">
        {/* Profile Card */}
        <div className="bg-card rounded-xl p-5 border border-border mb-5 text-center">
          <Avatar className="w-16 h-16 mx-auto mb-3">
            <AvatarImage 
              src={user?.profileImageUrl || undefined} 
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {displayName[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-base font-semibold text-foreground" data-testid="text-user-name">
            {displayName}
          </h2>
          {user?.email && (
            <p className="text-xs text-muted-foreground mt-0.5" data-testid="text-user-email">
              {user.email}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <p className="text-2xl font-semibold text-primary" data-testid="text-total-bookings">
              {bookingStats?.total || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Ukupno</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <p className="text-2xl font-semibold text-primary" data-testid="text-upcoming-bookings">
              {bookingStats?.upcoming || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Nadolazeće</p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-card rounded-xl border border-border overflow-hidden mb-5">
          <div className="p-3.5 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Mail className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email || "Nije postavljeno"}
              </p>
            </div>
          </div>
          
          <div className="p-3.5 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Phone className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Telefon</p>
              <p className="text-sm font-medium text-foreground">
                {user?.phone || "Nije postavljeno"}
              </p>
            </div>
          </div>

          <div className="p-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Član od</p>
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
              className="w-full justify-start gap-2 h-11"
              data-testid="link-my-bookings"
            >
              <Calendar className="w-4 h-4" />
              Moje rezervacije
            </Button>
          </Link>
          {(user?.role === 'business_owner' || user?.role === 'admin') && (
            <>
              <Link href="/owner">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 h-11"
                  data-testid="link-owner-panel"
                >
                  <Settings2 className="w-4 h-4" />
                  Moj Salon
                </Button>
              </Link>
              <Link href="/admin">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 h-11"
                  data-testid="link-admin-panel"
                >
                  <Building2 className="w-4 h-4" />
                  Admin Panel
                </Button>
              </Link>
            </>
          )}
          {user?.role === 'admin' && (
            <Link href="/admin/users">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 h-11"
                data-testid="link-superadmin"
              >
                <ShieldCheck className="w-4 h-4" />
                Super Admin
              </Button>
            </Link>
          )}
        </div>
      </main>

      <BottomNavigation />
    </MobileContainer>
  );
}
