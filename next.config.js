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

module.exports = nextConfig;
