import { fetchWeather } from "@/lib/weather";
import { fetchCalendarEvents } from "@/lib/calendar";
import KindleDashboard from "@/components/dashboard";

// Force dynamic rendering — no caching, fresh data on every request
export const dynamic = "force-dynamic";

export default async function Page() {
  const now = new Date().toISOString();

  const [weatherResult, calendarResult] = await Promise.allSettled([
    fetchWeather(),
    fetchCalendarEvents(),
  ]);

  if (weatherResult.status === "rejected") {
    console.error("[weather]", weatherResult.reason);
  }
  if (calendarResult.status === "rejected") {
    console.error("[calendar]", calendarResult.reason);
  }

  return (
    <KindleDashboard
      now={now}
      weather={
        weatherResult.status === "fulfilled" ? weatherResult.value : null
      }
      calendarDays={
        calendarResult.status === "fulfilled" ? calendarResult.value : null
      }
    />
  );
}
