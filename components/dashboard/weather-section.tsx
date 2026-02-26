import { cn } from "@/lib/utils";
import type { WeatherData } from "@/lib/types";
import { WeatherIcon } from "./weather-icons";

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[16px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-2">
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
    <div className="flex items-center gap-4">
      <WeatherIcon type={data.iconType} size={72} />

      <div
        className="font-mono text-[72px] font-extralight leading-none"
        style={{ letterSpacing: "-3px" }}
      >
        {data.temperature}°
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[20px] font-medium mb-1.5">{data.description}</div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[15px] text-muted-foreground font-mono">
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
    <div className="flex justify-between mt-3 pt-3 border-t border-border">
      {hourly.slice(0, 6).map((h, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <span className="font-mono text-[15px] text-muted-foreground font-medium">
            {h.hour}
          </span>
          <div className="flex gap-3">
            <WeatherIcon type={h.iconType} size={30} />

            <span className="font-mono text-[18px] font-semibold">
              {h.temperature}°
            </span>
            {h.precipitationProbability !== null && (
              <span className="font-mono text-[14px] text-muted-foreground">
                {h.precipitationProbability}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Forecast grid (2 columns, 4 days) ─────────────────────────────────────────

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
  const days = forecast.slice(0, 4);

  return (
    <div className="px-5 pt-3 border-t border-border">
      <SectionLabel>Forecast</SectionLabel>
      <div className="grid grid-cols-2 gap-x-px gap-y-px bg-border">
        {days.map((f, i) => {
          const leftPct = ((f.tempLow - tempRangeMin) / range) * 100;
          const widthPct = Math.max(
            ((f.tempHigh - f.tempLow) / range) * 100,
            8,
          );
          const isBottomRow = i >= 2;

          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 py-1.5 bg-white px-3",
                isBottomRow && "pb-3",
              )}
            >
              {/* Day label */}
              <span className="text-[18px] font-semibold w-12 shrink-0">
                {f.day}
              </span>
              <div className="flex-1"></div>

              {/* Icon */}
              <WeatherIcon type={f.iconType} size={22} />

              {/* Description */}
              {/* <span className="text-[15px] text-muted-foreground flex-1 truncate">
                {f.description}
              </span> */}

              {/* Temp range */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="font-mono text-[15px] text-muted-foreground w-7 text-right">
                  {f.tempLow}°
                </span>
                <div className="w-10 h-[5px] bg-secondary rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 h-full bg-foreground rounded-full"
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                    }}
                  />
                </div>
                <span className="font-mono text-[15px] font-semibold w-7">
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
      <div className="px-5 py-3">
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
    <div className="px-5 py-3 text-[15px] text-muted-foreground italic">
      Weather data unavailable.
    </div>
  );
}
