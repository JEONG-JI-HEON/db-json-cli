import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const GET = async () => {
  // ✅ 실제 실행 중인 파일 위치 찾기
  const stackTrace = new Error().stack;
  const match = stackTrace.match(/\((.+?):\d+:\d+\)/);
  const actualFilePath = match ? match[1] : "";

  // 또는 다른 방법들
  const methods = {
    // 방법1: 현재 파일에서 상대 경로로 추측
    method1: path.resolve(process.cwd(), "../../db.json"),
    method2: path.resolve(process.cwd(), "../../../db.json"),
    method3: path.resolve(process.cwd(), "../../../../db.json"),

    // 방법2: cwd 기준
    method4: path.join(process.cwd(), "db.json"),

    actualFilePath,
  };

  const results = {};
  Object.keys(methods).forEach((key) => {
    const p = methods[key];
    if (typeof p === "string") {
      results[key] = {
        path: p,
        exists: fs.existsSync(p),
      };
    }
  });

  return NextResponse.json({
    cwd: process.cwd(),
    results,
  });
};
