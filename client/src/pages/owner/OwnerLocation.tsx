import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { MapPin, Save, ExternalLink, Navigation } from "lucide-react";
import OwnerLayout from "./OwnerLayout";
import type { Business } from "@shared/schema";

const locationSchema = z.object({
  address: z.string().min(1, "Adresa je obavezna"),
  city: z.string().min(1, "Grad je obavezan"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  googlePlaceId: z.string().optional(),
});

type LocationForm = z.infer<typeof locationSchema>;

export default function OwnerLocation() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: businesses, isLoading: businessesLoading } = useQuery<Business[]>({
    queryKey: ["/api/owner/businesses"],
    enabled: isAuthenticated,
  });

  const selectedBusiness = businesses?.[0];

  const form = useForm<LocationForm>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      address: "",
      city: "",
      latitude: "",
      longitude: "",
      googlePlaceId: "",
    },
  });

  useEffect(() => {
    if (selectedBusiness) {
      form.reset({
        address: selectedBusiness.address || "",
        city: selectedBusiness.city || "",
        latitude: selectedBusiness.latitude?.toString() || "",
        longitude: selectedBusiness.longitude?.toString() || "",
        googlePlaceId: selectedBusiness.googlePlaceId || "",
      });
    }
  }, [selectedBusiness, form]);

  const updateLocationMutation = useMutation({
    mutationFn: async (data: LocationForm) => {
      return apiRequest("PUT", `/api/owner/businesses/${selectedBusiness?.id}/location`, {
        address: data.address,
        city: data.city,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        googlePlaceId: data.googlePlaceId || null,
      });
    },
    onSuccess: () => {
      toast({ title: "Lokacija sačuvana", description: "Lokacija vašeg salona je ažurirana" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses"] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: LocationForm) => {
    updateLocationMutation.mutate(data);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Greška", description: "Vaš browser ne podržava geolokaciju", variant: "destructive" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("latitude", position.coords.latitude.toFixed(7));
        form.setValue("longitude", position.coords.longitude.toFixed(7));
        toast({ title: "Lokacija pronađena", description: "Koordinate su postavljene" });
      },
      (error) => {
        toast({ title: "Greška", description: "Nije moguće dobiti trenutnu lokaciju", variant: "destructive" });
      }
    );
  };

  const lat = form.watch("latitude");
  const lng = form.watch("longitude");
  const hasCoordinates = lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));

  if (businessesLoading) {
    return (
      <OwnerLayout title="Lokacija i mapa">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Lokacija i mapa" subtitle="Postavite lokaciju vašeg salona na mapi">
      <div className="max-w-2xl space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Address */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Adresa
              </h3>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ulica i broj *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="npr. Ferhadija 15" 
                          {...field} 
                          data-testid="input-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grad *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="npr. Sarajevo" 
                          {...field} 
                          data-testid="input-city"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Map Coordinates */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-primary" />
                Koordinate na mapi
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Koordinate omogućavaju prikazivanje vašeg salona na mapi. Možete ih unijeti ručno ili koristiti svoju trenutnu lokaciju.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Geografska širina (Latitude)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.0000001"
                          placeholder="43.8563100" 
                          {...field} 
                          data-testid="input-latitude"
                        />
                      </FormControl>
                      <FormDescription>npr. 43.8563100 za Sarajevo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Geografska dužina (Longitude)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.0000001"
                          placeholder="18.4130600" 
                          {...field} 
                          data-testid="input-longitude"
                        />
                      </FormControl>
                      <FormDescription>npr. 18.4130600 za Sarajevo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGetCurrentLocation}
                className="gap-2"
                data-testid="button-get-location"
              >
                <Navigation className="w-4 h-4" />
                Koristi moju lokaciju
              </Button>
            </Card>

            {/* Map Preview */}
            {hasCoordinates && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Pregled na mapi</h3>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${lat},${lng}&zoom=15`}
                    title="Lokacija salona"
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <a 
                    href={`https://www.google.com/maps?q=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" type="button" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Otvori u Google Maps
                    </Button>
                  </a>
                </div>
              </Card>
            )}

            {/* Google Place ID (Advanced) */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Napredno</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Opcionalno: Ako imate Google Place ID za vaš salon, unesite ga ovdje za bolju integraciju sa Google mapama.
              </p>
              
              <FormField
                control={form.control}
                name="googlePlaceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Place ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ChIJ..." 
                        {...field} 
                        data-testid="input-place-id"
                      />
                    </FormControl>
                    <FormDescription>
                      <a 
                        href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Kako pronaći Place ID?
                      </a>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full gap-2"
              disabled={updateLocationMutation.isPending}
              data-testid="button-save-location"
            >
              {updateLocationMutation.isPending ? (
                <LoadingSpinner />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Sačuvaj lokaciju
            </Button>
          </form>
        </Form>
      </div>
    </OwnerLayout>
  );
}
