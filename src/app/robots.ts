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
    sitemap: "https://compound.apps.orizon.ng/sitemap.xml",
  };
}
