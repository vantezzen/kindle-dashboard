import { fetchWeather } from "@/lib/weather";
import { fetchCalendarEvents } from "@/lib/calendar";
import { fetchTransitData } from "@/lib/transit";
import KindleDashboard from "@/components/dashboard";

// Force dynamic rendering — no caching, fresh data on every request
export const dynamic = "force-dynamic";

export default async function Page() {
  const now = new Date().toISOString();

  // Fetch all data in parallel; gracefully degrade on individual failures
  const [weatherResult, calendarResult, transitResult] =
    await Promise.allSettled([
      fetchWeather(),
      fetchCalendarEvents(),
      fetchTransitData(),
    ]);

  if (weatherResult.status === "rejected") {
    console.error("[weather]", weatherResult.reason);
  }
  if (calendarResult.status === "rejected") {
    console.error("[calendar]", calendarResult.reason);
  }
  if (transitResult.status === "rejected") {
    console.error("[transit]", transitResult.reason);
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
      transitData={
        transitResult.status === "fulfilled" ? transitResult.value : null
      }
    />
  );
}
