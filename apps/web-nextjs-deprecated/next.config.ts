import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@mvppir/shared-types"],
  typescript: {
    // Skip type checking during build if SKIP_TYPE_CHECK is set
    // Types are validated locally before deployment
    ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === "true",
  },
}

export default nextConfig
