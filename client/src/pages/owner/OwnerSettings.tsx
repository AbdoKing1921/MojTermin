import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Settings, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff, 
  Trash2,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import OwnerLayout from "./OwnerLayout";
import type { Business } from "@shared/schema";

export default function OwnerSettings() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: businesses, isLoading: businessesLoading } = useQuery<Business[]>({
    queryKey: ["/api/owner/businesses"],
    enabled: isAuthenticated,
  });

  const selectedBusiness = businesses?.[0];

  const toggleActiveMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      return apiRequest("PATCH", `/api/owner/businesses/${selectedBusiness?.id}/status`, { isActive });
    },
    onSuccess: () => {
      toast({ title: "Status ažuriran" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses"] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  if (businessesLoading) {
    return (
      <OwnerLayout title="Postavke">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Postavke" subtitle="Upravljajte postavkama vašeg salona">
      <div className="space-y-6 max-w-2xl">
        {/* Business Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Vidljivost salona
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Status salona</p>
                <p className="text-sm text-muted-foreground">
                  {selectedBusiness?.isActive 
                    ? "Salon je vidljiv korisnicima i može primati rezervacije"
                    : "Salon nije vidljiv i ne može primati rezervacije"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={selectedBusiness?.isActive ? "default" : "secondary"}>
                  {selectedBusiness?.isActive ? "Aktivan" : "Neaktivan"}
                </Badge>
                <Switch
                  checked={selectedBusiness?.isActive || false}
                  onCheckedChange={(checked) => toggleActiveMutation.mutate(checked)}
                  disabled={toggleActiveMutation.isPending}
                  data-testid="switch-active"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Odobrenje admina</p>
                <p className="text-sm text-muted-foreground">
                  {selectedBusiness?.isApproved 
                    ? "Salon je odobren od strane administratora"
                    : "Čeka se odobrenje administratora"}
                </p>
              </div>
              <Badge 
                variant={selectedBusiness?.isApproved ? "default" : "outline"}
                className={selectedBusiness?.isApproved 
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}
              >
                {selectedBusiness?.isApproved ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Odobreno
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Na čekanju
                  </>
                )}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifikacije
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Email notifikacije</p>
                <p className="text-sm text-muted-foreground">Primajte obavještenja o novim rezervacijama</p>
              </div>
              <Switch defaultChecked data-testid="switch-email-notifications" />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-foreground">SMS notifikacije</p>
                <p className="text-sm text-muted-foreground">Primajte SMS za hitne obavijesti</p>
              </div>
              <Switch data-testid="switch-sms-notifications" />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-foreground">Notifikacije za klijente</p>
                <p className="text-sm text-muted-foreground">Automatski šaljite podsjetnike klijentima</p>
              </div>
              <Switch defaultChecked data-testid="switch-client-notifications" />
            </div>
          </div>
        </Card>

        {/* Booking Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Postavke rezervacija
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Automatsko potvrđivanje</p>
                <p className="text-sm text-muted-foreground">Automatski potvrdite rezervacije bez ručnog odobrenja</p>
              </div>
              <Switch data-testid="switch-auto-confirm" />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Dozvoli otkazivanje</p>
                <p className="text-sm text-muted-foreground">Klijenti mogu otkazati rezervaciju</p>
              </div>
              <Switch defaultChecked data-testid="switch-allow-cancel" />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-foreground">Zahtijevaj telefon</p>
                <p className="text-sm text-muted-foreground">Klijenti moraju unijeti telefon pri rezervaciji</p>
              </div>
              <Switch defaultChecked data-testid="switch-require-phone" />
            </div>
          </div>
        </Card>

        {/* Business Link */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            Link do salona
          </h3>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Podijelite ovaj link da klijenti mogu rezervisati:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-background rounded text-sm text-foreground truncate">
                {typeof window !== 'undefined' ? `${window.location.origin}/business/${selectedBusiness?.id}` : ''}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/business/${selectedBusiness?.id}`);
                  toast({ title: "Link kopiran" });
                }}
                data-testid="button-copy-link"
              >
                Kopiraj
              </Button>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/50">
          <h3 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Opasna zona
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Deaktiviraj salon</p>
                <p className="text-sm text-muted-foreground">
                  Privremeno sakrij salon od korisnika
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:text-destructive">
                    <EyeOff className="w-4 h-4 mr-2" />
                    Deaktiviraj
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deaktivirati salon?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Salon neće biti vidljiv korisnicima i neće moći primati nove rezervacije.
                      Postojeće rezervacije ostaju aktivne.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Odustani</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => toggleActiveMutation.mutate(false)}
                      className="bg-destructive text-destructive-foreground"
                    >
                      Deaktiviraj
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Obriši salon</p>
                <p className="text-sm text-muted-foreground">
                  Trajno obriši salon i sve povezane podatke
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Obriši
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Obrisati salon?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Ova radnja se ne može poništiti. Svi podaci o salonu, uslugama, 
                      zaposlenima i rezervacijama će biti trajno obrisani.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Odustani</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground">
                      Trajno obriši
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      </div>
    </OwnerLayout>
  );
}
