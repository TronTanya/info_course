import type { NextConfig } from "next";
import { devTrustedOriginsForNext } from "./lib/security/dev-trusted-origin";
import { securityHeadersList } from "./lib/security/headers";

const nextConfig: NextConfig = {
  allowedDevOrigins: devTrustedOriginsForNext(),
  serverExternalPackages: ["nodemailer"],
  // Standalone — только для Docker/VPS. На Vercel (VERCEL=1) используем стандартный output.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  outputFileTracingIncludes: {
    "/api/certificates/**/*": [
      "./node_modules/dejavu-fonts-ttf/**/*",
      "./node_modules/@react-pdf/**/*",
    ],
  },
  async redirects() {
    const routes: { source: string; destination: string; permanent: boolean }[] = [
      {
        source: "/dashboard/ui-kit",
        destination: "/dashboard/profile",
        permanent: true,
      },
    ];
    // Production build: dev-only API недоступны (дополнение к middleware 404).
    if (process.env.NODE_ENV === "production") {
      routes.push({
        source: "/api/dev/:path*",
        destination: "/404",
        permanent: false,
      });
    }
    return routes;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeadersList(),
      },
    ];
  },
};

export default nextConfig;
