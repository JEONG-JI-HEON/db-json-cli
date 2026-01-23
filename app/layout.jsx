"use client";

import "./globals.css";

import localFont from "next/font/local";

import Providers from "./providers";

const pretendard = localFont({
  src: "./fonts/Pretendard-Black.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

const RootLayout = ({ children }) => {
  return (
    <html lang="ko">
      <body className={pretendard.variable}>
        <title>db-json-cli</title>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
