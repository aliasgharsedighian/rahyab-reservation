import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
