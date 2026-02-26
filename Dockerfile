# ── Stage 1: install dependencies ────────────────────────────────────────────
FROM oven/bun:1-slim AS deps
WORKDIR /app

COPY package.json bun.lock ./
# Skip puppeteer's Chromium download — we use the system one in the runner
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN bun install --frozen-lockfile


# ── Stage 2: build Next.js ────────────────────────────────────────────────────
FROM oven/bun:1-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build


# ── Stage 3: production runner ────────────────────────────────────────────────
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Point puppeteer to the system Chromium instead of a bundled binary
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# System packages:
#   chromium        — headless browser for dashboard screenshots
#   openssh-client  — SSH into the Kindle
#   cron            — schedule the push every minute
#  imagemagick      — convert screenshots to Kindle-compatible format
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    openssh-client \
    sshpass \
    cron \
    imagemagick \
    && rm -rf /var/lib/apt/lists/*

# ── Next.js standalone bundle ─────────────────────────────────────────────────
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static
COPY --from=builder /app/public           ./public
COPY --from=deps /app/node_modules ./node_modules

# ── Scripts ───────────────────────────────────────────────────────────────────
COPY scripts/capture.mjs ./scripts/capture.mjs
COPY main.sh             ./main.sh

# ── Cron + entrypoint ─────────────────────────────────────────────────────────
COPY docker/crontab      /etc/cron.d/kindle-dashboard
COPY docker/entrypoint.sh /entrypoint.sh

RUN chmod +x main.sh /entrypoint.sh \
    && chmod 0644 /etc/cron.d/kindle-dashboard

EXPOSE 3000
CMD ["/entrypoint.sh"]
