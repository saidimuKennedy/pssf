import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server to accept requests proxied through ngrok (for local
  // M-Pesa STK callback testing). Wildcard covers rotating ngrok-free subdomains.
  allowedDevOrigins: ["*.ngrok-free.app", "d98d-102-135-172-87.ngrok-free.app"],
};

export default nextConfig;
