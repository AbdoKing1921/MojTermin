import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Scissors, Plus, Edit2, Trash2, Clock, DollarSign } from "lucide-react";
import OwnerLayout from "./OwnerLayout";
import type { Business, Service } from "@shared/schema";

const serviceSchema = z.object({
  name: z.string().min(2, "Naziv mora imati najmanje 2 karaktera"),
  description: z.string().optional(),
  price: z.number().min(0, "Cijena ne može biti negativna"),
  duration: z.number().min(5, "Trajanje mora biti najmanje 5 minuta"),
});

type ServiceForm = z.infer<typeof serviceSchema>;

export default function OwnerServices() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const { data: businesses, isLoading: businessesLoading } = useQuery<Business[]>({
    queryKey: ["/api/owner/businesses"],
    enabled: isAuthenticated,
  });

  const selectedBusiness = businesses?.[0];

  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/owner/businesses", selectedBusiness?.id, "services"],
    enabled: !!selectedBusiness?.id,
  });

  const form = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      duration: 30,
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceForm) => {
      return apiRequest("POST", `/api/owner/businesses/${selectedBusiness?.id}/services`, data);
    },
    onSuccess: () => {
      toast({ title: "Usluga dodana" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses", selectedBusiness?.id, "services"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async (data: ServiceForm & { id: string }) => {
      return apiRequest("PUT", `/api/owner/services/${data.id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Usluga ažurirana" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses", selectedBusiness?.id, "services"] });
      setIsDialogOpen(false);
      setEditingService(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      return apiRequest("DELETE", `/api/owner/services/${serviceId}`);
    },
    onSuccess: () => {
      toast({ title: "Usluga obrisana" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses", selectedBusiness?.id, "services"] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      form.reset({
        name: service.name,
        description: service.description || "",
        price: parseFloat(service.price.toString()),
        duration: service.duration,
      });
    } else {
      setEditingService(null);
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: ServiceForm) => {
    if (editingService) {
      updateServiceMutation.mutate({ ...data, id: editingService.id });
    } else {
      createServiceMutation.mutate(data);
    }
  };

  if (businessesLoading) {
    return (
      <OwnerLayout title="Usluge">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Usluge" subtitle="Upravljajte uslugama koje nudite">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Ukupno usluga: {services?.length || 0}
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2" data-testid="button-add-service">
                <Plus className="w-4 h-4" />
                Dodaj uslugu
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Uredi uslugu" : "Dodaj novu uslugu"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Naziv usluge *</FormLabel>
                        <FormControl>
                          <Input placeholder="npr. Muško šišanje" {...field} data-testid="input-service-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opis</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Opišite uslugu..." {...field} data-testid="input-service-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cijena (KM) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              min="0"
                              placeholder="15.00" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-service-price"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trajanje (min) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="5"
                              step="5"
                              placeholder="30" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                              data-testid="input-service-duration"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Odustani
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                      data-testid="button-save-service"
                    >
                      {(createServiceMutation.isPending || updateServiceMutation.isPending) ? (
                        <LoadingSpinner />
                      ) : editingService ? "Sačuvaj" : "Dodaj"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Services List */}
        {servicesLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : !services || services.length === 0 ? (
          <Card className="p-8 text-center">
            <Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Nema usluga</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Dodajte usluge koje nudite u vašem salonu
            </p>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              Dodaj prvu uslugu
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <Card key={service.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{service.name}</h4>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <Badge variant={service.isActive ? "default" : "secondary"} className="text-[10px]">
                    {service.isActive ? "Aktivna" : "Neaktivna"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm mb-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium text-foreground">{service.price} KM</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration} min</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(service)}
                    className="flex-1 gap-1"
                    data-testid={`button-edit-service-${service.id}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Uredi
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-delete-service-${service.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Obrisati uslugu?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ova radnja se ne može poništiti. Usluga "{service.name}" će biti obrisana.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Odustani</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteServiceMutation.mutate(service.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Obriši
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
