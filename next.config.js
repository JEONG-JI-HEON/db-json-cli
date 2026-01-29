/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  compress: false,
  compiler: {
    removeConsole: false,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:*"],
    },
  },
};

export default nextConfig;
