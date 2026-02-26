#!/usr/bin/env bun
/**
 * Renders the dashboard at localhost:3000 and saves a 600×800 PNG
 * to public/screen.png, which Next.js then serves as a static file.
 */

import puppeteer from "puppeteer";
import { join } from "path";

const URL = process.env.DASHBOARD_URL ?? "http://localhost:3000";
const OUT = join(import.meta.dir, "..", "public", "screen.png");

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();

  // Match the Kindle screen exactly — no device pixel ratio scaling
  await page.setViewport({ width: 600, height: 800, deviceScaleFactor: 1 });

  await page.goto(URL, { waitUntil: "networkidle0", timeout: 30_000 });

  await page.screenshot({
    path: OUT,
    clip: { x: 0, y: 0, width: 600, height: 800 },
    // PNG with no compression optimization — keeps file small but lossless
    optimizeForSpeed: false,
  });

  console.log(`Saved → ${OUT}`);
} finally {
  await browser.close();
}
