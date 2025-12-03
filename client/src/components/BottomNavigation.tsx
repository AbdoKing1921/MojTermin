import { Home, Search, User, Calendar } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Početna", path: "/" },
  { icon: Search, label: "Pretraga", path: "/search" },
  { icon: Calendar, label: "Rezervacije", path: "/bookings", requiresAuth: true },
  { icon: User, label: "Profil", path: "/profile", requiresAuth: true },
];

export function BottomNavigation() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card/95 backdrop-blur-sm border-t border-border px-4 py-2 flex items-center justify-around z-50">
      {navItems.map((item) => {
        const isActive = location === item.path || 
          (item.path !== "/" && location.startsWith(item.path));
        const Icon = item.icon;
        
        if (item.requiresAuth && !isAuthenticated) {
          return (
            <a
              key={item.path}
              href="/api/login"
              className="focus-ring flex flex-col items-center gap-0.5 py-2 px-4 rounded-lg transition-colors nav-btn"
              data-testid={`nav-${item.label.toLowerCase()}`}
              aria-label={item.label}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </a>
          );
        }

        return (
          <Link
            key={item.path}
            href={item.path}
            className={`focus-ring flex flex-col items-center gap-0.5 py-2 px-4 rounded-lg transition-colors nav-btn ${isActive ? "active" : ""}`}
            data-testid={`nav-${item.label.toLowerCase()}`}
            aria-label={item.label}
          >
            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
