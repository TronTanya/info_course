import type { NextConfig } from "next";
import { securityHeadersList } from "./lib/security/headers";

const nextConfig: NextConfig = {
  // Playwright/smoke use 127.0.0.1; without this Next 16 blocks dev chunks/HMR cross-origin.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  output: "standalone",
  outputFileTracingIncludes: {
    "/api/certificates/**/*": [
      "./node_modules/@fontsource/roboto/**/*",
      "./node_modules/@react-pdf/**/*",
    ],
  },
  async redirects() {
    return [
      {
        source: "/dashboard/ui-kit",
        destination: "/dashboard/profile",
        permanent: true,
      },
    ];
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
