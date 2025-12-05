import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingScreen } from "@/components/LoadingSpinner";
import {
  LayoutDashboard,
  Building2,
  Clock,
  Users,
  Scissors,
  Calendar,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronDown,
  Image,
  MapPin,
  LogOut,
} from "lucide-react";
import type { Business } from "@shared/schema";

interface OwnerLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const menuItems = [
  { href: "/owner", icon: LayoutDashboard, label: "Pregled", exact: true },
  { href: "/owner/profile", icon: Building2, label: "Profil salona" },
  { href: "/owner/gallery", icon: Image, label: "Galerija slika" },
  { href: "/owner/location", icon: MapPin, label: "Lokacija i mapa" },
  { href: "/owner/hours", icon: Clock, label: "Radno vrijeme" },
  { href: "/owner/employees", icon: Users, label: "Zaposleni" },
  { href: "/owner/services", icon: Scissors, label: "Usluge" },
  { href: "/owner/bookings", icon: Calendar, label: "Rezervacije" },
  { href: "/owner/analytics", icon: BarChart3, label: "Analitika" },
  { href: "/owner/settings", icon: Settings, label: "Postavke" },
];

export default function OwnerLayout({ children, title, subtitle }: OwnerLayoutProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading, logout, isLoggingOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  const { data: businesses, isLoading: businessesLoading } = useQuery<Business[]>({
    queryKey: ["/api/owner/businesses"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (businesses && businesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(businesses[0].id);
    }
  }, [businesses, selectedBusinessId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Potrebna prijava",
        description: "Morate se prijaviti da pristupite panelu vlasnika",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    if (!authLoading && user && user.role !== "business_owner" && user.role !== "admin") {
      toast({
        title: "Nemate pristup",
        description: "Samo vlasnici biznisa mogu pristupiti ovom panelu",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [user, authLoading, toast]);

  const handleLogout = () => {
    logout({
      onSuccess: () => {
        toast({
          title: "Uspješna odjava",
          description: "Vidimo se uskoro!",
        });
      },
    });
  };

  if (authLoading || businessesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  const selectedBusiness = businesses?.find(b => b.id === selectedBusinessId);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-card border-r border-border
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Brand */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <Link href="/owner">
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-semibold text-foreground">MojTermin</span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Business Selector */}
          {businesses && businesses.length > 0 && (
            <div className="p-4 border-b border-border">
              <label className="text-xs text-muted-foreground mb-2 block">Izabrani salon</label>
              <Button
                variant="outline"
                className="w-full justify-between text-sm"
                onClick={() => {
                  const currentIndex = businesses.findIndex(b => b.id === selectedBusinessId);
                  const nextIndex = (currentIndex + 1) % businesses.length;
                  setSelectedBusinessId(businesses[nextIndex].id);
                }}
                data-testid="button-select-business"
              >
                <span className="truncate">{selectedBusiness?.name || "Izaberi salon"}</span>
                <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
              </Button>
            </div>
          )}

          {/* Navigation */}
          <ScrollArea className="flex-1 p-3">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = item.exact 
                  ? location === item.href 
                  : location.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start gap-3 ${
                        isActive ? "bg-primary/10 text-primary" : ""
                      }`}
                      onClick={() => setSidebarOpen(false)}
                      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user?.firstName?.[0] || "V"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full gap-2 text-sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              data-testid="button-owner-logout"
            >
              <LogOut className="w-4 h-4" />
              Odjava
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              data-testid="button-toggle-sidebar"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg lg:text-xl font-semibold text-foreground" data-testid="text-page-title">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {!businesses || businesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Nemate registrovan salon</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Kreirajte svoj prvi salon da počnete primati rezervacije
              </p>
              <Link href="/admin/create-business">
                <Button className="gap-2" data-testid="button-create-first-business">
                  <Building2 className="w-4 h-4" />
                  Kreiraj salon
                </Button>
              </Link>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
