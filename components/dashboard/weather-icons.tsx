import type { WeatherIconType } from "@/lib/types";
import { JSX } from "react";

// ── Individual SVG icons ───────────────────────────────────────────────────────
// Designed for clean rendering on grayscale e-ink displays.

function SunIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
      <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
      <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" />
      <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
    </svg>
  );
}

function PartlyCloudyIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="8" r="3" />
      <line x1="10" y1="2" x2="10" y2="3.5" strokeWidth="1.2" />
      <line x1="4" y1="8" x2="5.5" y2="8" strokeWidth="1.2" />
      <line x1="5.76" y1="3.76" x2="6.82" y2="4.82" strokeWidth="1.2" />
      <line x1="14.24" y1="3.76" x2="13.18" y2="4.82" strokeWidth="1.2" />
      <path d="M8 18h10a4 4 0 0 0 0-8h-.5A5 5 0 0 0 8 12v0a4 4 0 0 0 0 6z" />
    </svg>
  );
}

function CloudyIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <path d="M6 18h12a4 4 0 0 0 0-8h-.5A5.5 5.5 0 0 0 7 11a4.5 4.5 0 0 0-1 7z" />
    </svg>
  );
}

function RainIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 13h12a4 4 0 0 0 0-8h-.5A5.5 5.5 0 0 0 7 6a4.5 4.5 0 0 0-1 7z" />
      <line x1="8" y1="16" x2="7" y2="19" strokeWidth="1.2" />
      <line x1="12" y1="16" x2="11" y2="19" strokeWidth="1.2" />
      <line x1="16" y1="16" x2="15" y2="19" strokeWidth="1.2" />
    </svg>
  );
}

function LightRainIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 14h12a4 4 0 0 0 0-8h-.5A5.5 5.5 0 0 0 7 7a4.5 4.5 0 0 0-1 7z" />
      <line x1="10" y1="17" x2="9" y2="20" strokeWidth="1.2" />
      <line x1="14" y1="17" x2="13" y2="20" strokeWidth="1.2" />
    </svg>
  );
}

function SnowIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <path d="M6 13h12a4 4 0 0 0 0-8h-.5A5.5 5.5 0 0 0 7 6a4.5 4.5 0 0 0-1 7z" />
      <circle cx="9" cy="17" r="0.8" fill="currentColor" />
      <circle cx="13" cy="16.5" r="0.8" fill="currentColor" />
      <circle cx="11" cy="19.5" r="0.8" fill="currentColor" />
      <circle cx="15" cy="19" r="0.8" fill="currentColor" />
    </svg>
  );
}

// ── Unified component ─────────────────────────────────────────────────────────

const ICON_MAP: Record<
  WeatherIconType,
  (props: { size?: number }) => JSX.Element
> = {
  sunny: SunIcon,
  "partly-cloudy": PartlyCloudyIcon,
  cloudy: CloudyIcon,
  rain: RainIcon,
  "light-rain": LightRainIcon,
  snow: SnowIcon,
};

export function WeatherIcon({
  type,
  size = 24,
}: {
  type: WeatherIconType;
  size?: number;
}) {
  const Icon = ICON_MAP[type] ?? CloudyIcon;
  return <Icon size={size} />;
}
