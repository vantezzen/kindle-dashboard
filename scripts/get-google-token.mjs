#!/usr/bin/env bun
/**
 * One-time script to obtain a Google OAuth2 refresh token for the Calendar API.
 * Uses a local redirect server (the OOB flow is deprecated by Google).
 *
 * IMPORTANT: Before running, add this redirect URI to your OAuth client in
 * Google Cloud Console → Credentials → [your OAuth client] → Authorized redirect URIs:
 *   http://localhost:3001/oauth/callback
 *
 * Usage:
 *   GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy bun scripts/get-google-token.mjs
 */

import { google } from "googleapis";

const PORT = 4321;
const REDIRECT_URI = `http://localhost:${PORT}/oauth/callback`;

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error(
    "Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set.\n" +
      "Example:\n" +
      "  GOOGLE_CLIENT_ID=your_id GOOGLE_CLIENT_SECRET=your_secret bun scripts/get-google-token.mjs\n",
  );
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  REDIRECT_URI,
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/calendar.readonly"],
  prompt: "consent", // ensures refresh_token is always returned
});

console.log(
  "\n═══════════════════════════════════════════════════════════════",
);
console.log("  Google Calendar OAuth2 Setup");
console.log(
  "═══════════════════════════════════════════════════════════════\n",
);
console.log("Starting local callback server on port", PORT, "...\n");

// Wait for the OAuth callback on a local server using Bun.serve
const code = await new Promise((resolve, reject) => {
  const server = Bun.serve({
    port: PORT,
    fetch(req) {
      const url = new URL(req.url);

      if (url.pathname !== "/oauth/callback") {
        return new Response("Not found", { status: 404 });
      }

      const error = url.searchParams.get("error");
      if (error) {
        server.stop();
        reject(new Error(`OAuth error: ${error}`));
        return new Response(
          html(
            "Authorization failed",
            `<p>Error: <code>${error}</code></p><p>You may close this tab.</p>`,
          ),
          { headers: { "Content-Type": "text/html" } },
        );
      }

      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("Missing code parameter", { status: 400 });
      }

      server.stop();
      resolve(code);
      return new Response(
        html(
          "Authorization successful",
          "<p>✓ You may close this tab and return to the terminal.</p>",
        ),
        { headers: { "Content-Type": "text/html" } },
      );
    },
  });

  console.log("Opening browser for authorization...\n");
  console.log(`   ${authUrl}\n`);
  console.log(
    "If it didn't open automatically, copy the URL above into your browser.\n",
  );

  // Open browser (macOS: open, Linux: xdg-open)
  const cmd = process.platform === "linux" ? "xdg-open" : "open";
  Bun.spawn([cmd, authUrl], { stdout: "ignore", stderr: "ignore" });
});

// Exchange code for tokens
let tokens;
try {
  const result = await oauth2Client.getToken(code);
  tokens = result.tokens;
} catch (err) {
  console.error("\nFailed to exchange code for tokens:", err.message);
  process.exit(1);
}

console.log(
  "\n═══════════════════════════════════════════════════════════════",
);
console.log("  Success! Add the following to your .env.local file:");
console.log(
  "═══════════════════════════════════════════════════════════════\n",
);
console.log(`GOOGLE_CLIENT_ID=${clientId}`);
console.log(`GOOGLE_CLIENT_SECRET=${clientSecret}`);
console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
console.log(
  '\n# Optional: comma-separated calendar IDs (defaults to "primary")',
);
console.log("# GOOGLE_CALENDAR_IDS=primary,work@example.com\n");

if (!tokens.refresh_token) {
  console.warn(
    "⚠  No refresh_token returned. This can happen if you already authorized this app.\n" +
      "   Go to https://myaccount.google.com/permissions, revoke access, then re-run this script.\n",
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function html(title, body) {
  return `<!DOCTYPE html><html><head><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:480px;margin:80px auto;padding:0 20px;color:#333}</style>
</head><body><h2>${title}</h2>${body}</body></html>`;
}
