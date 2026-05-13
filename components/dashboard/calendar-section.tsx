import { cn } from "@/lib/utils";
import type { CalendarDay, CalendarEvent } from "@/lib/types";

const MAX_VISIBLE_EVENTS = 8;

// ── Calendar icon (inline SVG) ────────────────────────────────────────────────

function CalendarIcon() {
  return (
    <svg
      width={17}
      height={17}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <rect x="2" y="3" width="12" height="12" rx="1.5" />
      <line x1="2" y1="7" x2="14" y2="7" />
      <line x1="5.5" y1="1.5" x2="5.5" y2="4.5" />
      <line x1="10.5" y1="1.5" x2="10.5" y2="4.5" />
    </svg>
  );
}

// ── Event row ─────────────────────────────────────────────────────────────────

function formatEventTime(event: CalendarEvent) {
  if (event.isAllDay) return "All day";
  if (event.startTime && event.endTime) {
    return `${event.startTime}-${event.endTime}`;
  }
  return event.startTime ?? "-";
}

function EventRow({ event }: { event: CalendarEvent }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 py-1.5 pl-2 border-l-2 border-transparent",
        event.isNow && "bg-secondary border-foreground pr-2",
      )}
    >
      <span className="font-mono text-[13px] font-bold text-muted-foreground w-[86px] shrink-0 pt-0.5">
        {formatEventTime(event)}
      </span>

      <div className="flex-1 min-w-0">
        <div className="text-[17px] font-bold truncate leading-[1.25]">
          {event.title}
        </div>
        {event.location && (
          <div className="text-[13px] font-semibold text-muted-foreground truncate">
            {event.location}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Day group ─────────────────────────────────────────────────────────────────

function DayGroup({ day }: { day: CalendarDay }) {
  const isToday = day.label.toLowerCase().includes("today");
  return (
    <div className="flex flex-col gap-0.5 mb-2 border-t border-border/70 first:border-t-0">
      <div
        className={cn(
          "text-[14px] font-bold text-muted-foreground uppercase tracking-[1px] pt-1.5 pb-0.5",
          isToday && "text-foreground",
        )}
      >
        {day.label}
      </div>
      {day.events.map((event) => (
        <EventRow key={event.id} event={event} />
      ))}
    </div>
  );
}

function getVisibleDays(days: CalendarDay[]) {
  const visibleDays: CalendarDay[] = [];
  let remaining = MAX_VISIBLE_EVENTS;
  let hiddenCount = 0;

  for (const day of days) {
    if (day.events.length === 0) continue;

    if (remaining > 0) {
      const visibleEvents = day.events.slice(0, remaining);
      if (visibleEvents.length > 0) {
        visibleDays.push({ ...day, events: visibleEvents });
      }
      remaining -= visibleEvents.length;
      hiddenCount += day.events.length - visibleEvents.length;
    } else {
      hiddenCount += day.events.length;
    }
  }

  return { visibleDays, hiddenCount };
}

// ── Section ───────────────────────────────────────────────────────────────────

export function CalendarSection({ days }: { days: CalendarDay[] }) {
  const hasEvents = days.some((d) => d.events.length > 0);
  const { visibleDays, hiddenCount } = getVisibleDays(days);

  return (
    <div className="flex-1 basis-0 flex flex-col px-4 py-3 overflow-hidden min-w-0">
      {/* Header */}
      <div className="flex items-center gap-2 text-[15px] font-bold uppercase tracking-[1.5px] text-muted-foreground mb-2">
        <CalendarIcon />
        Schedule
      </div>

      {/* Events */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {!hasEvents ? (
          <div className="text-[15px] font-bold text-muted-foreground italic">
            No upcoming events
          </div>
        ) : (
          <>
            {visibleDays.map((day) => (
              <DayGroup key={day.label} day={day} />
            ))}
            {hiddenCount > 0 && (
              <div className="mt-auto pt-1 font-mono text-[13px] font-bold text-muted-foreground">
                +{hiddenCount} more
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function CalendarSectionFallback() {
  return (
    <div className="flex-1 basis-0 px-4 py-3">
      <div className="flex items-center gap-2 text-[15px] font-bold uppercase tracking-[1.5px] text-muted-foreground mb-2">
        <CalendarIcon />
        Schedule
      </div>
      <div className="text-[15px] font-bold text-muted-foreground italic">
        Calendar unavailable
      </div>
    </div>
  );
}
