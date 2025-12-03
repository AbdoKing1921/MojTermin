import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Check, User } from "lucide-react";
import { Link } from "wouter";
import { MobileContainer } from "@/components/MobileContainer";
import { LoadingScreen } from "@/components/LoadingSpinner";
import { BookingCalendar } from "@/components/BookingCalendar";
import { TimeSlots } from "@/components/TimeSlots";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Business, Service, Employee, BusinessHour, BusinessBreak, BusinessHoliday } from "@shared/schema";

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Potrebna prijava",
        description: "Morate se prijaviti da biste zakazali termin",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: business, isLoading: businessLoading } = useQuery<Business>({
    queryKey: ["/api/businesses", id],
    enabled: !!id,
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/businesses", id, "services"],
    enabled: !!id,
  });

  const { data: allEmployees } = useQuery<Employee[]>({
    queryKey: ["/api/businesses", id, "employees"],
    enabled: !!id,
  });

  const { data: serviceEmployees } = useQuery<Employee[]>({
    queryKey: ["/api/services", selectedService, "employees"],
    enabled: !!selectedService,
  });

  const { data: businessHours } = useQuery<BusinessHour[]>({
    queryKey: [`/api/businesses/${id}/hours`],
    enabled: !!id,
  });

  const { data: businessBreaks } = useQuery<BusinessBreak[]>({
    queryKey: [`/api/businesses/${id}/breaks`],
    enabled: !!id,
  });

  const { data: businessHolidays } = useQuery<BusinessHoliday[]>({
    queryKey: [`/api/businesses/${id}/holidays`],
    enabled: !!id,
  });

  const holidayDates = businessHolidays?.map(h => h.date) || [];
  const dateStr = selectedDate?.toISOString().split("T")[0];
  const selectedDateStrForHoliday = selectedDate 
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : null;
  const isHolidayEarly = selectedDateStrForHoliday ? holidayDates.includes(selectedDateStrForHoliday) : false;

  const dayOfWeekForQuery = selectedDate ? selectedDate.getDay() : -1;
  const dayHoursForQuery = businessHours?.find(h => h.dayOfWeek === dayOfWeekForQuery);
  const isClosedForQuery = dayHoursForQuery?.isClosed ?? false;

  const { data: bookedSlots } = useQuery<string[]>({
    queryKey: selectedEmployee 
      ? [`/api/businesses/${id}/booked-slots/${dateStr}?employeeId=${selectedEmployee}`]
      : [`/api/businesses/${id}/booked-slots/${dateStr}`],
    enabled: !!id && !!selectedDate && businessHolidays !== undefined && businessHours !== undefined && !isHolidayEarly && !isClosedForQuery,
  });

  const employees = selectedService && serviceEmployees && serviceEmployees.length > 0 
    ? serviceEmployees 
    : allEmployees;

  const hasEmployees = employees && employees.length > 0;

  useEffect(() => {
    if (selectedService) {
      setSelectedEmployee(null);
    }
  }, [selectedService]);

  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate, selectedEmployee]);

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedTime) {
        throw new Error("Molimo odaberite datum i vrijeme");
      }
      
      if (services && services.length > 0 && !selectedService) {
        throw new Error("Molimo odaberite uslugu");
      }

      const dateStr = selectedDate.toISOString().split("T")[0];
      
      return apiRequest("POST", "/api/bookings", {
        businessId: id,
        serviceId: selectedService,
        employeeId: selectedEmployee,
        date: dateStr,
        time: selectedTime,
      });
    },
    onSuccess: () => {
      toast({
        title: "Uspješno zakazano!",
        description: "Vaša rezervacija je potvrđena.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      navigate("/bookings");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Neautorizovano",
          description: "Prijavite se ponovo...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Greška",
        description: error.message || "Došlo je do greške pri rezervaciji",
        variant: "destructive",
      });
    },
  });

  if (businessLoading || authLoading) {
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

  const dayOfWeek = selectedDate ? selectedDate.getDay() : -1;
  const dayHours = businessHours?.find(h => h.dayOfWeek === dayOfWeek);
  const dayBreaks = businessBreaks?.filter(b => b.dayOfWeek === dayOfWeek) || [];
  
  const openTime = dayHours?.openTime?.slice(0, 5) || business.openTime || "09:00";
  const closeTime = dayHours?.closeTime?.slice(0, 5) || business.closeTime || "18:00";
  const isClosed = dayHours?.isClosed ?? false;
  
  const isHoliday = isHolidayEarly;
  const holidayInfo = isHoliday && businessHolidays
    ? businessHolidays.find(h => h.date === selectedDateStrForHoliday)
    : null;

  const breakSlots = dayBreaks.flatMap(br => {
    const slots: string[] = [];
    if (!br.startTime || !br.endTime) return slots;
    
    const [startH, startM] = br.startTime.split(":").map(Number);
    const [endH, endM] = br.endTime.split(":").map(Number);
    
    let currentH = startH;
    let currentM = startM;
    const slotDuration = business.slotDuration || 30;
    
    while (currentH < endH || (currentH === endH && currentM < endM)) {
      const timeStr = `${String(currentH).padStart(2, "0")}:${String(currentM).padStart(2, "0")}`;
      slots.push(timeStr);
      
      currentM += slotDuration;
      if (currentM >= 60) {
        currentH += Math.floor(currentM / 60);
        currentM = currentM % 60;
      }
    }
    return slots;
  });

  const allBookedSlots = [...(bookedSlots || []), ...breakSlots];

  const hasServices = services && services.length > 0;
  const canBook = selectedDate && selectedTime && !isClosed && !isHoliday && (!hasServices || selectedService);

  const getEmployeeName = () => {
    if (!selectedEmployee || !employees) return null;
    const emp = employees.find(e => e.id === selectedEmployee);
    return emp?.name;
  };

  const getServiceName = () => {
    if (!selectedService || !services) return null;
    const svc = services.find(s => s.id === selectedService);
    return svc?.name;
  };

  return (
    <MobileContainer>
      <header className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href={`/business/${id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-lg"
              data-testid="button-back"
              aria-label="Nazad"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-base font-semibold text-foreground" data-testid="text-booking-title">
              Zakažite termin
            </h1>
            <p className="text-xs text-muted-foreground">{business.name}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 pb-24 scroll-smooth">
        {services && services.length > 0 && (
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">1. Odaberite uslugu</h3>
            <div className="space-y-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedService(service.id)}
                  className={`w-full p-3 rounded-lg text-left border transition-colors ${
                    selectedService === service.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:bg-secondary"
                  }`}
                  data-testid={`service-${service.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className={`text-xs mt-0.5 ${
                        selectedService === service.id 
                          ? "text-primary-foreground/70" 
                          : "text-muted-foreground"
                      }`}>
                        {service.duration} min
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{service.price} KM</span>
                      {selectedService === service.id && (
                        <Check className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {hasEmployees && (
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">2. Odaberite zaposlenog</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className={`p-3 rounded-lg text-center border transition-colors ${
                  selectedEmployee === null
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:bg-secondary"
                }`}
                data-testid="employee-any"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedEmployee === null ? "bg-primary-foreground/20" : "bg-secondary"
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Bilo ko</p>
                    <p className={`text-xs ${
                      selectedEmployee === null 
                        ? "text-primary-foreground/70" 
                        : "text-muted-foreground"
                    }`}>
                      Prvi slobodan
                    </p>
                  </div>
                </div>
              </button>

              {employees.map((employee) => (
                <button
                  key={employee.id}
                  type="button"
                  onClick={() => setSelectedEmployee(employee.id)}
                  className={`p-3 rounded-lg text-center border transition-colors ${
                    selectedEmployee === employee.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:bg-secondary"
                  }`}
                  data-testid={`employee-${employee.id}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="w-10 h-10">
                      {employee.imageUrl && (
                        <AvatarImage src={employee.imageUrl} alt={employee.name} />
                      )}
                      <AvatarFallback className={selectedEmployee === employee.id ? "bg-primary-foreground/20" : ""}>
                        {employee.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium truncate max-w-full">{employee.name}</p>
                      {employee.title && (
                        <p className={`text-xs truncate max-w-full ${
                          selectedEmployee === employee.id 
                            ? "text-primary-foreground/70" 
                            : "text-muted-foreground"
                        }`}>
                          {employee.title}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {hasEmployees ? "3. Odaberite datum" : "2. Odaberite datum"}
          </h3>
          <BookingCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            blockedDates={holidayDates}
          />
        </section>

        {selectedDate && (
          <section className="mb-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {hasEmployees ? "4. Odaberite vrijeme" : "3. Odaberite vrijeme"}
            </h3>
            {isClosed || isHoliday ? (
              <div className="p-4 bg-secondary/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  {isHoliday 
                    ? `Zatvoreno - ${holidayInfo?.label || "Praznik"}`
                    : "Zatvoreno na ovaj dan"
                  }
                </p>
              </div>
            ) : (
              <TimeSlots
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
                openTime={openTime}
                closeTime={closeTime}
                slotDuration={business.slotDuration || 30}
                bookedSlots={allBookedSlots}
              />
            )}
          </section>
        )}
      </main>

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 py-4 bg-card/95 backdrop-blur-sm border-t border-border">
        <Button
          className="w-full h-11 text-sm font-semibold rounded-lg"
          disabled={!canBook || createBookingMutation.isPending}
          onClick={() => createBookingMutation.mutate()}
          data-testid="button-confirm-booking"
        >
          {createBookingMutation.isPending ? "Zakazivanje..." : "Potvrdi rezervaciju"}
        </Button>
        {canBook && (
          <div className="text-center text-xs text-muted-foreground mt-2 space-y-0.5">
            <p>{selectedDate?.toLocaleDateString("sr-Latn")} u {selectedTime}</p>
            {getServiceName() && <p>{getServiceName()}</p>}
            {getEmployeeName() && <p>sa {getEmployeeName()}</p>}
          </div>
        )}
      </footer>
    </MobileContainer>
  );
}
