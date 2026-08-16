import type { WeatherData } from "@/lib/types";
import { WeatherIcon } from "./weather-icons";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[14px] font-bold uppercase tracking-[1.5px] text-muted-foreground mb-2">
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-bold uppercase tracking-[0.8px] text-muted-foreground leading-none">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[13px] font-bold leading-none truncate">
        {value}
      </div>
    </div>
  );
}

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
    <div>
      <div className="flex items-center gap-2">
        <WeatherIcon type={data.iconType} size={58} />

        <div className="font-mono text-[54px] font-bold leading-none">
          {data.temperature}°
        </div>
      </div>

      <div className="text-[19px] font-bold leading-[1.15] mt-1 truncate">
        {data.description}
      </div>

      <div className="flex gap-x-3 gap-y-2 mt-3">
        <Metric label="Feels" value={`${data.apparentTemperature}°`} />
        <Metric label="Wind" value={`${data.windSpeed} km/h`} />
        <Metric label="Humidity" value={`${data.humidity}%`} />
        <Metric label="Sun" value={`${sunrise}-${sunset}`} />
      </div>
    </div>
  );
}

function HourlyChart({ hourly }: { hourly: WeatherData["hourly"] }) {
  const hours = hourly.slice(0, 6);
  if (hours.length === 0) return null;

  const temperatures = hours.map((hour) => hour.temperature);
  const low = Math.min(...temperatures);
  const high = Math.max(...temperatures);
  const minTemp = Math.floor((low - 2) / 5) * 5;
  const maxTemp = Math.ceil((high + 2) / 5) * 5;
  const tempRange = Math.max(maxTemp - minTemp, 1);
  const chartWidth = 260;
  const plotLeft = 16;
  const plotRight = 216;
  const plotTop = 14;
  const plotBottom = 76;
  const labelX = 228;

  const points = hours.map((hour, index) => {
    const x =
      hours.length === 1
        ? plotLeft
        : plotLeft + (index / (hours.length - 1)) * (plotRight - plotLeft);
    const y =
      plotTop +
      ((maxTemp - hour.temperature) / tempRange) * (plotBottom - plotTop);

    return { x, y, temperature: hour.temperature, hour: hour.hour };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${plotBottom} L ${points[0].x} ${plotBottom} Z`;
  const ticks = [maxTemp, Math.round((maxTemp + minTemp) / 2), minTemp];

  return (
    <div className="mt-4 pt-3 border-t border-border">
      <SectionLabel>Next Hours</SectionLabel>
      <div className="relative mb-1 h-[34px]">
        {hours.map((hour, index) => (
          <div
            key={index}
            className="absolute top-0 flex w-4 -translate-x-1/2 flex-col items-center gap-0.5"
            style={{ left: `${(points[index].x / chartWidth) * 100}%` }}
          >
            <WeatherIcon type={hour.iconType} size={16} />
            <span className="font-mono text-[11px] font-bold text-muted-foreground">
              {hour.precipitationProbability !== null
                ? `${hour.precipitationProbability}%`
                : "0%"}
            </span>
          </div>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} 98`}
        className="block w-full h-[98px]"
        role="img"
        aria-label="Hourly temperature chart"
      >
        <rect
          x={plotLeft}
          y={plotTop}
          width={plotRight - plotLeft}
          height={plotBottom - plotTop}
          fill="white"
        />
        {ticks.map((tick) => {
          const y =
            plotTop + ((maxTemp - tick) / tempRange) * (plotBottom - plotTop);

          return (
            <g key={tick}>
              <line
                x1={plotLeft}
                x2={plotRight}
                y1={y}
                y2={y}
                stroke="currentColor"
                className="text-border"
                strokeWidth="1"
              />
              <text
                x={labelX}
                y={y + 4}
                fill="currentColor"
                className="text-muted-foreground"
                style={{ fontSize: 11, fontWeight: 700 }}
              >
                {tick}°
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="currentColor" className="text-secondary" />
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          className="text-foreground"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="white"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <text
              x={point.x}
              y={94}
              textAnchor="middle"
              fill="currentColor"
              className="text-muted-foreground"
              style={{ fontSize: 11, fontWeight: 700 }}
            >
              {point.hour}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function ForecastRows({
  forecast,
  tempRangeMin,
  tempRangeMax,
}: {
  forecast: WeatherData["forecast"];
  tempRangeMin: number;
  tempRangeMax: number;
}) {
  const range = Math.max(tempRangeMax - tempRangeMin, 1);
  const days = forecast.slice(0, 6);

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <SectionLabel>Forecast</SectionLabel>
      <div className="flex flex-col divide-y divide-border/70">
        {days.map((f) => {
          const leftPct = ((f.tempLow - tempRangeMin) / range) * 100;
          const widthPct = Math.max(
            ((f.tempHigh - f.tempLow) / range) * 100,
            10,
          );
          const adjustedLeftPct = Math.min(leftPct, 100 - widthPct);

          return (
            <div
              key={f.day}
              className="grid grid-cols-[50px_1fr] items-center gap-2 py-1.5"
            >
              <span className="text-[16px] font-bold leading-none truncate">
                {f.day}
              </span>

              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-mono text-[13px] font-bold text-muted-foreground w-7 text-right">
                  {f.tempLow}°
                </span>
                <div className="h-[8px] flex-1 bg-secondary rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 h-full bg-foreground rounded-full"
                    style={{
                      left: `${adjustedLeftPct}%`,
                      width: `${widthPct}%`,
                    }}
                  />
                </div>
                <span className="font-mono text-[13px] font-bold w-7">
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

export function WeatherSection({ data }: { data: WeatherData }) {
  return (
    <div className="flex-1 basis-0 flex flex-col px-4 py-3 border-l border-border overflow-hidden min-w-0">
      <CurrentWeather
        data={data.current}
        sunrise={data.sunrise}
        sunset={data.sunset}
      />
      <HourlyChart hourly={data.hourly} />
      <ForecastRows
        forecast={data.forecast}
        tempRangeMin={data.tempRangeMin}
        tempRangeMax={data.tempRangeMax}
      />
    </div>
  );
}

export function WeatherSectionFallback() {
  return (
    <div className="flex-1 basis-0 px-4 py-3 border-l border-border text-[15px] font-bold text-muted-foreground italic">
      Weather unavailable
    </div>
  );
}
