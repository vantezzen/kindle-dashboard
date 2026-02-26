import { cn } from "@/lib/utils";
import type { TransitData, TransitDeparture, TransitAlert } from "@/lib/types";

// ── Train icon (inline SVG) ───────────────────────────────────────────────────

function TrainIcon() {
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
      <rect x="3" y="2" width="10" height="10" rx="2" />
      <line x1="6" y1="12" x2="6" y2="14.5" />
      <line x1="10" y1="12" x2="10" y2="14.5" />
      <line x1="4" y1="14.5" x2="12" y2="14.5" />
      <circle cx="5.5" cy="9" r="1" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="9" r="1" fill="currentColor" stroke="none" />
      <line x1="3" y1="6.5" x2="13" y2="6.5" />
    </svg>
  );
}

// ── Line badge ────────────────────────────────────────────────────────────────

function LineBadge({
  name,
  isRegional,
}: {
  name: string;
  isRegional?: boolean;
}) {
  return (
    <span
      className={cn(
        "font-mono text-[14px] font-bold h-7 min-w-10 inline-flex items-center justify-center border border-foreground rounded-full px-1.5 shrink-0 leading-none tracking-[-0.3px]",
        isRegional && "bg-foreground text-background border-foreground",
      )}
    >
      {name}
    </span>
  );
}

// ── Departure row ─────────────────────────────────────────────────────────────

function DepartureRow({ dep }: { dep: TransitDeparture }) {
  const isDelayed = dep.delayMinutes !== null && dep.delayMinutes > 0;
  const isCancelled = dep.cancelled;
  const isRegionalTrain =
    dep.lineProduct === "regional" || dep.lineProduct === "express";

  return (
    <div className="flex items-center gap-2 py-1.5">
      <LineBadge name={dep.lineName} isRegional={isRegionalTrain} />

      {/* Direction */}
      <span
        className={cn(
          "text-[18px] flex-1 truncate",
          isCancelled && "line-through text-muted-foreground",
        )}
      >
        {dep.direction.replace(/^(U|S|RB|RE|ICE|IC|T)\s?/, "")}
      </span>

      {/* Time */}
      <span
        className={cn(
          "font-mono text-[18px] shrink-0 text-right",
          isCancelled
            ? "text-muted-foreground line-through"
            : isDelayed
              ? "font-semibold"
              : "text-muted-foreground",
        )}
      >
        {dep.whenDisplay}
        {isDelayed && !isCancelled && (
          <span className="font-normal"> +{dep.delayMinutes}</span>
        )}
      </span>
    </div>
  );
}

// ── Alert box ─────────────────────────────────────────────────────────────────

function AlertBox({ alert }: { alert: TransitAlert }) {
  return (
    <div className="flex items-start gap-2 px-2 py-2 bg-secondary border-l-[3px] border-foreground text-[15px] leading-[1.35] text-foreground/80">
      <span className="font-bold text-[18px] shrink-0 leading-[1.2]">!</span>
      <span>{alert.text}</span>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function TransitSection({ data }: { data: TransitData }) {
  return (
    <div className="flex-1 flex flex-col px-4 py-3 border-l border-border overflow-hidden min-w-0">
      {/* Header */}
      <div className="flex items-center gap-2 text-[15px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-2">
        <TrainIcon />
        {process.env.NEXT_PUBLIC_TRANSIT_STATION_NAME ?? "Transit"}
      </div>

      {/* Departures */}
      <div className="flex flex-col">
        {data.departures.length === 0 ? (
          <div className="text-[15px] text-muted-foreground italic">
            No departures found
          </div>
        ) : (
          data.departures.map((dep) => <DepartureRow key={dep.id} dep={dep} />)
        )}
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <div className="mt-2 flex flex-col gap-1.5 flex-1 overflow-hidden">
          {data.alerts.map((alert) => (
            <AlertBox key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TransitSectionFallback() {
  return (
    <div className="flex-1 px-4 py-3 border-l border-border">
      <div className="flex items-center gap-2 text-[15px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-2">
        <TrainIcon />
        {process.env.NEXT_PUBLIC_TRANSIT_STATION_NAME ?? "Transit"}
      </div>
      <div className="text-[15px] text-muted-foreground italic">
        Transit data unavailable
      </div>
    </div>
  );
}
