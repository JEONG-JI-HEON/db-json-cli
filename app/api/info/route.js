import { NextResponse } from "next/server";
import { authSchemas, generateResourceSchemas } from "@/lib/api_schema";
import { getDB } from "@/lib/db";

export const GET = async () => {
  process.stdout.write("\n=== API /info called ===\n");
  process.stdout.write(`DB_PATH: ${process.env.DB_PATH}\n`);
  process.stdout.write(`CWD: ${process.cwd()}\n\n`);

  try {
    const db = await getDB();

    process.stdout.write(`Loaded DB keys: ${Object.keys(db).join(", ")}\n\n`);

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
    process.stderr.write(`ERROR: ${error.message}\n`);
    return NextResponse.json({ message: "API 정보를 불러오는데 실패했습니다" }, { status: 500 });
  }
};
