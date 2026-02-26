import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained server bundle for Docker
  output: "standalone",
  // Keep heavy server-only packages out of the webpack bundle
  serverExternalPackages: ["googleapis", "google-auth-library"],
};

export default nextConfig;
