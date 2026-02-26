import { cn } from "@/lib/utils";
import type { WeatherData } from "@/lib/types";
import { WeatherIcon } from "./weather-icons";

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">
      {children}
    </div>
  );
}

// ── Current conditions ────────────────────────────────────────────────────────

function CurrentWeather({
  data,
  sunrise,
  sunset,
}: {
  data: WeatherData["current"];
  sunrise: string;
  sunset: string;
}) {
  return (
    <div className="flex items-center gap-3.5">
      <WeatherIcon type={data.iconType} size={48} />

      <div
        className="font-mono text-[48px] font-extralight leading-none"
        style={{ letterSpacing: "-2px" }}
      >
        {data.temperature}°
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium mb-0.5">{data.description}</div>
        <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-[9px] text-muted-foreground font-mono">
          <span>Feels {data.apparentTemperature}°</span>
          <span>H {data.humidity}%</span>
          <span>↑ {sunrise}</span>
          <span>↓ {sunset}</span>
        </div>
      </div>
    </div>
  );
}

// ── Hourly row ────────────────────────────────────────────────────────────────

function HourlyRow({ hourly }: { hourly: WeatherData["hourly"] }) {
  return (
    <div className="flex justify-between mt-2.5 pt-2.5 border-t border-border">
      {hourly.map((h, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
          <span className="font-mono text-[9px] text-muted-foreground font-medium">
            {h.hour}
          </span>
          <WeatherIcon type={h.iconType} size={18} />
          <span className="font-mono text-[10px] font-semibold">
            {h.temperature}°
          </span>
          {h.precipitationProbability !== null && (
            <span className="font-mono text-[8px] text-muted-foreground">
              {h.precipitationProbability}%
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Forecast grid (2 columns) ─────────────────────────────────────────────────

function ForecastGrid({
  forecast,
  tempRangeMin,
  tempRangeMax,
}: {
  forecast: WeatherData["forecast"];
  tempRangeMin: number;
  tempRangeMax: number;
}) {
  const range = Math.max(tempRangeMax - tempRangeMin, 1);

  return (
    <div className="px-4 pt-2.5 border-t border-border">
      <SectionLabel>Forecast</SectionLabel>
      <div className="grid grid-cols-2 gap-x-px gap-y-px bg-border">
        {forecast.map((f, i) => {
          const leftPct = ((f.tempLow - tempRangeMin) / range) * 100;
          const widthPct = Math.max(
            ((f.tempHigh - f.tempLow) / range) * 100,
            8,
          );
          const isBottomRow = i >= 4;

          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-1.5 py-[3px] bg-white px-3",
                isBottomRow && "pb-2.5",
              )}
            >
              {/* Day label */}
              <span className="text-[10px] font-semibold w-[34px] shrink-0">
                {f.day}
              </span>

              {/* Icon */}
              <WeatherIcon type={f.iconType} size={15} />

              {/* Description */}
              <span className="text-[9px] text-muted-foreground flex-1 truncate">
                {f.description}
              </span>

              {/* Temp range */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="font-mono text-[8px] text-muted-foreground w-[18px] text-right">
                  {f.tempLow}°
                </span>
                <div className="w-[44px] h-[4px] bg-secondary rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 h-full bg-foreground rounded-full"
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                    }}
                  />
                </div>
                <span className="font-mono text-[8px] font-semibold w-[18px]">
                  {f.tempHigh}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Composed section ──────────────────────────────────────────────────────────

export function WeatherSection({ data }: { data: WeatherData }) {
  return (
    <>
      {/* Current + hourly */}
      <div className="px-4 py-2.5">
        <CurrentWeather
          data={data.current}
          sunrise={data.sunrise}
          sunset={data.sunset}
        />
        <HourlyRow hourly={data.hourly} />
      </div>

      {/* Forecast */}
      <ForecastGrid
        forecast={data.forecast}
        tempRangeMin={data.tempRangeMin}
        tempRangeMax={data.tempRangeMax}
      />
    </>
  );
}

// ── Fallback when data is unavailable ────────────────────────────────────────

export function WeatherSectionFallback() {
  return (
    <div className="px-4 py-3 text-[10px] text-muted-foreground italic">
      Weather data unavailable.
    </div>
  );
}
