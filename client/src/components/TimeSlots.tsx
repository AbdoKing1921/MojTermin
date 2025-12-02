import { cn } from "@/lib/utils";

interface TimeSlotsProps {
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  openTime?: string;
  closeTime?: string;
  slotDuration?: number;
  bookedSlots?: string[];
}

export function TimeSlots({
  selectedTime,
  onTimeSelect,
  openTime = "09:00",
  closeTime = "18:00",
  slotDuration = 30,
  bookedSlots = [],
}: TimeSlotsProps) {
  const generateTimeSlots = () => {
    const slots: string[] = [];
    const [openHour, openMinute] = openTime.split(":").map(Number);
    const [closeHour, closeMinute] = closeTime.split(":").map(Number);
    
    let currentHour = openHour;
    let currentMinute = openMinute;
    
    while (
      currentHour < closeHour ||
      (currentHour === closeHour && currentMinute < closeMinute)
    ) {
      const timeString = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;
      slots.push(timeString);
      
      currentMinute += slotDuration;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const isSlotBooked = (time: string) => bookedSlots.includes(time);

  return (
    <div className="grid grid-cols-3 gap-3" data-testid="time-slots-grid">
      {timeSlots.map((time) => {
        const isSelected = selectedTime === time;
        const isBooked = isSlotBooked(time);

        return (
          <button
            key={time}
            type="button"
            onClick={() => !isBooked && onTimeSelect(time)}
            disabled={isBooked}
            className={cn(
              "time-slot py-3 px-4 rounded-xl text-sm font-medium transition-all",
              isSelected
                ? "bg-primary text-primary-foreground"
                : isBooked
                  ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                  : "bg-card text-foreground hover:bg-secondary soft-shadow"
            )}
            data-testid={`time-slot-${time.replace(":", "")}`}
            aria-label={`Odaberi vrijeme ${time}`}
          >
            {time}
          </button>
        );
      })}
    </div>
  );
}
