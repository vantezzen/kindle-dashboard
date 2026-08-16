import type { WeatherData, CalendarDay } from "@/lib/types";
// import { getDailyQuote } from "@/lib/quotes";
import { DashboardHeader } from "./header";
import { WeatherSection, WeatherSectionFallback } from "./weather-section";
import { CalendarSection, CalendarSectionFallback } from "./calendar-section";
import { DailyFocusSection } from "./daily-focus-section";
import { Countdown } from "./countdown";

interface KindleDashboardProps {
  now: string; // ISO string, set on server
  weather: WeatherData | null;
  calendarDays: CalendarDay[] | null;
}

export default function KindleDashboard({
  now,
  weather,
  calendarDays,
}: KindleDashboardProps) {
  // const quote = getDailyQuote(new Date(now));
  const refreshTime = new Date(now).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: process.env.NEXT_PUBLIC_TIMEZONE,
  });

  {
    /* ── Kindle canvas: exactly 600×800 ─────────────────────────────────── */
  }
  return (
    <div
      className="bg-white text-black flex flex-col overflow-hidden"
      style={{
        width: 600,
        height: 800,
        fontFamily: "var(--font-geist-sans), 'Helvetica Neue', sans-serif",
      }}
    >
      {/* ── Header: date + time ───────────────────────────────────────── */}
      <DashboardHeader now={now} />
      <Countdown now={now} />

      {/* ── Daily focus: full-width overview ──────────────────────────── */}
      <DailyFocusSection weather={weather} calendarDays={calendarDays} />

      {/* ── Bottom two-column: schedule | weather ─────────────────────── */}
      <div className="flex flex-1 min-h-0 border-t border-border">
        {calendarDays ? (
          <CalendarSection days={calendarDays} />
        ) : (
          <CalendarSectionFallback />
        )}

        {weather ? (
          <WeatherSection data={weather} />
        ) : (
          <WeatherSectionFallback />
        )}
      </div>

      {/* ── Quote ────────────────────────────────────────────────────── */}
      {/* <div className="px-4 py-2 border-t border-border text-center">
        <div className="text-[10px] italic text-muted-foreground leading-[1.4]">
          &ldquo;{quote.text}&rdquo;
        </div>
        <div className="text-[8px] text-muted-foreground mt-0.5">
          — {quote.author}
        </div>
      </div> */}

      {/* ── Status bar ───────────────────────────────────────────────── */}
      <div className="flex justify-between px-4 py-1 border-t border-border/60 font-mono text-[12px] text-muted-foreground/60">
        <span>Kindle Dashboard</span>
        <span>Last refresh: {refreshTime}</span>
      </div>
    </div>
  );
}
