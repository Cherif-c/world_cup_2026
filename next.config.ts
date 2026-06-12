import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/calendrier", destination: "/classement", permanent: true },
    ];
  },
};

export default nextConfig;
