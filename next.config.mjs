/* eslint-disable import/no-anonymous-default-export */
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.org",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default async (phase) => {
  if (phase !== PHASE_DEVELOPMENT_SERVER) {
    const { default: withPWA } = await import("@ducanh2912/next-pwa");
    return withPWA({
      dest: "public",
      register: true,
    })(nextConfig);
  }
  return nextConfig;
};
