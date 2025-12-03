import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Clock, Coffee, Calendar, Plus, Trash2, Check, X } from "lucide-react";
import { Link, useParams } from "wouter";
import { MobileContainer } from "@/components/MobileContainer";
import { LoadingScreen } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { Business, BusinessHour, BusinessBreak, BusinessHoliday } from "@shared/schema";

const DAYS_OF_WEEK = [
  { value: 0, label: "Nedjelja" },
  { value: 1, label: "Ponedjeljak" },
  { value: 2, label: "Utorak" },
  { value: 3, label: "Srijeda" },
  { value: 4, label: "Četvrtak" },
  { value: 5, label: "Petak" },
  { value: 6, label: "Subota" },
];

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

export default function BusinessSchedule() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const params = useParams<{ businessId: string }>();
  const businessId = params.businessId;

  const [activeTab, setActiveTab] = useState("hours");
  const [isBreakDialogOpen, setIsBreakDialogOpen] = useState(false);
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [breakFormData, setBreakFormData] = useState({
    dayOfWeek: "1",
    startTime: "12:00",
    endTime: "13:00",
    label: "",
  });
  const [holidayFormData, setHolidayFormData] = useState({
    date: "",
    label: "",
  });

  const { data: business, isLoading: businessLoading } = useQuery<Business>({
    queryKey: ["/api/businesses", businessId],
    enabled: !!businessId && isAuthenticated,
  });

  const { data: hours, isLoading: hoursLoading } = useQuery<BusinessHour[]>({
    queryKey: [`/api/businesses/${businessId}/hours`],
    enabled: !!businessId && isAuthenticated,
  });

  const { data: breaks } = useQuery<BusinessBreak[]>({
    queryKey: [`/api/businesses/${businessId}/breaks`],
    enabled: !!businessId && isAuthenticated,
  });

  const { data: holidays } = useQuery<BusinessHoliday[]>({
    queryKey: [`/api/businesses/${businessId}/holidays`],
    enabled: !!businessId && isAuthenticated,
  });

  const [localHours, setLocalHours] = useState<Record<number, { openTime: string; closeTime: string; isClosed: boolean }>>({});

  useEffect(() => {
    if (hours) {
      const hoursMap: Record<number, { openTime: string; closeTime: string; isClosed: boolean }> = {};
      for (let i = 0; i < 7; i++) {
        const dayHours = hours.find((h) => h.dayOfWeek === i);
        hoursMap[i] = {
          openTime: dayHours?.openTime || "09:00",
          closeTime: dayHours?.closeTime || "18:00",
          isClosed: dayHours?.isClosed ?? (i === 0),
        };
      }
      setLocalHours(hoursMap);
    } else {
      const defaultHours: Record<number, { openTime: string; closeTime: string; isClosed: boolean }> = {};
      for (let i = 0; i < 7; i++) {
        defaultHours[i] = {
          openTime: "09:00",
          closeTime: "18:00",
          isClosed: i === 0,
        };
      }
      setLocalHours(defaultHours);
    }
  }, [hours]);

  const updateHoursMutation = useMutation({
    mutationFn: async (data: Array<{ dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }>) => {
      return apiRequest("PUT", `/api/admin/businesses/${businessId}/hours`, { hours: data });
    },
    onSuccess: () => {
      toast({ title: "Uspješno", description: "Radno vrijeme je sačuvano" });
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/hours`] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const addBreakMutation = useMutation({
    mutationFn: async (data: typeof breakFormData) => {
      return apiRequest("POST", `/api/admin/businesses/${businessId}/breaks`, {
        ...data,
        dayOfWeek: parseInt(data.dayOfWeek),
      });
    },
    onSuccess: () => {
      toast({ title: "Uspješno", description: "Pauza je dodana" });
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/breaks`] });
      setIsBreakDialogOpen(false);
      setBreakFormData({ dayOfWeek: "1", startTime: "12:00", endTime: "13:00", label: "" });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const deleteBreakMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/breaks/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Uspješno", description: "Pauza je uklonjena" });
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/breaks`] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const addHolidayMutation = useMutation({
    mutationFn: async (data: typeof holidayFormData) => {
      return apiRequest("POST", `/api/admin/businesses/${businessId}/holidays`, data);
    },
    onSuccess: () => {
      toast({ title: "Uspješno", description: "Praznik je dodan" });
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/holidays`] });
      setIsHolidayDialogOpen(false);
      setHolidayFormData({ date: "", label: "" });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const deleteHolidayMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/holidays/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Uspješno", description: "Praznik je uklonjen" });
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/holidays`] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const handleSaveHours = () => {
    const hoursArray = Object.entries(localHours).map(([day, data]) => ({
      dayOfWeek: parseInt(day),
      openTime: data.openTime,
      closeTime: data.closeTime,
      isClosed: data.isClosed,
    }));
    updateHoursMutation.mutate(hoursArray);
  };

  const updateLocalHours = (day: number, field: string, value: string | boolean) => {
    setLocalHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || businessLoading || hoursLoading) {
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
              Radno vrijeme
            </h1>
            <p className="text-xs text-muted-foreground">{business?.name}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 pb-20 scroll-smooth">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="hours" className="flex-1 text-xs gap-1" data-testid="tab-hours">
              <Clock className="w-3.5 h-3.5" />
              Sati
            </TabsTrigger>
            <TabsTrigger value="breaks" className="flex-1 text-xs gap-1" data-testid="tab-breaks">
              <Coffee className="w-3.5 h-3.5" />
              Pauze
            </TabsTrigger>
            <TabsTrigger value="holidays" className="flex-1 text-xs gap-1" data-testid="tab-holidays">
              <Calendar className="w-3.5 h-3.5" />
              Praznici
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hours" className="mt-0">
            <div className="space-y-3">
              {DAYS_OF_WEEK.map((day) => (
                <Card key={day.value} className="p-4" data-testid={`day-card-${day.value}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">{day.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {localHours[day.value]?.isClosed ? "Zatvoreno" : "Otvoreno"}
                      </span>
                      <Switch
                        checked={!localHours[day.value]?.isClosed}
                        onCheckedChange={(checked) => updateLocalHours(day.value, "isClosed", !checked)}
                        data-testid={`toggle-day-${day.value}`}
                      />
                    </div>
                  </div>
                  {!localHours[day.value]?.isClosed && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Otvaranje</label>
                        <Select
                          value={localHours[day.value]?.openTime || "09:00"}
                          onValueChange={(value) => updateLocalHours(day.value, "openTime", value)}
                        >
                          <SelectTrigger className="h-9 text-xs" data-testid={`select-open-${day.value}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {generateTimeOptions().map((time) => (
                              <SelectItem key={time} value={time} className="text-xs">
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Zatvaranje</label>
                        <Select
                          value={localHours[day.value]?.closeTime || "18:00"}
                          onValueChange={(value) => updateLocalHours(day.value, "closeTime", value)}
                        >
                          <SelectTrigger className="h-9 text-xs" data-testid={`select-close-${day.value}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {generateTimeOptions().map((time) => (
                              <SelectItem key={time} value={time} className="text-xs">
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
              <Button
                className="w-full"
                onClick={handleSaveHours}
                disabled={updateHoursMutation.isPending}
                data-testid="button-save-hours"
              >
                <Check className="w-4 h-4 mr-1" />
                {updateHoursMutation.isPending ? "Čuvam..." : "Sačuvaj radno vrijeme"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="breaks" className="mt-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground">
                Pauze za ručak, odmor, itd.
              </p>
              <Button size="sm" onClick={() => setIsBreakDialogOpen(true)} data-testid="button-add-break">
                <Plus className="w-4 h-4 mr-1" />
                Dodaj
              </Button>
            </div>

            {!breaks || breaks.length === 0 ? (
              <div className="text-center py-8">
                <Coffee className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nema definisanih pauza</p>
              </div>
            ) : (
              <div className="space-y-3">
                {breaks.map((breakItem) => (
                  <Card key={breakItem.id} className="p-4" data-testid={`break-card-${breakItem.id}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {DAYS_OF_WEEK.find((d) => d.value === breakItem.dayOfWeek)?.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {breakItem.startTime} - {breakItem.endTime}
                          {breakItem.label && ` (${breakItem.label})`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteBreakMutation.mutate(breakItem.id)}
                        disabled={deleteBreakMutation.isPending}
                        data-testid={`button-delete-break-${breakItem.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="holidays" className="mt-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground">
                Praznici i neradni dani
              </p>
              <Button size="sm" onClick={() => setIsHolidayDialogOpen(true)} data-testid="button-add-holiday">
                <Plus className="w-4 h-4 mr-1" />
                Dodaj
              </Button>
            </div>

            {!holidays || holidays.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nema definisanih praznika</p>
              </div>
            ) : (
              <div className="space-y-3">
                {holidays.map((holiday) => (
                  <Card key={holiday.id} className="p-4" data-testid={`holiday-card-${holiday.id}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {holiday.label || "Neradni dan"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(holiday.date).toLocaleDateString("sr-Latn", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteHolidayMutation.mutate(holiday.id)}
                        disabled={deleteHolidayMutation.isPending}
                        data-testid={`button-delete-holiday-${holiday.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isBreakDialogOpen} onOpenChange={setIsBreakDialogOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Dodaj pauzu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Dan</label>
              <Select
                value={breakFormData.dayOfWeek}
                onValueChange={(value) => setBreakFormData((prev) => ({ ...prev, dayOfWeek: value }))}
              >
                <SelectTrigger data-testid="select-break-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Od</label>
                <Select
                  value={breakFormData.startTime}
                  onValueChange={(value) => setBreakFormData((prev) => ({ ...prev, startTime: value }))}
                >
                  <SelectTrigger data-testid="select-break-start">
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
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Do</label>
                <Select
                  value={breakFormData.endTime}
                  onValueChange={(value) => setBreakFormData((prev) => ({ ...prev, endTime: value }))}
                >
                  <SelectTrigger data-testid="select-break-end">
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
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Naziv (opcionalno)</label>
              <Input
                value={breakFormData.label}
                onChange={(e) => setBreakFormData((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="npr. Ručak, Odmor"
                data-testid="input-break-label"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsBreakDialogOpen(false)}
              >
                <X className="w-4 h-4 mr-1" />
                Otkaži
              </Button>
              <Button
                className="flex-1"
                onClick={() => addBreakMutation.mutate(breakFormData)}
                disabled={addBreakMutation.isPending}
                data-testid="button-save-break"
              >
                <Check className="w-4 h-4 mr-1" />
                {addBreakMutation.isPending ? "Čuvam..." : "Sačuvaj"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Dodaj praznik</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Datum</label>
              <Input
                type="date"
                value={holidayFormData.date}
                onChange={(e) => setHolidayFormData((prev) => ({ ...prev, date: e.target.value }))}
                data-testid="input-holiday-date"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Naziv (opcionalno)</label>
              <Input
                value={holidayFormData.label}
                onChange={(e) => setHolidayFormData((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="npr. Nova Godina, Bajram"
                data-testid="input-holiday-label"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsHolidayDialogOpen(false)}
              >
                <X className="w-4 h-4 mr-1" />
                Otkaži
              </Button>
              <Button
                className="flex-1"
                onClick={() => addHolidayMutation.mutate(holidayFormData)}
                disabled={!holidayFormData.date || addHolidayMutation.isPending}
                data-testid="button-save-holiday"
              >
                <Check className="w-4 h-4 mr-1" />
                {addHolidayMutation.isPending ? "Čuvam..." : "Sačuvaj"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MobileContainer>
  );
}
