import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/u/"],
        disallow: ["/app/", "/api/", "/onboard"],
      },
    ],
    sitemap: "https://usecompound.xyz/sitemap.xml",
  };
}
