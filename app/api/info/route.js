import { NextResponse } from "next/server";
import { authSchemas, generateResourceSchemas } from "@/lib/api_schema";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ standalone 폴더 찾기
const findStandaloneRoot = () => {
  let currentDir = __dirname;
  while (currentDir !== path.parse(currentDir).root) {
    if (path.basename(currentDir) === "standalone") {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  return process.cwd();
};

export const GET = async () => {
  try {
    const standaloneRoot = findStandaloneRoot();
    const dbPath = path.join(standaloneRoot, "db.json");

    // ✅ lib/db 안 쓰고 직접 읽기
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
