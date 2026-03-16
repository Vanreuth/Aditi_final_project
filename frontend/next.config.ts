import type { NextConfig } from "next";

const API_BASE_URL = process.env.API_BASE_URL ?? "https://codegrowthkh.onrender.com"

const nextConfig: NextConfig = {
  reactStrictMode: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "codegrowthkh.onrender.com" },
      { protocol: "https", hostname: "cdn.codegrowthkh.site" },
      { protocol: "http",  hostname: "localhost", port: "8080" },
    ],
  },

  async rewrites() {
    return [
      {
        source     : "/api/:path((?!oauth2/).*)",
        destination: `${API_BASE_URL}/api/:path`,
      },
    ]
  },
};

export default nextConfig;
