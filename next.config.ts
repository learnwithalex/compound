import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  allowedDevOrigins: ["dis-skin-pattern-shipping.trycloudflare.com", "appliances-mines-supervision-democrats.trycloudflare.com"],
};

export default nextConfig;
