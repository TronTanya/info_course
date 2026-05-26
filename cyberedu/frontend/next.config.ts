import type { NextConfig } from "next";
import { devTrustedOriginsForNext } from "./lib/security/dev-trusted-origin";
import { securityHeadersList } from "./lib/security/headers";

const nextConfig: NextConfig = {
  // LAN IP (192.168.x.x) и localhost — разные origins; без этого dev/HMR и auth ломаются.
  allowedDevOrigins: devTrustedOriginsForNext(),
  serverExternalPackages: ["nodemailer"],
  output: "standalone",
  outputFileTracingIncludes: {
    "/api/certificates/**/*": [
      "./node_modules/dejavu-fonts-ttf/**/*",
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
