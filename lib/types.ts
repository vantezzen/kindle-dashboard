// ── Weather ──────────────────────────────────────────────────────────────────

export type WeatherIconType =
  | "sunny"
  | "partly-cloudy"
  | "cloudy"
  | "light-rain"
  | "rain"
  | "snow";

export interface WeatherCurrent {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  iconType: WeatherIconType;
  description: string;
}

export interface HourlyWeather {
  hour: string; // "14"
  temperature: number;
  iconType: WeatherIconType;
  precipitationProbability: number | null;
}

export interface DailyForecast {
  day: string; // "Today", "Tmrw", "Thu"
  iconType: WeatherIconType;
  description: string;
  tempLow: number;
  tempHigh: number;
}

export interface WeatherData {
  current: WeatherCurrent;
  hourly: HourlyWeather[];
  forecast: DailyForecast[];
  sunrise: string; // "07:12"
  sunset: string; // "17:45"
  tempRangeMin: number; // global min across forecast (for bar scaling)
  tempRangeMax: number; // global max across forecast
}

// ── Calendar ─────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string | null; // "14:30" or null for all-day
  endTime: string | null;
  durationHours: number;
  location?: string;
  isNow: boolean;
  isAllDay: boolean;
}

export interface CalendarDay {
  label: string; // "Today", "Tomorrow", "Thu, 28 Feb"
  events: CalendarEvent[];
}
