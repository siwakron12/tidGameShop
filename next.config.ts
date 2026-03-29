import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

    if (!apiBaseUrl) {
      return [];
    }

    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiBaseUrl}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
