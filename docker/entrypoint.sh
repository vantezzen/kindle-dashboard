#!/bin/sh
set -e

# Flush the container's environment into /etc/environment so cron jobs
# can read variables like GOOGLE_REFRESH_TOKEN, KINDLE_IP, etc.
printenv | grep -v '^_=' > /etc/environment

# Start cron daemon in the background
cron

echo "Starting Next.js server..."
exec bun /app/server.js
