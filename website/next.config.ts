import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/ph/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ph/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
};

export default nextConfig;
