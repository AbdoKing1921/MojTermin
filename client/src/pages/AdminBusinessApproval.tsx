import { useQuery, useMutation } from "@tanstack/react-query";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin,
  Phone,
  Mail,
  Calendar
} from "lucide-react";
import { Link } from "wouter";
import type { Business } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function AdminBusinessApproval() {
  const { toast } = useToast();

  const { data: allBusinesses, isLoading, error } = useQuery<Business[]>({
    queryKey: ["/api/superadmin/businesses"],
  });

  const { data: pendingBusinesses } = useQuery<Business[]>({
    queryKey: ["/api/superadmin/businesses/pending"],
  });

  const approveMutation = useMutation({
    mutationFn: async (businessId: string) => {
      return apiRequest("PATCH", `/api/superadmin/businesses/${businessId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/businesses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/businesses/pending"] });
      toast({
        title: "Salon odobren",
        description: "Salon je sada vidljiv korisnicima.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Greška",
        description: error.message || "Nije moguće odobriti salon.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (businessId: string) => {
      return apiRequest("DELETE", `/api/superadmin/businesses/${businessId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/businesses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/businesses/pending"] });
      toast({
        title: "Salon odbijen",
        description: "Salon je uklonjen iz sistema.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Greška",
        description: error.message || "Nije moguće odbiti salon.",
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ businessId, isActive }: { businessId: string; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/superadmin/businesses/${businessId}/status`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/businesses"] });
      toast({
        title: "Status ažuriran",
        description: "Status salona je promijenjen.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Greška",
        description: error.message || "Nije moguće promijeniti status.",
        variant: "destructive",
      });
    },
  });

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
            <h1 className="text-xl font-semibold">Odobravanje salona</h1>
          </div>
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive text-center">
                Nemate pristup ovoj stranici. Samo administratori mogu odobravati salone.
              </p>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
      </MobileContainer>
    );
  }

  const approved = allBusinesses?.filter(b => b.isApproved) || [];
  const pending = pendingBusinesses || [];

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("sr-Latn", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric"
    });
  };

  const BusinessCard = ({ business, showActions = true }: { business: Business; showActions?: boolean }) => (
    <Card key={business.id} data-testid={`card-business-${business.id}`} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate" data-testid={`text-business-name-${business.id}`}>
              {business.name}
            </h3>
            {business.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {business.description}
              </p>
            )}
          </div>
          <Badge variant={business.isApproved ? "default" : "secondary"} className="shrink-0">
            {business.isApproved ? "Odobren" : "Na čekanju"}
          </Badge>
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
          {business.city && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{business.address}, {business.city}</span>
            </div>
          )}
          {business.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              <span>{business.phone}</span>
            </div>
          )}
          {business.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate">{business.email}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Kreiran: {formatDate(business.createdAt)}</span>
          </div>
        </div>

        {showActions && !business.isApproved && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => approveMutation.mutate(business.id)}
              disabled={approveMutation.isPending}
              className="flex-1"
              data-testid={`button-approve-${business.id}`}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Odobri
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="destructive"
                  disabled={rejectMutation.isPending}
                  className="flex-1"
                  data-testid={`button-reject-${business.id}`}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Odbij
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ova akcija će trajno ukloniti salon "{business.name}" iz sistema. Ova radnja se ne može poništiti.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Odustani</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => rejectMutation.mutate(business.id)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Obriši
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {showActions && business.isApproved && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={business.isActive ? "outline" : "default"}
              onClick={() => toggleStatusMutation.mutate({ 
                businessId: business.id, 
                isActive: !business.isActive 
              })}
              disabled={toggleStatusMutation.isPending}
              className="flex-1"
              data-testid={`button-toggle-${business.id}`}
            >
              {business.isActive ? "Deaktiviraj" : "Aktiviraj"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="destructive"
                  disabled={rejectMutation.isPending}
                  data-testid={`button-delete-${business.id}`}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ova akcija će trajno ukloniti salon "{business.name}" iz sistema. Ova radnja se ne može poništiti.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Odustani</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => rejectMutation.mutate(business.id)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Obriši
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );

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
            <h1 className="text-xl font-semibold" data-testid="text-page-title">Odobravanje salona</h1>
            <p className="text-sm text-muted-foreground">Pregledajte i odobrite nove salone</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Pregled salona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <Badge variant="secondary" className="h-5 px-1.5">
                  {pending.length}
                </Badge>
                <span className="text-muted-foreground">Na čekanju</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <Badge variant="default" className="h-5 px-1.5">
                  {approved.length}
                </Badge>
                <span className="text-muted-foreground">Odobreno</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="pending" data-testid="tab-pending">
                Na čekanju ({pending.length})
              </TabsTrigger>
              <TabsTrigger value="approved" data-testid="tab-approved">
                Odobreni ({approved.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-3">
              {pending.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nema salona na čekanju</p>
                  </CardContent>
                </Card>
              ) : (
                pending.map(business => (
                  <BusinessCard key={business.id} business={business} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="approved" className="space-y-3">
              {approved.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nema odobrenih salona</p>
                  </CardContent>
                </Card>
              ) : (
                approved.map(business => (
                  <BusinessCard key={business.id} business={business} />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
      <BottomNavigation />
    </MobileContainer>
  );
}
