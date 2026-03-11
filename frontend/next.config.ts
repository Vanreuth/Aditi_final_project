import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Stops double renders in development
  reactStrictMode: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-21ac384ecd8e4ec88d9c0d2834aa1d5f.r2.dev",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
      },
    ],
  },

};

export default nextConfig;
