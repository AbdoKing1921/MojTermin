import { useQuery, useMutation } from "@tanstack/react-query";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Users, Shield, Store, User as UserIcon } from "lucide-react";
import { Link } from "wouter";
import type { User } from "@shared/schema";

const roleLabels: Record<string, string> = {
  customer: "Korisnik",
  business_owner: "Vlasnik biznisa",
  admin: "Administrator",
};

const roleBadgeVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  customer: "secondary",
  business_owner: "default",
  admin: "destructive",
};

const roleIcons: Record<string, typeof UserIcon> = {
  customer: UserIcon,
  business_owner: Store,
  admin: Shield,
};

export default function AdminUsers() {
  const { toast } = useToast();

  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/superadmin/users"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return apiRequest("PATCH", `/api/superadmin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/users"] });
      toast({
        title: "Uloga ažurirana",
        description: "Korisnička uloga je uspješno promijenjena.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Greška",
        description: error.message || "Nije moguće ažurirati ulogu.",
        variant: "destructive",
      });
    },
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  if (error) {
    return (
      <MobileContainer>
        <div className="px-5 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Upravljanje korisnicima</h1>
          </div>
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive text-center">
                Nemate pristup ovoj stranici. Samo administratori mogu upravljati korisnicima.
              </p>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="px-5 py-6 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold" data-testid="text-page-title">Upravljanje korisnicima</h1>
            <p className="text-sm text-muted-foreground">Dodjeli ovlasti korisnicima</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Ukupno korisnika: {users?.length || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Badge variant="destructive" className="h-5 px-1.5">
                  {users?.filter(u => u.role === "admin").length || 0}
                </Badge>
                <span className="text-muted-foreground">Admini</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="default" className="h-5 px-1.5">
                  {users?.filter(u => u.role === "business_owner").length || 0}
                </Badge>
                <span className="text-muted-foreground">Vlasnici</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="h-5 px-1.5">
                  {users?.filter(u => u.role === "customer").length || 0}
                </Badge>
                <span className="text-muted-foreground">Korisnici</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-3">
            {users?.map((user) => {
              const RoleIcon = roleIcons[user.role || "customer"] || UserIcon;
              return (
                <Card key={user.id} data-testid={`card-user-${user.id}`}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <RoleIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium truncate" data-testid={`text-user-name-${user.id}`}>
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate" data-testid={`text-user-email-${user.id}`}>
                          {user.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={roleBadgeVariants[user.role || "customer"]}>
                            {roleLabels[user.role || "customer"]}
                          </Badge>
                          {user.phone && (
                            <span className="text-xs text-muted-foreground">{user.phone}</span>
                          )}
                        </div>
                      </div>
                      <Select
                        value={user.role || "customer"}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                        disabled={updateRoleMutation.isPending}
                      >
                        <SelectTrigger className="w-[140px]" data-testid={`select-role-${user.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Korisnik</SelectItem>
                          <SelectItem value="business_owner">Vlasnik biznisa</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <BottomNavigation />
    </MobileContainer>
  );
}
