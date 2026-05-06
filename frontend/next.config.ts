import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cap public deliveries to ~1280px wide and serve as WebP.
    // Print posters need ~7000px+ at 300 DPI, so a 1280px web preview
    // looks fine on screen but is unusable for high-quality printing.
    deviceSizes: [320, 420, 640, 750, 828, 1024, 1280],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "ginkoposters.com",
      },
      {
        protocol: "https",
        hostname: "*.ginkoposters.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
