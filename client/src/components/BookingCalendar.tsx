import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  blockedDates?: string[];
}

const DAYS = ["N", "P", "U", "S", "Č", "P", "S"];
const MONTHS = [
  "Januar", "Februar", "Mart", "April", "Maj", "Jun",
  "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
];

export function BookingCalendar({ 
  selectedDate, 
  onDateSelect,
  blockedDates = []
}: BookingCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isDateBlocked = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return blockedDates.includes(dateStr);
  };

  const isPastDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return date < todayStart;
  };

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const handleDateClick = (day: number) => {
    if (isPastDate(day) || isDateBlocked(day)) return;
    const newDate = new Date(currentYear, currentMonth, day);
    onDateSelect(newDate);
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);
  const days = [];

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const isBlocked = isDateBlocked(day);
    const isPast = isPastDate(day);
    const isSelected = isSelectedDate(day);
    const isTodayDate = isToday(day);
    const isDisabled = isPast || isBlocked;

    days.push(
      <button
        key={day}
        type="button"
        onClick={() => handleDateClick(day)}
        disabled={isDisabled}
        className={`calendar-day w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
          ${isSelected 
            ? "bg-primary text-primary-foreground" 
            : isTodayDate
              ? "bg-primary/10 text-primary"
              : isDisabled
                ? "opacity-40 cursor-not-allowed text-muted-foreground"
                : "text-foreground hover:bg-secondary"
          }
        `}
        data-testid={`calendar-day-${day}`}
        aria-label={`${day}. ${MONTHS[currentMonth]} ${currentYear}`}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="bg-secondary rounded-3xl p-5 soft-shadow">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          className="w-9 h-9 rounded-full bg-card"
          data-testid="button-prev-month"
          aria-label="Prethodni mjesec"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-bold text-foreground" data-testid="text-current-month">
          {MONTHS[currentMonth]} {currentYear}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="w-9 h-9 rounded-full bg-card"
          data-testid="button-next-month"
          aria-label="Sljedeći mjesec"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {DAYS.map((day, index) => (
          <div
            key={index}
            className="text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days}
      </div>
    </div>
  );
}
