import { google } from "googleapis";
import type { CalendarDay, CalendarEvent } from "./types";

// ── Config ────────────────────────────────────────────────────────────────────
// Calendar IDs to include — comma-separated in env var, defaults to "primary"
function getCalendarIds(): string[] {
  const raw = process.env.GOOGLE_CALENDAR_IDS ?? "primary";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── OAuth2 client ─────────────────────────────────────────────────────────────

function buildAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Google Calendar credentials not configured. " +
        "Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN in .env.local",
    );
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });
  return auth;
}

// ── Time helpers ──────────────────────────────────────────────────────────────

function toLocalTime(date: Date): string {
  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: process.env.NEXT_PUBLIC_TIMEZONE,
  });
}

/** Label for a day: "Today", "Tomorrow", or "Thu, 27 Feb" */
function dayLabel(date: Date, now: Date): string {
  const todayLocal = new Date(
    now.toLocaleString("en-US", { timeZone: process.env.NEXT_PUBLIC_TIMEZONE }),
  );
  const dateLocal = new Date(
    date.toLocaleString("en-US", {
      timeZone: process.env.NEXT_PUBLIC_TIMEZONE,
    }),
  );
  const todayStr = `${todayLocal.getFullYear()}-${todayLocal.getMonth()}-${todayLocal.getDate()}`;
  const dateStr = `${dateLocal.getFullYear()}-${dateLocal.getMonth()}-${dateLocal.getDate()}`;
  const tomorrow = new Date(todayLocal);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${tomorrow.getMonth()}-${tomorrow.getDate()}`;

  if (dateStr === todayStr) return "Today";
  if (dateStr === tomorrowStr) return "Tomorrow";

  return dateLocal.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: process.env.NEXT_PUBLIC_TIMEZONE,
  });
}

// ── Main fetch function ───────────────────────────────────────────────────────

export async function fetchCalendarEvents(): Promise<CalendarDay[]> {
  const auth = buildAuthClient();
  const calApi = google.calendar({ version: "v3", auth });
  const calendarIds = getCalendarIds();

  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(
    now.getTime() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString(); // next 7 days

  // Fetch events from all configured calendars in parallel
  const results = await Promise.allSettled(
    calendarIds.map((calId) =>
      calApi.events.list({
        calendarId: calId,
        timeMin,
        timeMax,
        maxResults: 20,
        singleEvents: true,
        orderBy: "startTime",
      }),
    ),
  );

  // Collect and de-duplicate events by id
  const eventMap = new Map<string, { start: Date; end: Date; raw: any }>();

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const item of result.value.data.items ?? []) {
      if (!item.id || !item.summary) continue;

      const isAllDay = !!item.start?.date && !item.start?.dateTime;
      const startRaw = isAllDay
        ? item.start?.date + "T00:00:00"
        : (item.start?.dateTime ?? "");
      const endRaw = isAllDay
        ? (item.end?.date ?? item.start?.date) + "T23:59:59"
        : (item.end?.dateTime ?? startRaw);

      if (!startRaw) continue;
      const start = new Date(startRaw);
      const end = new Date(endRaw);
      eventMap.set(item.id, { start, end, raw: item as never });
    }
  }

  // Sort all events by start time
  const sorted = Array.from(eventMap.entries()).sort(
    ([, a], [, b]) => a.start.getTime() - b.start.getTime(),
  );

  // Group by day label
  const dayMap = new Map<string, CalendarEvent[]>();

  for (const [id, { start, end, raw }] of sorted) {
    const isAllDay = !!raw.start?.date && !raw.start?.dateTime;
    const label = dayLabel(start, now);

    const isNow = !isAllDay && start <= now && end > now;

    const event: CalendarEvent = {
      id,
      title: raw.summary ?? "(No title)",
      startTime: isAllDay ? null : toLocalTime(start),
      endTime: isAllDay ? null : toLocalTime(end),
      location: raw.location ?? undefined,
      isNow,
      isAllDay,
    };

    if (!dayMap.has(label)) dayMap.set(label, []);
    dayMap.get(label)!.push(event);
  }

  return Array.from(dayMap.entries()).map(([label, events]) => ({
    label,
    events,
  }));
}
