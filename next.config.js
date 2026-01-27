/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  compress: false,
  compiler: {
    removeConsole: false,
  },
  env: {
    DB_PATH: process.env.DB_PATH,
    PORT: process.env.PORT,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:*"],
    },
  },
};

export default nextConfig; 
