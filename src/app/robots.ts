import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/game/",
      },
    ],
    sitemap: "https://cifra.co/sitemap.xml",
    host: "https://cifra.co",
  };
}
