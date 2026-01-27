/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  compress: false,
  compiler: {
    removeConsole: false,
  },
  // ✅ 환경변수를 명시적으로 노출
  env: {
    DB_PATH: process.env.DB_PATH,
    PORT: process.env.PORT,
  },
  experimental: {
    // ✅ 서버 액션에서 환경변수 사용 가능하게
    serverActions: {
      allowedOrigins: ["localhost:*"],
    },
  },
};

module.exports = nextConfig;
