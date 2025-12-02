import { User } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileHeader() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <a
        href="/api/login"
        className="focus-ring w-11 h-11 rounded-full bg-secondary flex items-center justify-center"
        data-testid="button-login"
        aria-label="Prijava"
      >
        <User className="w-5 h-5 text-muted-foreground" />
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
      <Avatar className="w-11 h-11">
        <AvatarImage 
          src={user?.profileImageUrl || undefined} 
          alt={user?.firstName || "Korisnik"} 
          className="object-cover"
        />
        <AvatarFallback className="bg-secondary text-muted-foreground">
          {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "K"}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}
