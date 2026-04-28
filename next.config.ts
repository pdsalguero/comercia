import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    formats: ["image/webp"],
    minimumCacheTTL: 604800,             // 1 semana — reduce re-fetches desde Supabase Storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "snrxpyolkxcficxnzaxh.supabase.co",
      },
      {
        protocol: "https",
        hostname: "hbeswalibpblqkrdqczh.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    deviceSizes: [375, 640, 750, 828, 1080, 1200],
    imageSizes: [64, 128, 200, 256],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "ngrok-skip-browser-warning",
            value: "true",
          },
        ],
      },
      // Agresivo cache para assets estáticos de Next.js
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache moderado para imágenes optimizadas
      {
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? "comerxia",
  project: process.env.SENTRY_PROJECT ?? "javascript-nextjs",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: true,
  sourcemaps: { disable: true },
  telemetry: false,
});
