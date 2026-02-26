import { cn } from "@/lib/utils";
import type { CalendarDay, CalendarEvent } from "@/lib/types";

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

function EventRow({ event }: { event: CalendarEvent }) {
  return (
    <div
      className={cn(
        "flex items-start justify-center gap-2 py-1.5 rounded-lg",
        event.isNow && "bg-secondary px-4 -mx-4",
      )}
    >
      {/* Time */}
      <span className="font-mono text-[15px] text-muted-foreground w-14 shrink-0 pt-px">
        {event.isAllDay ? "Day" : (event.startTime ?? "—")}
      </span>

      {/* Title + location */}
      <div className="flex-1 min-w-0">
        <div className="text-[18px] font-medium truncate leading-[1.3]">
          {event.title}
        </div>
        {event.location && (
          <div className="text-[15px] text-muted-foreground truncate">
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
    <div
      className={cn(
        "flex flex-col gap-0.5 mb-2",
        isToday && "bg-zinc-100 rounded-lg",
      )}
    >
      <div className="text-[15px] font-semibold text-muted-foreground uppercase tracking-[1px] pt-1.5 pb-0.5">
        {day.label}
      </div>
      {day.events.map((event) => (
        <EventRow key={event.id} event={event} />
      ))}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function CalendarSection({ days }: { days: CalendarDay[] }) {
  const hasEvents = days.some((d) => d.events.length > 0);

  return (
    <div className="flex-1 flex flex-col px-4 py-3 overflow-hidden min-w-0">
      {/* Header */}
      <div className="flex items-center gap-2 text-[15px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-2">
        <CalendarIcon />
        Schedule
      </div>

      {/* Events */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {!hasEvents ? (
          <div className="text-[15px] text-muted-foreground italic">
            No upcoming events
          </div>
        ) : (
          days.map((day) =>
            day.events.length > 0 ? (
              <DayGroup key={day.label} day={day} />
            ) : null,
          )
        )}
      </div>
    </div>
  );
}

export function CalendarSectionFallback() {
  return (
    <div className="flex-1 px-4 py-3">
      <div className="flex items-center gap-2 text-[15px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-2">
        <CalendarIcon />
        Schedule
      </div>
      <div className="text-[15px] text-muted-foreground italic">
        Calendar unavailable
      </div>
    </div>
  );
}
