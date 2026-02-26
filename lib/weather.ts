import type {
  WeatherData,
  WeatherIconType,
  HourlyWeather,
  DailyForecast,
} from "./types";

// ── WMO Weather Interpretation Code mapping ───────────────────────────────────
// https://open-meteo.com/en/docs#weathervariables

const WMO_CODES: Record<
  number,
  { icon: WeatherIconType; description: string }
> = {
  0: { icon: "sunny", description: "Clear Sky" },
  1: { icon: "partly-cloudy", description: "Mainly Clear" },
  2: { icon: "partly-cloudy", description: "Partly Cloudy" },
  3: { icon: "cloudy", description: "Overcast" },
  45: { icon: "cloudy", description: "Fog" },
  48: { icon: "cloudy", description: "Icy Fog" },
  51: { icon: "light-rain", description: "Light Drizzle" },
  53: { icon: "light-rain", description: "Drizzle" },
  55: { icon: "rain", description: "Heavy Drizzle" },
  61: { icon: "light-rain", description: "Light Rain" },
  63: { icon: "rain", description: "Rain" },
  65: { icon: "rain", description: "Heavy Rain" },
  71: { icon: "snow", description: "Light Snow" },
  73: { icon: "snow", description: "Snow" },
  75: { icon: "snow", description: "Heavy Snow" },
  77: { icon: "snow", description: "Snow Grains" },
  80: { icon: "light-rain", description: "Light Showers" },
  81: { icon: "rain", description: "Rain Showers" },
  82: { icon: "rain", description: "Heavy Showers" },
  85: { icon: "snow", description: "Snow Showers" },
  86: { icon: "snow", description: "Heavy Snow Showers" },
  95: { icon: "rain", description: "Thunderstorm" },
  96: { icon: "rain", description: "Thunderstorm w/ Hail" },
  99: { icon: "rain", description: "Thunderstorm w/ Heavy Hail" },
};

function getWeatherInfo(code: number): {
  icon: WeatherIconType;
  description: string;
} {
  return WMO_CODES[code] ?? { icon: "cloudy", description: "Unknown" };
}

function formatLocalTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: process.env.NEXT_PUBLIC_TIMEZONE,
  });
}

// ── Main fetch function ───────────────────────────────────────────────────────

export async function fetchWeather(): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: "52.52",
    longitude: "13.405",
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    hourly: "temperature_2m,weather_code,precipitation_probability",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
    timezone: process.env.NEXT_PUBLIC_TIMEZONE!,
    forecast_days: "7",
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

  const data = await res.json();
  const now = new Date();

  // ── Hourly: next 8 hours from current hour ──────────────────────────────────
  const times: string[] = data.hourly.time;
  const hourlyTemps: number[] = data.hourly.temperature_2m;
  const hourlyCodes: number[] = data.hourly.weather_code;
  const hourlyPrecip: number[] = data.hourly.precipitation_probability;

  // Find the index matching the current local hour
  const nowLocal = new Date(
    now.toLocaleString("en-US", { timeZone: process.env.NEXT_PUBLIC_TIMEZONE }),
  );
  const startIdx = Math.max(
    times.findIndex((t) => {
      const d = new Date(t);
      return (
        d.getHours() === nowLocal.getHours() &&
        d.getDate() === nowLocal.getDate()
      );
    }),
    0,
  );

  const hourly: HourlyWeather[] = times
    .slice(startIdx, startIdx + 8)
    .map((t, i) => {
      const idx = startIdx + i;
      const info = getWeatherInfo(hourlyCodes[idx]);
      return {
        hour: String(new Date(t).getHours()).padStart(2, "0"),
        temperature: Math.round(hourlyTemps[idx]),
        iconType: info.icon,
        precipitationProbability:
          hourlyPrecip[idx] > 0 ? hourlyPrecip[idx] : null,
      };
    });

  // ── Daily forecast: today + 5 more days ────────────────────────────────────
  const dailyTimes: string[] = data.daily.time;
  const dailyCodes: number[] = data.daily.weather_code;
  const dailyMax: number[] = data.daily.temperature_2m_max;
  const dailyMin: number[] = data.daily.temperature_2m_min;
  const sunrises: string[] = data.daily.sunrise;
  const sunsets: string[] = data.daily.sunset;

  const todayStr = nowLocal.toDateString();
  const tomorrowLocal = new Date(nowLocal);
  tomorrowLocal.setDate(tomorrowLocal.getDate() + 1);
  const tomorrowStr = tomorrowLocal.toDateString();

  const dayAbbrevs = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const forecast: DailyForecast[] = dailyTimes.slice(0, 6).map((t, i) => {
    const d = new Date(t + "T12:00:00"); // noon so there's no TZ edge case
    const info = getWeatherInfo(dailyCodes[i]);
    let day: string;
    const dateStr = d.toDateString();
    if (dateStr === todayStr) {
      day = "Today";
    } else if (dateStr === tomorrowStr) {
      day = "Tomorr.";
    } else {
      day = dayAbbrevs[d.getDay()];
    }
    return {
      day,
      iconType: info.icon,
      description: info.description,
      tempLow: Math.round(dailyMin[i]),
      tempHigh: Math.round(dailyMax[i]),
    };
  });

  const allLows = forecast.map((f) => f.tempLow);
  const allHighs = forecast.map((f) => f.tempHigh);

  const currentInfo = getWeatherInfo(data.current.weather_code);

  return {
    current: {
      temperature: Math.round(data.current.temperature_2m),
      apparentTemperature: Math.round(data.current.apparent_temperature),
      humidity: Math.round(data.current.relative_humidity_2m),
      windSpeed: Math.round(data.current.wind_speed_10m),
      iconType: currentInfo.icon,
      description: currentInfo.description,
    },
    hourly,
    forecast,
    sunrise: formatLocalTime(sunrises[0]),
    sunset: formatLocalTime(sunsets[0]),
    tempRangeMin: Math.min(...allLows),
    tempRangeMax: Math.max(...allHighs),
  };
}
