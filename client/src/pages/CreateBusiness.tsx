import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MobileContainer } from "@/components/MobileContainer";
import { LoadingScreen } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Category } from "@shared/schema";

const createBusinessSchema = z.object({
  name: z.string().min(2, "Naziv mora imati najmanje 2 karaktera"),
  categoryId: z.string().min(1, "Odaberite kategoriju"),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Unesite validan email").optional().or(z.literal("")),
  openTime: z.string().default("09:00"),
  closeTime: z.string().default("18:00"),
  slotDuration: z.coerce.number().min(15).max(120).default(30),
});

type CreateBusinessForm = z.infer<typeof createBusinessSchema>;

export default function CreateBusiness() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Potrebna prijava",
        description: "Morate se prijaviti da kreirate biznis",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<CreateBusinessForm>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      description: "",
      address: "",
      city: "",
      phone: "",
      email: "",
      openTime: "09:00",
      closeTime: "18:00",
      slotDuration: 30,
    },
  });

  const createBusinessMutation = useMutation({
    mutationFn: async (data: CreateBusinessForm) => {
      return apiRequest("POST", "/api/admin/businesses", data);
    },
    onSuccess: () => {
      toast({ title: "Biznis kreiran!", description: "Uspješno ste kreirali novi biznis" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      navigate("/admin");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: CreateBusinessForm) => {
    createBusinessMutation.mutate(data);
  };

  if (authLoading || categoriesLoading) {
    return (
      <MobileContainer>
        <LoadingScreen />
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      {/* Header */}
      <header className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-lg" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-base font-semibold text-foreground" data-testid="text-page-title">
              Kreiraj biznis
            </h1>
            <p className="text-xs text-muted-foreground">Popunite informacije o vašem biznisu</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 pb-24 scroll-smooth">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Naziv biznisa *</FormLabel>
                  <FormControl>
                    <Input placeholder="npr. Salon Ljepote Ana" {...field} data-testid="input-name" />
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
                  <FormLabel className="text-sm">Kategorija *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Odaberite kategoriju" />
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
                  <FormLabel className="text-sm">Opis</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Opišite vaš biznis..."
                      className="resize-none"
                      {...field}
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Adresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ulica i broj" {...field} data-testid="input-address" />
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
                    <FormLabel className="text-sm">Grad</FormLabel>
                    <FormControl>
                      <Input placeholder="npr. Sarajevo" {...field} data-testid="input-city" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Telefon</FormLabel>
                    <FormControl>
                      <Input placeholder="+387 61 123 456" {...field} data-testid="input-phone" />
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
                    <FormLabel className="text-sm">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@primjer.ba" type="email" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="openTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Otvaranje</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} data-testid="input-open-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="closeTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Zatvaranje</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} data-testid="input-close-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slotDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Slot (min)</FormLabel>
                    <FormControl>
                      <Input type="number" min={15} max={120} step={15} {...field} data-testid="input-slot-duration" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </main>

      {/* Submit Button */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 py-4 bg-card/95 backdrop-blur-sm border-t border-border">
        <Button
          className="w-full h-11 text-sm font-semibold rounded-lg"
          onClick={form.handleSubmit(onSubmit)}
          disabled={createBusinessMutation.isPending}
          data-testid="button-submit"
        >
          {createBusinessMutation.isPending ? "Kreiranje..." : "Kreiraj biznis"}
        </Button>
      </footer>
    </MobileContainer>
  );
}
