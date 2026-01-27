import { NextResponse } from "next/server";
import { authSchemas, generateResourceSchemas } from "@/lib/api_schema";
import { getDB } from "@/lib/db";

export const GET = async () => {
  try {
    console.log(`\n🔍 [API /info] Request received`);
    console.log(`🔍 [API /info] process.env.DB_PATH = ${process.env.DB_PATH}`);
    console.log(`🔍 [API /info] process.cwd() = ${process.cwd()}`);

    const db = await getDB();

    console.log(`🔍 [API /info] DB loaded. Keys: ${Object.keys(db).join(", ")}`);

    const routeList = Object.keys(db)
      .filter((key) => key !== "users" && key !== "config" && key !== "rules")
      .map((key) => ({
        key,
        count: db[key]?.length || 0,
        permission: db.rules?.[key] || "public",
      }));

    console.log(`🔍 [API /info] RouteList:`, routeList);

    const allSchemas = {
      ...authSchemas,
    };

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
    console.error(`❌ [API /info] Error:`, error);
    return NextResponse.json({ message: "API 정보를 불러오는데 실패했습니다" }, { status: 500 });
  }
};
