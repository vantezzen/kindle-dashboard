# Kindle Dashboard

A personal e-ink dashboard built with Next.js, designed to be rendered and pushed to a Kindle display as a static PNG once per minute.

## Features

- **Weather** — Current conditions, 8-hour hourly forecast, and 6-day outlook via [Open-Meteo](https://open-meteo.com/) (no API key required)
- **Google Calendar** — Upcoming events for the next days across multiple calendars
- **BVG Transit** — Next departures at Berlin S-Bahn station + disruption alerts via [v6.bvg.transport.rest](https://v6.bvg.transport.rest/)
- **Date & Time** — Current Berlin local time, rendered server-side

## How it works

The dashboard is a Next.js app that renders the data in a minimalist, high-contrast design optimized for e-ink displays. It runs in a Docker container that:

1. Periodically loads the dashboard page in a headless Chromium browser
2. Takes a screenshot of the relevant area (600×800)
3. Uses `ssh` and `scp` to push the image to the Kindle's filesystem and trigger a refresh

This is totally overkill. The dashboard could be generated as a static image without the huge bloat of NextJS and the overhead of running a whole Chromium instance for Pupeteer.

But this way it's easier to customize the design with regular web development tools, and to preview changes in real time by loading the page in a normal browser. For me its running on a Raspberry Pi in my home network, so the inefficiency doesn't matter.

The Kindle is fully controlled via SSH, so no additional software or configuration is needed on the device itself other than a jailbreak and the USBNetwork extension installed.

---

## Setup

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Then fill in the values as described below.

---

### 3. Google Calendar integration

The calendar requires a Google Cloud OAuth2 application. This is a one-time setup.

#### a) Create OAuth credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the **Google Calendar API**: _APIs & Services → Library → search "Calendar" → Enable_
4. Create OAuth credentials: _APIs & Services → Credentials → Create Credentials → OAuth client ID_
   - Application type: **Web application**
   - Name: "Kindle Dashboard" (or anything)
   - **Authorized redirect URIs** → Add: `http://localhost:3001/oauth/callback`
5. Note your **Client ID** and **Client Secret**

#### b) Get a refresh token

The script starts a local server, opens your browser for authorization, and captures the token automatically.

```bash
GOOGLE_CLIENT_ID=your_client_id \
GOOGLE_CLIENT_SECRET=your_client_secret \
bun scripts/get-google-token.mjs
```

The script will:

1. Open your browser to the Google authorization page
2. After you grant access, Google redirects to `localhost:3001` — the script captures the code
3. Print the `GOOGLE_REFRESH_TOKEN` to copy into `.env.local`

#### c) Configure calendar IDs

By default the dashboard shows your primary calendar. To add more:

```bash
# .env.local
GOOGLE_CALENDAR_IDS=primary,your-work-calendar@group.calendar.google.com
```

Find a calendar's ID in Google Calendar: _Settings → [calendar name] → Calendar ID_

---

### 4. Transit / BVG

No configuration needed — the BVG public API requires no key.

```bash
# .env.local
TRANSIT_STATION_ID=900100003  # e.g. Alexanderplatz
NEXT_PUBLIC_TRANSIT_STATION_NAME=Alexanderplatz  # for display in the header
```

To find a stop ID, query the API:

```
https://v6.bvg.transport.rest/locations?query=Ostbahnhof&results=3
```

---

### 5. Run in development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) — the dashboard renders centered on a gray background to mimic the Kindle bezel.

---

## Kindle push pipeline

The dashboard is designed to be screenshotted and pushed to the Kindle via a cron job.

In the prebuild Docker container, a cronjob will run `main.sh` every minute, which:

1. Loads the dashboard page in a headless browser (Puppeteer)
2. Takes a screenshot of the 600×800 dashboard area
3. Uses `ssh` and `scp` to push the image to the Kindle's filesystem and trigger a refresh

---

## Customization

### Change city / weather location

Edit `lib/weather.ts` — update the `latitude` and `longitude` parameters.

### Change transit station

Set `TRANSIT_STATION_ID` in `.env.local`, or edit the default in `lib/transit.ts`.

### Adjust transit product filters

By default only S-Bahn and regional trains are shown. Edit the product filters in `lib/transit.ts`:

```ts
suburban: "true",
subway: "false",
tram: "false",
bus: "false",
```

By default transit searches from 6+ minutes in the future to avoid showing departures that you cannot reach anymore. You can edit this in `lib/transit.ts` as well.

### Add/change quotes

Edit the `QUOTES` array in `lib/quotes.ts`.
