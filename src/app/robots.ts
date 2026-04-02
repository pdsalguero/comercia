import { MetadataRoute } from "next";

const BASE = "https://comerxia.com.ar";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/api/",
          "/login",
          "/register",
          "/_next/",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
