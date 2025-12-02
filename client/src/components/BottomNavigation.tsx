import { Home, Search, User, MoreVertical, Calendar } from "lucide-react";
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
    <nav className="absolute bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-3 flex items-center justify-around z-50">
      {navItems.map((item) => {
        const isActive = location === item.path || 
          (item.path !== "/" && location.startsWith(item.path));
        const Icon = item.icon;
        
        if (item.requiresAuth && !isAuthenticated) {
          return (
            <a
              key={item.path}
              href="/api/login"
              className="focus-ring flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors nav-btn"
              data-testid={`nav-${item.label.toLowerCase()}`}
              aria-label={item.label}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={2} />
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          );
        }

        return (
          <Link
            key={item.path}
            href={item.path}
            className={`focus-ring flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors nav-btn ${isActive ? "active" : ""}`}
            data-testid={`nav-${item.label.toLowerCase()}`}
            aria-label={item.label}
          >
            <Icon className="w-[22px] h-[22px]" strokeWidth={2} />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
