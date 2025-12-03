import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Plus, Pencil, Trash2, Check, X, Users } from "lucide-react";
import { Link, useParams } from "wouter";
import { MobileContainer } from "@/components/MobileContainer";
import { LoadingScreen } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Business, Employee, Service } from "@shared/schema";

interface EmployeeWithServices extends Employee {
  services?: Service[];
}

export default function EmployeeManagement() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const params = useParams<{ businessId: string }>();
  const businessId = params.businessId;

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isServicesDialogOpen, setIsServicesDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithServices | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    imageUrl: "",
  });
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const { data: business, isLoading: businessLoading } = useQuery<Business>({
    queryKey: ["/api/businesses", businessId],
    enabled: !!businessId && isAuthenticated,
  });

  const { data: employees, isLoading: employeesLoading } = useQuery<EmployeeWithServices[]>({
    queryKey: [`/api/admin/businesses/${businessId}/employees`],
    enabled: !!businessId && isAuthenticated,
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: [`/api/businesses/${businessId}/services`],
    enabled: !!businessId && isAuthenticated,
  });

  const { data: employeeServices } = useQuery<{ serviceId: string }[]>({
    queryKey: [`/api/admin/employees/${selectedEmployee?.id}/services`],
    enabled: !!selectedEmployee?.id && isServicesDialogOpen,
  });

  useEffect(() => {
    if (employeeServices) {
      setSelectedServiceIds(employeeServices.map((es) => es.serviceId));
    }
  }, [employeeServices]);

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", `/api/admin/businesses/${businessId}/employees`, data);
    },
    onSuccess: () => {
      toast({ title: "Uspješno", description: "Zaposleni je dodan" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/businesses/${businessId}/employees`] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData & { isActive: boolean }> }) => {
      return apiRequest("PATCH", `/api/admin/employees/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Uspješno", description: "Zaposleni je ažuriran" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/businesses/${businessId}/employees`] });
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/employees/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Uspješno", description: "Zaposleni je uklonjen" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/businesses/${businessId}/employees`] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const addServiceToEmployeeMutation = useMutation({
    mutationFn: async ({ employeeId, serviceId }: { employeeId: string; serviceId: string }) => {
      return apiRequest("POST", `/api/admin/employees/${employeeId}/services`, { serviceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/employees/${selectedEmployee?.id}/services`] });
    },
  });

  const removeServiceFromEmployeeMutation = useMutation({
    mutationFn: async ({ employeeId, serviceId }: { employeeId: string; serviceId: string }) => {
      return apiRequest("DELETE", `/api/admin/employees/${employeeId}/services/${serviceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/employees/${selectedEmployee?.id}/services`] });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", title: "", email: "", phone: "", imageUrl: "" });
  };

  const openEditDialog = (employee: EmployeeWithServices) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      title: employee.title || "",
      email: employee.email || "",
      phone: employee.phone || "",
      imageUrl: employee.imageUrl || "",
    });
    setIsEditDialogOpen(true);
  };

  const openServicesDialog = (employee: EmployeeWithServices) => {
    setSelectedEmployee(employee);
    setSelectedServiceIds([]);
    setIsServicesDialogOpen(true);
  };

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    if (!selectedEmployee) return;

    if (checked) {
      addServiceToEmployeeMutation.mutate({ employeeId: selectedEmployee.id, serviceId });
      setSelectedServiceIds((prev) => [...prev, serviceId]);
    } else {
      removeServiceFromEmployeeMutation.mutate({ employeeId: selectedEmployee.id, serviceId });
      setSelectedServiceIds((prev) => prev.filter((id) => id !== serviceId));
    }
  };

  const handleToggleActive = (employee: EmployeeWithServices) => {
    updateEmployeeMutation.mutate({
      id: employee.id,
      data: { isActive: !employee.isActive },
    });
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || businessLoading || employeesLoading) {
    return (
      <MobileContainer>
        <LoadingScreen />
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
              Zaposleni
            </h1>
            <p className="text-xs text-muted-foreground">{business?.name}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 pb-20 scroll-smooth">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {employees?.length || 0} zaposlenih
            </span>
          </div>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-employee">
            <Plus className="w-4 h-4 mr-1" />
            Dodaj
          </Button>
        </div>

        {!employees || employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Nema zaposlenih</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Dodajte zaposlene za bolje upravljanje rezervacijama
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((employee) => (
              <Card key={employee.id} className="p-4" data-testid={`employee-card-${employee.id}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {employee.imageUrl ? (
                        <img
                          src={employee.imageUrl}
                          alt={employee.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-primary">
                          {employee.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{employee.name}</p>
                      {employee.title && (
                        <p className="text-xs text-muted-foreground">{employee.title}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={employee.isActive ?? true}
                      onCheckedChange={() => handleToggleActive(employee)}
                      data-testid={`toggle-active-${employee.id}`}
                    />
                    <Badge
                      variant="outline"
                      className={employee.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400"}
                    >
                      {employee.isActive ? "Aktivan" : "Neaktivan"}
                    </Badge>
                  </div>
                </div>

                {(employee.email || employee.phone) && (
                  <div className="text-xs text-muted-foreground mb-3">
                    {employee.email && <p>{employee.email}</p>}
                    {employee.phone && <p>{employee.phone}</p>}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => openServicesDialog(employee)}
                    data-testid={`button-services-${employee.id}`}
                  >
                    Usluge
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(employee)}
                    data-testid={`button-edit-${employee.id}`}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteEmployeeMutation.mutate(employee.id)}
                    disabled={deleteEmployeeMutation.isPending}
                    className="text-destructive hover:text-destructive"
                    data-testid={`button-delete-${employee.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Dodaj zaposlenog</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Ime i prezime *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="npr. Marko Marković"
                data-testid="input-employee-name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Pozicija</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="npr. Frizer, Kozmetičar"
                data-testid="input-employee-title"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="email@primjer.com"
                data-testid="input-employee-email"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Telefon</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+387 61 123 456"
                data-testid="input-employee-phone"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Otkaži
              </Button>
              <Button
                className="flex-1"
                onClick={() => createEmployeeMutation.mutate(formData)}
                disabled={!formData.name || createEmployeeMutation.isPending}
                data-testid="button-save-employee"
              >
                <Check className="w-4 h-4 mr-1" />
                {createEmployeeMutation.isPending ? "Čuvam..." : "Sačuvaj"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Uredi zaposlenog</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Ime i prezime *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                data-testid="input-edit-name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Pozicija</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                data-testid="input-edit-title"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                data-testid="input-edit-email"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Telefon</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                data-testid="input-edit-phone"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedEmployee(null);
                  resetForm();
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Otkaži
              </Button>
              <Button
                className="flex-1"
                onClick={() => selectedEmployee && updateEmployeeMutation.mutate({ id: selectedEmployee.id, data: formData })}
                disabled={!formData.name || updateEmployeeMutation.isPending}
                data-testid="button-update-employee"
              >
                <Check className="w-4 h-4 mr-1" />
                {updateEmployeeMutation.isPending ? "Čuvam..." : "Sačuvaj"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isServicesDialogOpen} onOpenChange={setIsServicesDialogOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>
              Usluge - {selectedEmployee?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-xs text-muted-foreground mb-4">
              Odaberite koje usluge ovaj zaposleni može pružati
            </p>
            {!services || services.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nema dostupnih usluga. Prvo dodajte usluge za ovaj biznis.
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                    data-testid={`service-checkbox-${service.id}`}
                  >
                    <Checkbox
                      checked={selectedServiceIds.includes(service.id)}
                      onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {service.duration} min - {service.price} KM
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <Button
              className="w-full mt-4"
              onClick={() => {
                setIsServicesDialogOpen(false);
                setSelectedEmployee(null);
              }}
            >
              Zatvori
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileContainer>
  );
}
