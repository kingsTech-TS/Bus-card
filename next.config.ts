import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "b-card-u68j.onrender.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
