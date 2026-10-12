import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: "/sw.js",
      headers: [
        { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
      ],
    }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "panel.bitnasb.ir",
      },
    ],
  },
  allowedDevOrigins: ["http://localhost:3003", "192.168.63.30"],
};

export default nextConfig;
