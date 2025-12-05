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
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Building2, Phone, Mail, MapPin, Clock } from "lucide-react";
import OwnerLayout from "./OwnerLayout";
import type { Business, Category } from "@shared/schema";

const businessProfileSchema = z.object({
  name: z.string().min(2, "Naziv mora imati najmanje 2 karaktera"),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Neispravan email format").optional().or(z.literal("")),
  categoryId: z.string().min(1, "Izaberite kategoriju"),
  slotDuration: z.number().min(5).max(240),
});

type BusinessProfileForm = z.infer<typeof businessProfileSchema>;

export default function OwnerBusinessProfile() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: businesses, isLoading: businessesLoading } = useQuery<Business[]>({
    queryKey: ["/api/owner/businesses"],
    enabled: isAuthenticated,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const selectedBusiness = businesses?.[0];

  const form = useForm<BusinessProfileForm>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      city: "",
      phone: "",
      email: "",
      categoryId: "",
      slotDuration: 30,
    },
  });

  useEffect(() => {
    if (selectedBusiness) {
      form.reset({
        name: selectedBusiness.name || "",
        description: selectedBusiness.description || "",
        address: selectedBusiness.address || "",
        city: selectedBusiness.city || "",
        phone: selectedBusiness.phone || "",
        email: selectedBusiness.email || "",
        categoryId: selectedBusiness.categoryId || "",
        slotDuration: selectedBusiness.slotDuration || 30,
      });
    }
  }, [selectedBusiness, form]);

  const updateBusinessMutation = useMutation({
    mutationFn: async (data: BusinessProfileForm) => {
      return apiRequest("PUT", `/api/owner/businesses/${selectedBusiness?.id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Uspješno sačuvano", description: "Profil salona je ažuriran" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses"] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: BusinessProfileForm) => {
    updateBusinessMutation.mutate(data);
  };

  if (businessesLoading) {
    return (
      <OwnerLayout title="Profil salona">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Profil salona" subtitle="Uredite osnovne podatke o vašem salonu">
      <div className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Osnovni podaci
              </h3>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Naziv salona *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="npr. Frizerski salon Elegance" 
                          {...field} 
                          data-testid="input-business-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategorija *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Izaberite kategoriju" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opis salona</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Opišite vaš salon, usluge koje nudite, iskustvo..." 
                          className="min-h-[100px]"
                          {...field} 
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Contact Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Kontakt podaci
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel"
                          placeholder="+387 61 234 567" 
                          {...field} 
                          data-testid="input-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="salon@email.com" 
                          {...field} 
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Location */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Lokacija
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresa</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ulica i broj" 
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
                      <FormLabel>Grad</FormLabel>
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

            {/* Booking Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Postavke termina
              </h3>
              
              <FormField
                control={form.control}
                name="slotDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trajanje termina (minute)</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(parseInt(val))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-slot-duration">
                          <SelectValue placeholder="Izaberite trajanje" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="15">15 minuta</SelectItem>
                        <SelectItem value="30">30 minuta</SelectItem>
                        <SelectItem value="45">45 minuta</SelectItem>
                        <SelectItem value="60">60 minuta</SelectItem>
                        <SelectItem value="90">90 minuta</SelectItem>
                        <SelectItem value="120">120 minuta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full gap-2"
              disabled={updateBusinessMutation.isPending}
              data-testid="button-save-profile"
            >
              {updateBusinessMutation.isPending ? (
                <LoadingSpinner />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Sačuvaj promjene
            </Button>
          </form>
        </Form>
      </div>
    </OwnerLayout>
  );
}
