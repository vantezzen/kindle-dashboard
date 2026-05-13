import type { CalendarDay, CalendarEvent, WeatherData } from "@/lib/types";

interface FocusEvent {
  event: CalendarEvent;
  dayLabel: string;
}

const MAX_FOCUS_EVENT_HOURS = 24;

function isToday(label: string) {
  return label.toLowerCase().includes("today");
}

function flattenEvents(days: CalendarDay[] | null): FocusEvent[] {
  return (
    days?.flatMap((day) =>
      day.events.map((event) => ({ event, dayLabel: day.label })),
    ) ?? []
  );
}

function formatEventTime(event: CalendarEvent) {
  if (event.isAllDay) return "All day";
  if (event.startTime && event.endTime) {
    return `${event.startTime}-${event.endTime}`;
  }
  return event.startTime ?? "Time TBD";
}

function isFocusCandidate(event: CalendarEvent) {
  return event.durationHours <= MAX_FOCUS_EVENT_HOURS;
}

function getFocusEvent(events: FocusEvent[]) {
  const candidates = events.filter(({ event }) => isFocusCandidate(event));

  return (
    candidates.find(({ event }) => event.isNow) ??
    candidates.find(({ event }) => !event.isNow) ??
    null
  );
}

function getAvailability(days: CalendarDay[] | null) {
  if (!days) return "Calendar unavailable";

  const today = days.find((day) => isToday(day.label));
  const current = today?.events.find(
    (event) => event.isNow && isFocusCandidate(event),
  );

  if (current) {
    return current.endTime ? `Busy until ${current.endTime}` : "Busy now";
  }

  const nextToday = today?.events.find(
    (event) => !event.isNow && isFocusCandidate(event),
  );
  if (nextToday?.isAllDay) return "All-day event today";
  if (nextToday?.startTime) return `Free until ${nextToday.startTime}`;

  return "No more events today";
}

function getWeatherCue(weather: WeatherData | null) {
  if (!weather) return "Weather unavailable";

  const nextHours = weather.hourly.slice(0, 6);
  const rainHour = nextHours.find(
    (hour) =>
      hour.precipitationProbability !== null &&
      hour.precipitationProbability >= 60,
  );
  const possibleRainHour =
    rainHour ??
    nextHours.find(
      (hour) =>
        hour.precipitationProbability !== null &&
        hour.precipitationProbability >= 30,
    );

  if (possibleRainHour && possibleRainHour.precipitationProbability !== null) {
    const label =
      possibleRainHour.precipitationProbability >= 60
        ? "Rain likely"
        : "Rain possible";
    return `${label} at ${possibleRainHour.hour}:00 (${possibleRainHour.precipitationProbability}%)`;
  }

  if (weather.current.windSpeed >= 25) {
    return `Windy now - ${weather.current.windSpeed} km/h`;
  }

  return `Dry next 6h - ${weather.current.temperature}° now`;
}

export function DailyFocusSection({
  weather,
  calendarDays,
}: {
  weather: WeatherData | null;
  calendarDays: CalendarDay[] | null;
}) {
  const focusEvent = getFocusEvent(flattenEvents(calendarDays));
  const availability = getAvailability(calendarDays);
  const weatherCue = getWeatherCue(weather);
  const isCurrent = focusEvent?.event.isNow ?? false;

  return (
    <div className="shrink-0 px-5 py-5 overflow-hidden border-b border-border">
      <div className="grid grid-cols-[minmax(0,1fr)_156px_176px] gap-4">
        <div className="min-w-0 pl-3 border-l-[3px] border-foreground">
          <div className="text-[13px] font-bold uppercase tracking-[1px] text-muted-foreground mb-1">
            {isCurrent ? "Happening now" : "Next up"}
          </div>
          {focusEvent ? (
            <>
              <div className="text-[23px] font-bold leading-[1.1] truncate">
                {focusEvent.event.title}
              </div>
              <div className="mt-1 font-mono text-[15px] font-bold text-muted-foreground truncate">
                {isToday(focusEvent.dayLabel)
                  ? formatEventTime(focusEvent.event)
                  : `${focusEvent.dayLabel} ${formatEventTime(focusEvent.event)}`}
              </div>
            </>
          ) : (
            <div className="text-[21px] font-bold leading-[1.15]">
              No upcoming events
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="text-[13px] font-bold uppercase tracking-[1px] text-muted-foreground mb-1">
            Time
          </div>
          <div className="text-[20px] font-bold leading-[1.12]">
            {availability}
          </div>
        </div>

        <div className="min-w-0">
          <div className="text-[13px] font-bold uppercase tracking-[1px] text-muted-foreground mb-1">
            Outside
          </div>
          <div className="text-[18px] font-bold leading-[1.15]">
            {weatherCue}
          </div>
        </div>
      </div>
    </div>
  );
}
