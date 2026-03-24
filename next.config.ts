import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // xlsx uses Node.js built-ins (zlib, Buffer) — keep it out of the webpack bundle
  // so Vercel serverless functions can require it natively.
  serverExternalPackages: ["xlsx"],
};

export default nextConfig;
