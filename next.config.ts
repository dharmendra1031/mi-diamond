import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["mssql"],
  async rewrites() {
    return {
      afterFiles: [
        {
          source: "/uploads/:path*",
          destination: "/api/media/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
