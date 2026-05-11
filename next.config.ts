import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "192.168.63.44",
        port: "8000",
      },
    ],
  },
};

export default nextConfig;
