import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  allowedDevOrigins: ["dis-skin-pattern-shipping.trycloudflare.com"],
};

export default nextConfig;
