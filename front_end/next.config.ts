import type { NextConfig } from "next";

const apiRewriteDestination = process.env.NEXT_SERVER_API_URL || "http://localhost:5555/api";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiRewriteDestination}/:path*`,
      },
    ];
  },
};

export default nextConfig;
