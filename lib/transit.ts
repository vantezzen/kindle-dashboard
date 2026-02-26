import type { TransitData, TransitDeparture, TransitAlert } from "./types";

// ── Time formatting ───────────────────────────────────────────────────────────

function formatLocalTime(date: Date): string {
  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: process.env.NEXT_PUBLIC_TIMEZONE,
  });
}

function buildWhenDisplay(
  plannedWhen: string | null,
  actualWhen: string | null,
  cancelled: boolean,
  now: Date,
): string {
  if (cancelled) return "Cancelled";

  const displayTime = actualWhen
    ? new Date(actualWhen)
    : plannedWhen
      ? new Date(plannedWhen)
      : null;

  if (!displayTime) return "—";

  const diffMs = displayTime.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin <= 0) return "now";
  if (diffMin < 60) return `${diffMin} min`;
  return formatLocalTime(displayTime);
}

// ── Main fetch function ───────────────────────────────────────────────────────

export async function fetchTransitData(): Promise<TransitData> {
  const stopId = process.env.TRANSIT_STATION_ID;

  // Only fetch S-Bahn (suburban) and regional trains - customize as needed
  const params = new URLSearchParams({
    duration: "60",
    results: "20",
    suburban: "true",
    subway: "false",
    tram: "false",
    bus: "false",
    ferry: "false",
    regional: "true",
    express: "false",

    // From in 6 mins
    when: new Date(Date.now() + 6 * 60000).toISOString(),
  });

  const res = await fetch(
    `https://v6.bvg.transport.rest/stops/${stopId}/departures?${params}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error(`BVG API error: ${res.status} for stop ${stopId}`);
  }

  const data = await res.json();

  // The v6 API may return an array directly or an object with a `departures` key
   
  const raw: any[] = Array.isArray(data) ? data : (data.departures ?? []);
  const now = new Date();

  // ── Departures ────────────────────────────────────────────────────────────────
  const departures: TransitDeparture[] = raw
    .slice(0, 10)
    .map((dep, i) => {
      const whenDisplay = buildWhenDisplay(
        dep.plannedWhen ?? null,
        dep.when ?? null,
        !!dep.cancelled,
        now,
      );

      const delaySec: number | null = dep.delay ?? null;
      const delayMinutes = delaySec !== null ? Math.round(delaySec / 60) : null;

      return {
        id: dep.tripId ?? String(i),
        lineName: dep.line?.name ?? "?",
        lineProduct: dep.line?.product ?? "suburban",
        direction: dep.direction ?? "—",
        whenDisplay,
        delayMinutes,
        platform: dep.platform ?? dep.plannedPlatform ?? null,
        cancelled: !!dep.cancelled,
      } satisfies TransitDeparture;
    })
    .filter((d) => d.lineName !== "?");

  // ── Alerts: deduplicated warnings from departure remarks ──────────────────────
  const alertMap = new Map<string, TransitAlert>();

  for (const dep of raw) {
    for (const remark of dep.remarks ?? []) {
      const text = (remark.text ?? remark.summary ?? "").trim();
      // Remove HTML from text
      const cleanText = text.replace(/<[^>]*>/g, "");
      if (!cleanText) continue;

      // Only surface warnings and disruptions — skip routine hints
      const type: string = remark.type ?? "hint";
      if (type !== "warning" && type !== "disruption" && type !== "status") {
        continue;
      }

      if (!alertMap.has(cleanText)) {
        alertMap.set(cleanText, {
          id: remark.id ?? cleanText.slice(0, 32),
          text: cleanText,
          type,
        });
      }
    }
  }

  const alerts = Array.from(alertMap.values()).slice(0, 3);

  return { departures, alerts };
}
