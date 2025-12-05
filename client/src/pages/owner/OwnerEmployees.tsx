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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  FormDescription,
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
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  UserPlus,
  Calendar,
  Settings,
  CheckCircle,
  XCircle
} from "lucide-react";
import OwnerLayout from "./OwnerLayout";
import type { Business, Employee } from "@shared/schema";

const employeeSchema = z.object({
  name: z.string().min(2, "Ime mora imati najmanje 2 karaktera"),
  title: z.string().optional(),
  email: z.string().email("Neispravan email").optional().or(z.literal("")),
  phone: z.string().optional(),
  canManageSchedule: z.boolean().default(true),
  canViewAllBookings: z.boolean().default(false),
  canManageBookings: z.boolean().default(false),
});

type EmployeeForm = z.infer<typeof employeeSchema>;

export default function OwnerEmployees() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { data: businesses, isLoading: businessesLoading } = useQuery<Business[]>({
    queryKey: ["/api/owner/businesses"],
    enabled: isAuthenticated,
  });

  const selectedBusiness = businesses?.[0];

  const { data: employees, isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ["/api/owner/businesses", selectedBusiness?.id, "employees"],
    enabled: !!selectedBusiness?.id,
  });

  const form = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      title: "",
      email: "",
      phone: "",
      canManageSchedule: true,
      canViewAllBookings: false,
      canManageBookings: false,
    },
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeForm) => {
      return apiRequest("POST", `/api/owner/businesses/${selectedBusiness?.id}/employees`, data);
    },
    onSuccess: () => {
      toast({ title: "Zaposleni dodan", description: "Novi zaposleni je uspješno kreiran" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses", selectedBusiness?.id, "employees"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeForm & { id: string }) => {
      return apiRequest("PUT", `/api/owner/employees/${data.id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Zaposleni ažuriran" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses", selectedBusiness?.id, "employees"] });
      setIsDialogOpen(false);
      setEditingEmployee(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      return apiRequest("DELETE", `/api/owner/employees/${employeeId}`);
    },
    onSuccess: () => {
      toast({ title: "Zaposleni obrisan" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses", selectedBusiness?.id, "employees"] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const toggleEmployeeActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/owner/employees/${id}/status`, { isActive });
    },
    onSuccess: () => {
      toast({ title: "Status ažuriran" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses", selectedBusiness?.id, "employees"] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      form.reset({
        name: employee.name,
        title: employee.title || "",
        email: employee.email || "",
        phone: employee.phone || "",
        canManageSchedule: employee.canManageSchedule ?? true,
        canViewAllBookings: employee.canViewAllBookings ?? false,
        canManageBookings: employee.canManageBookings ?? false,
      });
    } else {
      setEditingEmployee(null);
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: EmployeeForm) => {
    if (editingEmployee) {
      updateEmployeeMutation.mutate({ ...data, id: editingEmployee.id });
    } else {
      createEmployeeMutation.mutate(data);
    }
  };

  if (businessesLoading) {
    return (
      <OwnerLayout title="Zaposleni">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Zaposleni" subtitle="Upravljajte zaposlenima u vašem salonu">
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Ukupno zaposlenih: {employees?.length || 0}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2" data-testid="button-add-employee">
                <Plus className="w-4 h-4" />
                Dodaj zaposlenog
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? "Uredi zaposlenog" : "Dodaj novog zaposlenog"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ime i prezime *</FormLabel>
                        <FormControl>
                          <Input placeholder="npr. Marko Marković" {...field} data-testid="input-employee-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pozicija</FormLabel>
                        <FormControl>
                          <Input placeholder="npr. Frizer, Kozmetičar" {...field} data-testid="input-employee-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@primjer.com" {...field} data-testid="input-employee-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+387 61..." {...field} data-testid="input-employee-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium text-sm">Dozvole</h4>
                    
                    <FormField
                      control={form.control}
                      name="canManageSchedule"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel className="font-normal">Upravljanje rasporedom</FormLabel>
                            <FormDescription className="text-xs">
                              Može mijenjati svoj raspored
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="canViewAllBookings"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel className="font-normal">Pregled svih rezervacija</FormLabel>
                            <FormDescription className="text-xs">
                              Može vidjeti sve rezervacije u salonu
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="canManageBookings"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel className="font-normal">Upravljanje rezervacijama</FormLabel>
                            <FormDescription className="text-xs">
                              Može potvrditi/otkazati rezervacije
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
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
                      disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
                      data-testid="button-save-employee"
                    >
                      {(createEmployeeMutation.isPending || updateEmployeeMutation.isPending) ? (
                        <LoadingSpinner />
                      ) : editingEmployee ? "Sačuvaj" : "Dodaj"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Employee List */}
        {employeesLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : !employees || employees.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Nema zaposlenih</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Dodajte zaposlene da biste mogli dodijeliti termine
            </p>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              Dodaj prvog zaposlenog
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {employees.map((employee) => (
              <Card key={employee.id} className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={employee.imageUrl || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {employee.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground truncate">{employee.name}</h4>
                      <Badge 
                        variant={employee.isActive ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {employee.isActive ? "Aktivan" : "Neaktivan"}
                      </Badge>
                    </div>
                    
                    {employee.title && (
                      <p className="text-sm text-muted-foreground mb-2">{employee.title}</p>
                    )}
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {employee.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{employee.email}</span>
                        </div>
                      )}
                      {employee.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3" />
                          <span>{employee.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Permissions */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {employee.canManageSchedule && (
                        <Badge variant="outline" className="text-[10px]">
                          <Calendar className="w-2.5 h-2.5 mr-1" />
                          Raspored
                        </Badge>
                      )}
                      {employee.canViewAllBookings && (
                        <Badge variant="outline" className="text-[10px]">
                          <CheckCircle className="w-2.5 h-2.5 mr-1" />
                          Pregled
                        </Badge>
                      )}
                      {employee.canManageBookings && (
                        <Badge variant="outline" className="text-[10px]">
                          <Settings className="w-2.5 h-2.5 mr-1" />
                          Upravljanje
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(employee)}
                      data-testid={`button-edit-employee-${employee.id}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleEmployeeActiveMutation.mutate({ 
                        id: employee.id, 
                        isActive: !employee.isActive 
                      })}
                      data-testid={`button-toggle-employee-${employee.id}`}
                    >
                      {employee.isActive ? (
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-delete-employee-${employee.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Obrisati zaposlenog?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ova radnja se ne može poništiti. Svi podaci o ovom zaposlenom će biti obrisani.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Odustani</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteEmployeeMutation.mutate(employee.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Obriši
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Invite Employee Section */}
        <Card className="p-6 bg-muted/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">Pozovite zaposlenog da se prijavi</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Zaposleni mogu kreirati svoj nalog i povezati ga sa vašim salonom kako bi mogli upravljati svojim rasporedom.
              </p>
              <Badge variant="outline" className="text-xs">Uskoro dostupno</Badge>
            </div>
          </div>
        </Card>
      </div>
    </OwnerLayout>
  );
}
