import { NextResponse } from "next/server";
import { authSchemas, generateResourceSchemas } from "@/lib/api_schema";
import fs from "fs";
import path from "path";

export const GET = async () => {
  try {
    let dbPath;

    // ✅ 개발/프로덕션 환경 분기
    const pathFilePath = path.join(process.cwd(), ".db-absolute-path.txt");

    if (fs.existsSync(pathFilePath)) {
      // 프로덕션 (standalone)
      dbPath = fs.readFileSync(pathFilePath, "utf-8").trim();
    } else {
      // 개발 모드
      dbPath = path.join(process.cwd(), "db.json");

      // 개발 모드용 기본 DB가 없으면 생성
      if (!fs.existsSync(dbPath)) {
        const defaultDB = {
          users: [],
          rules: { test1: "public", test2: "private", test3: "public" },
          test1: [{ id: 1, message: "good" }],
          test2: [{ id: 1, message: "good" }],
          test3: [{ id: 1, message: "good" }],
        };
        fs.writeFileSync(dbPath, JSON.stringify(defaultDB, null, 2));
      }
    }

    const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

    const routeList = Object.keys(db)
      .filter((key) => key !== "users" && key !== "config" && key !== "rules")
      .map((key) => ({
        key,
        count: db[key]?.length || 0,
        permission: db.rules?.[key] || "public",
      }));

    const allSchemas = { ...authSchemas };
    const resourceSchemas = generateResourceSchemas(routeList);
    resourceSchemas.forEach((schema) => {
      allSchemas[schema.id] = schema;
    });

    return NextResponse.json({
      routeList,
      port: process.env.PORT || 4000,
      apiSchemas: allSchemas,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
