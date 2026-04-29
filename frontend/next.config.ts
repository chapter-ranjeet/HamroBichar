import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.247.225.184"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://hamrobichar-backend.onrender.com/api/:path*"
      },
      {
        source: "/uploads/:path*",
        destination: "https://hamrobichar-backend.onrender.com/uploads/:path*"
      }
    ];
  }
};

export default nextConfig;
