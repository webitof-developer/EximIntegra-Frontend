import type { NextConfig } from "next";

function extractOrigin(urlStr?: string): string | null {
  if (!urlStr || urlStr.startsWith("/")) return null;
  try {
    const parsed = new URL(urlStr);
    return parsed.origin;
  } catch {
    return null;
  }
}

const rawBackendUrl = process.env.BACKEND_URL;
const rawPublicApiUrl = process.env.NEXT_PUBLIC_API_URL;

const backendUrl =
  rawBackendUrl ||
  extractOrigin(rawPublicApiUrl) ||
  "http://127.0.0.1:5000";

const customOrigins = [
  extractOrigin(rawBackendUrl),
  extractOrigin(rawPublicApiUrl),
].filter((url): url is string => Boolean(url));

const connectSources = Array.from(
  new Set([
    "'self'",
    ...customOrigins,
    "https://eximintegra-backend.onrender.com",
    "https://*.onrender.com",
    "https://*.vercel.app",
    "https://*.eximintegra.com",
    "https://eximintegra.com",
    "http://127.0.0.1:5000",
    "http://localhost:5000",
    "https://api.razorpay.com",
    "https://checkout.razorpay.com",
    "https://lumberjack.razorpay.com",
    "https://api.frankfurter.dev",
    "https://cdn.jsdelivr.net",
    "https://*.jsdelivr.net",
    "https://cdnjs.cloudflare.com",
    "https://unpkg.com",
  ])
).join(" ");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: "/health",
        destination: `${backendUrl}/health`,
      },
      {
        source: "/ready",
        destination: `${backendUrl}/ready`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              `connect-src ${connectSources}`,
              "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
