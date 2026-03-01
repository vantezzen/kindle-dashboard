#!/bin/bash
# main.sh — capture the Kindle dashboard and push it to the device
#
# Local cron (once per minute):
#   * * * * * cd /path/to/kindle-dashboard && bash main.sh >> /tmp/kindle-dashboard.log 2>&1
#
# In Docker, this is called by the cron job set up in docker/crontab.

set -euo pipefail

# ── Config (override via env vars or docker-compose environment:) ─────────────
KINDLE_IP="${KINDLE_IP:-192.168.178.54}"
KINDLE_PASSWORD="${KINDLE_PASSWORD:-}" # optional, only needed if you set a root password on the Kindle
SERVER_PORT="${SERVER_PORT:-3000}"
OUTPUT="./public/screen.png"

# SSH options: disable host-key prompt (fine for a personal LAN device)
SSH_OPTS="-o ConnectTimeout=5 -o StrictHostKeyChecking=no"
export SSHPASS="$KINDLE_PASSWORD"

# ── 1. Render dashboard → public/screen.png ──────────────────────────────────
echo "[$(date '+%H:%M:%S')] Capturing dashboard..."
DASHBOARD_URL="http://localhost:${SERVER_PORT}" bun scripts/capture.mjs

# Convert to 8-bit grayscale — eips expects 1 byte/pixel matching the Kindle framebuffer.
# Without this, a 24-bit RGB PNG is read as raw bytes and appears 3x wider than the screen.
convert "$OUTPUT" -colorspace Gray -depth 8 -type Grayscale -alpha Off -rotate 180 "$OUTPUT"

# ── 2. Kindle fetches the PNG from this server and displays it ───────────────
echo "[$(date '+%H:%M:%S')] Pushing to Kindle ($KINDLE_IP)..."
# shellcheck disable=SC2086

if [ -n "$KINDLE_PASSWORD" ]; then
  sshpass -e scp $SSH_OPTS $OUTPUT root@"$KINDLE_IP":./screen.png
else
  scp $SSH_OPTS $OUTPUT root@"$KINDLE_IP":./screen.png
fi

# If a password is set, use sshpass; otherwise fall back to key-based auth
# (BatchMode=yes is omitted when using a password so sshpass can work)
if [ -n "$KINDLE_PASSWORD" ]; then
  SSH_CMD="sshpass -e ssh $SSH_OPTS"
else
  SSH_CMD="ssh -o BatchMode=yes $SSH_OPTS"
fi

# eips lives in /usr/sbin which isn't in the PATH of non-interactive SSH sessions
$SSH_CMD root@"$KINDLE_IP" "/usr/bin/lipc-set-prop com.lab126.powerd preventScreenSaver 1 && /usr/sbin/eips -c && /usr/sbin/eips -g ./screen.png"

echo "[$(date '+%H:%M:%S')] Done."
