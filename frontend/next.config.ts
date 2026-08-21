import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignore les erreurs TypeScript pendant la phase de Build sur Vercel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;