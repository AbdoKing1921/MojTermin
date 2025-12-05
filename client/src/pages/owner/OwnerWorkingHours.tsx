import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
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
import { Clock, Save, Plus, Trash2, Coffee, Calendar } from "lucide-react";
import OwnerLayout from "./OwnerLayout";
import type { Business, BusinessHour, BusinessBreak, BusinessHoliday } from "@shared/schema";

const DAYS = [
  { value: 0, label: "Nedjelja", short: "Ned" },
  { value: 1, label: "Ponedjeljak", short: "Pon" },
  { value: 2, label: "Utorak", short: "Uto" },
  { value: 3, label: "Srijeda", short: "Sri" },
  { value: 4, label: "Četvrtak", short: "Čet" },
  { value: 5, label: "Petak", short: "Pet" },
  { value: 6, label: "Subota", short: "Sub" },
];

interface DaySchedule {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface BreakTime {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  label: string;
}

export default function OwnerWorkingHours() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [breaks, setBreaks] = useState<BreakTime[]>([]);
  const [newHoliday, setNewHoliday] = useState({ date: "", label: "" });

  const { data: businesses, isLoading: businessesLoading } = useQuery<Business[]>({
    queryKey: ["/api/owner/businesses"],
    enabled: isAuthenticated,
  });

  const selectedBusiness = businesses?.[0];

  const { data: businessHours } = useQuery<BusinessHour[]>({
    queryKey: ["/api/owner/businesses", selectedBusiness?.id, "hours"],
    enabled: !!selectedBusiness?.id,
  });

  const { data: businessBreaks } = useQuery<BusinessBreak[]>({
    queryKey: ["/api/owner/businesses", selectedBusiness?.id, "breaks"],
    enabled: !!selectedBusiness?.id,
  });

  const { data: businessHolidays, isLoading: holidaysLoading } = useQuery<BusinessHoliday[]>({
    queryKey: ["/api/owner/businesses", selectedBusiness?.id, "holidays"],
    enabled: !!selectedBusiness?.id,
  });

  useEffect(() => {
    if (businessHours && businessHours.length > 0) {
      const newSchedule = DAYS.map(day => {
        const existing = businessHours.find(h => h.dayOfWeek === day.value);
        return {
          dayOfWeek: day.value,
          openTime: existing?.openTime || "09:00",
          closeTime: existing?.closeTime || "17:00",
          isClosed: existing?.isClosed || false,
        };
      });
      setSchedule(newSchedule);
    } else {
      setSchedule(DAYS.map(day => ({
        dayOfWeek: day.value,
        openTime: "09:00",
        closeTime: "17:00",
        isClosed: day.value === 0,
      })));
    }
  }, [businessHours]);

  useEffect(() => {
    if (businessBreaks) {
      setBreaks(businessBreaks.map(b => ({
        id: b.id,
        dayOfWeek: b.dayOfWeek,
        startTime: b.startTime,
        endTime: b.endTime,
        label: b.label || "Pauza",
      })));
    }
  }, [businessBreaks]);

  const saveHoursMutation = useMutation({
    mutationFn: async (hours: DaySchedule[]) => {
      return apiRequest("PUT", `/api/owner/businesses/${selectedBusiness?.id}/hours`, { hours });
    },
    onSuccess: () => {
      toast({ title: "Radno vrijeme sačuvano" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses", selectedBusiness?.id, "hours"] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const saveBreakMutation = useMutation({
    mutationFn: async (breakData: BreakTime) => {
      return apiRequest("POST", `/api/owner/businesses/${selectedBusiness?.id}/breaks`, breakData);
    },
    onSuccess: () => {
      toast({ title: "Pauza dodana" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses", selectedBusiness?.id, "breaks"] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const deleteBreakMutation = useMutation({
    mutationFn: async (breakId: string) => {
      return apiRequest("DELETE", `/api/owner/businesses/${selectedBusiness?.id}/breaks/${breakId}`);
    },
    onSuccess: () => {
      toast({ title: "Pauza obrisana" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses", selectedBusiness?.id, "breaks"] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const addHolidayMutation = useMutation({
    mutationFn: async (holiday: { date: string; label: string }) => {
      return apiRequest("POST", `/api/owner/businesses/${selectedBusiness?.id}/holidays`, holiday);
    },
    onSuccess: () => {
      toast({ title: "Praznik dodan" });
      setNewHoliday({ date: "", label: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses", selectedBusiness?.id, "holidays"] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const deleteHolidayMutation = useMutation({
    mutationFn: async (holidayId: string) => {
      return apiRequest("DELETE", `/api/owner/businesses/${selectedBusiness?.id}/holidays/${holidayId}`);
    },
    onSuccess: () => {
      toast({ title: "Praznik obrisan" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses", selectedBusiness?.id, "holidays"] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const updateDaySchedule = (dayOfWeek: number, field: keyof DaySchedule, value: any) => {
    setSchedule(prev => 
      prev.map(day => 
        day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day
      )
    );
  };

  const handleSaveHours = () => {
    saveHoursMutation.mutate(schedule);
  };

  const handleAddBreak = (dayOfWeek: number) => {
    saveBreakMutation.mutate({
      dayOfWeek,
      startTime: "12:00",
      endTime: "13:00",
      label: "Pauza za ručak",
    });
  };

  if (businessesLoading) {
    return (
      <OwnerLayout title="Radno vrijeme">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Radno vrijeme" subtitle="Postavite radno vrijeme i pauze za svaki dan">
      <div className="space-y-6 max-w-3xl">
        {/* Daily Schedule */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Sedmični raspored
            </h3>
            <Button 
              onClick={handleSaveHours}
              disabled={saveHoursMutation.isPending}
              className="gap-2"
              data-testid="button-save-hours"
            >
              {saveHoursMutation.isPending ? <LoadingSpinner /> : <Save className="w-4 h-4" />}
              Sačuvaj
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Postavite radno vrijeme u minutama - možete unijeti bilo koje vrijeme (npr. 08:45, 17:30).
          </p>

          <div className="space-y-4">
            {DAYS.map(day => {
              const daySchedule = schedule.find(s => s.dayOfWeek === day.value) || {
                openTime: "09:00",
                closeTime: "17:00",
                isClosed: false,
              };
              const dayBreaks = breaks.filter(b => b.dayOfWeek === day.value);

              return (
                <div 
                  key={day.value} 
                  className={`p-4 rounded-lg border ${daySchedule.isClosed ? 'bg-muted/50 border-muted' : 'border-border'}`}
                >
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Day Name */}
                    <div className="w-24">
                      <span className={`font-medium ${daySchedule.isClosed ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {day.label}
                      </span>
                    </div>

                    {/* Closed Switch */}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!daySchedule.isClosed}
                        onCheckedChange={(checked) => updateDaySchedule(day.value, "isClosed", !checked)}
                        data-testid={`switch-open-${day.value}`}
                      />
                      <Label className="text-sm text-muted-foreground">
                        {daySchedule.isClosed ? "Zatvoreno" : "Otvoreno"}
                      </Label>
                    </div>

                    {/* Time Inputs */}
                    {!daySchedule.isClosed && (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={daySchedule.openTime}
                          onChange={(e) => updateDaySchedule(day.value, "openTime", e.target.value)}
                          className="w-28"
                          data-testid={`input-open-${day.value}`}
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="time"
                          value={daySchedule.closeTime}
                          onChange={(e) => updateDaySchedule(day.value, "closeTime", e.target.value)}
                          className="w-28"
                          data-testid={`input-close-${day.value}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddBreak(day.value)}
                          className="gap-1 text-xs"
                          data-testid={`button-add-break-${day.value}`}
                        >
                          <Coffee className="w-3 h-3" />
                          Pauza
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Breaks for this day */}
                  {!daySchedule.isClosed && dayBreaks.length > 0 && (
                    <div className="mt-3 pl-28 space-y-2">
                      {dayBreaks.map((breakItem) => (
                        <div key={breakItem.id} className="flex items-center gap-2 text-sm">
                          <Coffee className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {breakItem.label}: {breakItem.startTime} - {breakItem.endTime}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => breakItem.id && deleteBreakMutation.mutate(breakItem.id)}
                            data-testid={`button-delete-break-${breakItem.id}`}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Holidays */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Praznici i neradni dani
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Označite dane kada salon neće raditi (praznici, godišnji odmor, itd.)
          </p>

          {/* Add Holiday Form */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Input
              type="date"
              value={newHoliday.date}
              onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
              className="w-40"
              data-testid="input-holiday-date"
            />
            <Input
              placeholder="Naziv (npr. Nova Godina)"
              value={newHoliday.label}
              onChange={(e) => setNewHoliday(prev => ({ ...prev, label: e.target.value }))}
              className="flex-1 min-w-[200px]"
              data-testid="input-holiday-label"
            />
            <Button
              onClick={() => newHoliday.date && addHolidayMutation.mutate(newHoliday)}
              disabled={!newHoliday.date || addHolidayMutation.isPending}
              className="gap-2"
              data-testid="button-add-holiday"
            >
              {addHolidayMutation.isPending ? <LoadingSpinner /> : <Plus className="w-4 h-4" />}
              Dodaj
            </Button>
          </div>

          {/* Holiday List */}
          {holidaysLoading ? (
            <LoadingSpinner />
          ) : businessHolidays && businessHolidays.length > 0 ? (
            <div className="space-y-2">
              {businessHolidays.map((holiday) => (
                <div 
                  key={holiday.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      {new Date(holiday.date).toLocaleDateString("sr-Latn", { 
                        day: "numeric", 
                        month: "long",
                        year: "numeric"
                      })}
                    </span>
                    {holiday.label && (
                      <Badge variant="outline" className="text-xs">
                        {holiday.label}
                      </Badge>
                    )}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-destructive hover:text-destructive"
                        data-testid={`button-delete-holiday-${holiday.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Obrisati praznik?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ova radnja se ne može poništiti.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Odustani</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteHolidayMutation.mutate(holiday.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Obriši
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nema postavljenih praznika
            </p>
          )}
        </Card>
      </div>
    </OwnerLayout>
  );
}
