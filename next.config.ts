import type { NextConfig } from "next";
const config: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: new URL(
          process.env.NEXT_PUBLIC_SUPABASE_URL ||
            "https://feqmnzutyhzochuyiint.supabase.co",
        ).hostname,
        pathname: "/storage/v1/object/public/website-public/**",
      },
    ],
  },
  async redirects() {
    // The staff portal moved to /adminportal. Keep old bookmarks working.
    return [
      { source: "/admin", destination: "/adminportal", permanent: false },
      {
        source: "/admin/:path*",
        destination: "/adminportal/:path*",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default config;
