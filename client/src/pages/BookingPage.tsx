import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Check, User, Calendar, Clock, Sparkles, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { MobileContainer } from "@/components/MobileContainer";
import { LoadingScreen } from "@/components/LoadingSpinner";
import { BookingCalendar } from "@/components/BookingCalendar";
import { TimeSlots } from "@/components/TimeSlots";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Business, Service, Employee, BusinessHour, BusinessBreak, BusinessHoliday } from "@shared/schema";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                index < currentStep 
                  ? "bg-primary text-primary-foreground" 
                  : index === currentStep 
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            <span className={`text-[10px] mt-1 font-medium ${
              index <= currentStep ? "text-foreground" : "text-muted-foreground"
            }`}>
              {labels[index]}
            </span>
          </div>
          {index < totalSteps - 1 && (
            <div className={`flex-1 h-0.5 mx-2 ${
              index < currentStep ? "bg-primary" : "bg-muted"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

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

  const getServiceInfo = () => {
    if (!selectedService || !services) return null;
    return services.find(s => s.id === selectedService);
  };

  // Calculate current step
  let currentStep = 0;
  if (hasServices && selectedService) currentStep = 1;
  else if (!hasServices) currentStep = 0;
  if (selectedDate) currentStep = hasServices ? 2 : 1;
  if (selectedTime) currentStep = hasServices ? 3 : 2;

  const stepLabels = hasServices 
    ? ["Usluga", "Datum", "Vrijeme", "Potvrda"]
    : ["Datum", "Vrijeme", "Potvrda"];
  const totalSteps = stepLabels.length;

  return (
    <MobileContainer>
      {/* Header */}
      <header className="px-5 pt-5 pb-4 border-b border-border bg-background">
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/business/${id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-xl"
              data-testid="button-back"
              aria-label="Nazad"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground" data-testid="text-booking-title">
              Zakažite termin
            </h1>
            <p className="text-xs text-muted-foreground">{business.name}</p>
          </div>
        </div>
        
        {/* Step Indicator */}
        <StepIndicator 
          currentStep={currentStep} 
          totalSteps={totalSteps} 
          labels={stepLabels} 
        />
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 pb-44 scroll-smooth">
        {/* Services Selection */}
        {services && services.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Odaberite uslugu</h3>
            </div>
            <div className="space-y-2">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedService === service.id
                      ? "border-2 border-primary bg-primary/5"
                      : "hover:border-primary/30"
                  }`}
                  onClick={() => setSelectedService(service.id)}
                  data-testid={`service-${service.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{service.name}</p>
                        {selectedService === service.id && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {service.duration} minuta
                      </p>
                    </div>
                    <span className="text-base font-bold text-primary">{service.price} KM</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Employee Selection */}
        {hasEmployees && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-500" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Odaberite zaposlenog</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  selectedEmployee === null
                    ? "border-2 border-primary bg-primary/5"
                    : "hover:border-primary/30"
                }`}
                onClick={() => setSelectedEmployee(null)}
                data-testid="employee-any"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedEmployee === null ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Bilo ko</p>
                    <p className="text-xs text-muted-foreground">Prvi slobodan</p>
                  </div>
                </div>
              </Card>

              {employees.map((employee) => (
                <Card
                  key={employee.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedEmployee === employee.id
                      ? "border-2 border-primary bg-primary/5"
                      : "hover:border-primary/30"
                  }`}
                  onClick={() => setSelectedEmployee(employee.id)}
                  data-testid={`employee-${employee.id}`}
                >
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Avatar className={`w-12 h-12 ${selectedEmployee === employee.id ? "ring-2 ring-primary" : ""}`}>
                      {employee.imageUrl && (
                        <AvatarImage src={employee.imageUrl} alt={employee.name} />
                      )}
                      <AvatarFallback className="text-sm font-semibold">
                        {employee.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold truncate max-w-full">{employee.name}</p>
                      {employee.title && (
                        <p className="text-xs text-muted-foreground truncate max-w-full">
                          {employee.title}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Date Selection */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-green-500" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Odaberite datum</h3>
          </div>
          <Card className="p-4">
            <BookingCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              blockedDates={holidayDates}
            />
          </Card>
        </section>

        {/* Time Selection */}
        {selectedDate && (
          <section className="mb-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-500" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Odaberite vrijeme</h3>
            </div>
            {isClosed || isHoliday ? (
              <Card className="p-6 text-center">
                <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  {isHoliday 
                    ? `Zatvoreno - ${holidayInfo?.label || "Praznik"}`
                    : "Zatvoreno na ovaj dan"
                  }
                </p>
              </Card>
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

      {/* Booking Summary & Confirm */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 py-4 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
        {canBook && (
          <Card className="p-3 mb-3 bg-muted/50">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold text-foreground">
                  {selectedDate?.toLocaleDateString("sr-Latn", { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'long' 
                  })} u {selectedTime}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {getServiceInfo()?.name}
                  {getEmployeeName() && ` • ${getEmployeeName()}`}
                </p>
              </div>
              {getServiceInfo() && (
                <span className="text-lg font-bold text-primary">{getServiceInfo()?.price} KM</span>
              )}
            </div>
          </Card>
        )}
        <Button
          className="w-full h-12 text-base font-semibold rounded-xl shadow-lg"
          disabled={!canBook || createBookingMutation.isPending}
          onClick={() => createBookingMutation.mutate()}
          data-testid="button-confirm-booking"
        >
          {createBookingMutation.isPending ? "Zakazivanje..." : "Potvrdi rezervaciju"}
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </footer>
    </MobileContainer>
  );
}
