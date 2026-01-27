import { NextResponse } from "next/server";
import { authSchemas, generateResourceSchemas } from "@/lib/api_schema";
import fs from "fs";
import path from "path";

export const GET = async () => {
  try {
    // ✅ 저장된 절대 경로 읽기
    const pathFilePath = path.join(process.cwd(), ".db-absolute-path.txt");
    const dbPath = fs.readFileSync(pathFilePath, "utf-8").trim();

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
