import type { NextConfig } from "next";
import { securityHeadersList } from "./lib/security/headers";

const nextConfig: NextConfig = {
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
