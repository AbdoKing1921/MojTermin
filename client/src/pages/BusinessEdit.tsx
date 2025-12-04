import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Building2, MapPin, Phone, Mail, Clock, Save, Image } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { MobileContainer } from "@/components/MobileContainer";
import { LoadingScreen } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Business } from "@shared/schema";

const generateTimeOptions = () => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const time = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      times.push(time);
    }
  }
  return times;
};

const slotDurationOptions = [15, 30, 45, 60, 90, 120];

export default function BusinessEdit() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const params = useParams<{ businessId: string }>();
  const [, navigate] = useLocation();
  const businessId = params.businessId;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    imageUrl: "",
    openTime: "09:00",
    closeTime: "18:00",
    slotDuration: 30,
  });

  const { data: business, isLoading: businessLoading } = useQuery<Business>({
    queryKey: ["/api/businesses", businessId],
    enabled: !!businessId && isAuthenticated,
  });

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || "",
        description: business.description || "",
        address: business.address || "",
        city: business.city || "",
        phone: business.phone || "",
        email: business.email || "",
        imageUrl: business.imageUrl || "",
        openTime: business.openTime || "09:00",
        closeTime: business.closeTime || "18:00",
        slotDuration: business.slotDuration || 30,
      });
    }
  }, [business]);

  const updateBusinessMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("PUT", `/api/admin/businesses/${businessId}`, data);
    },
    onSuccess: () => {
      toast({ title: "Uspješno", description: "Podaci biznisa su ažurirani" });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses", businessId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      navigate("/admin");
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: "Greška", description: "Naziv biznisa je obavezan", variant: "destructive" });
      return;
    }
    updateBusinessMutation.mutate(formData);
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || businessLoading) {
    return (
      <MobileContainer>
        <LoadingScreen />
      </MobileContainer>
    );
  }

  if (!business) {
    return (
      <MobileContainer>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Biznis nije pronađen</p>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <header className="px-5 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-lg" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground" data-testid="text-page-title">
              Uredi biznis
            </h1>
            <p className="text-xs text-muted-foreground">{business?.name}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 pb-28 scroll-smooth">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Osnovne informacije</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-xs">Naziv biznisa *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="npr. Frizerski salon XY"
                  className="mt-1"
                  data-testid="input-name"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-xs">Opis</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Opišite vaš biznis..."
                  className="mt-1 min-h-[100px]"
                  data-testid="input-description"
                />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-emerald-500" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Lokacija</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="address" className="text-xs">Adresa</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="npr. Ulica Maršala Tita 15"
                  className="mt-1"
                  data-testid="input-address"
                />
              </div>
              
              <div>
                <Label htmlFor="city" className="text-xs">Grad</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="npr. Sarajevo"
                  className="mt-1"
                  data-testid="input-city"
                />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Kontakt</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-xs">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="npr. +387 33 123 456"
                  className="mt-1"
                  data-testid="input-phone"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="npr. info@salon.ba"
                  className="mt-1"
                  data-testid="input-email"
                />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/10 flex items-center justify-center">
                <Image className="w-5 h-5 text-violet-500" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Slika</h2>
            </div>
            
            <div>
              <Label htmlFor="imageUrl" className="text-xs">URL slike</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://example.com/slika.jpg"
                className="mt-1"
                data-testid="input-image-url"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Unesite URL slike koja će se prikazati na profilu biznisa
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Termini</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Početak radnog vremena</Label>
                  <Select
                    value={formData.openTime}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, openTime: value }))}
                  >
                    <SelectTrigger className="mt-1" data-testid="select-open-time">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-xs">Kraj radnog vremena</Label>
                  <Select
                    value={formData.closeTime}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, closeTime: value }))}
                  >
                    <SelectTrigger className="mt-1" data-testid="select-close-time">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label className="text-xs">Trajanje termina (minuta)</Label>
                <Select
                  value={formData.slotDuration.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, slotDuration: parseInt(value) }))}
                >
                  <SelectTrigger className="mt-1" data-testid="select-slot-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {slotDurationOptions.map((duration) => (
                      <SelectItem key={duration} value={duration.toString()}>
                        {duration} minuta
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Koliko dugo traje jedan termin po defaultu
                </p>
              </div>
            </div>
          </Card>
        </form>
      </main>

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 py-4 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
        <Button
          className="w-full h-12 text-base font-semibold rounded-xl"
          onClick={handleSubmit}
          disabled={updateBusinessMutation.isPending}
          data-testid="button-save"
        >
          <Save className="w-5 h-5 mr-2" />
          {updateBusinessMutation.isPending ? "Čuvam..." : "Sačuvaj promjene"}
        </Button>
      </footer>
    </MobileContainer>
  );
}
