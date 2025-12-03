import { User } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileHeader() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <a
        href="/login"
        className="focus-ring w-9 h-9 rounded-lg bg-secondary flex items-center justify-center border border-border"
        data-testid="button-login"
        aria-label="Prijava"
      >
        <User className="w-4 h-4 text-muted-foreground" />
      </a>
    );
  }

  return (
    <Link
      href="/profile"
      className="focus-ring"
      data-testid="link-profile"
      aria-label="Profil"
    >
      <Avatar className="w-9 h-9">
        <AvatarImage 
          src={user?.profileImageUrl || undefined} 
          alt={user?.firstName || "Korisnik"} 
          className="object-cover"
        />
        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
          {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "K"}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}
