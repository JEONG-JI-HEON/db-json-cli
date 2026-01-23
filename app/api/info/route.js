import { NextResponse } from "next/server";

import { authSchemas, generateResourceSchemas } from "@/lib/api_schema";
import { getDB } from "@/lib/db";

export const GET = async () => {
  try {
    const db = await getDB();

    const routeList = Object.keys(db)
      .filter((key) => key !== "users" && key !== "config" && key !== "rules")
      .map((key) => ({
        key,
        count: db[key]?.length || 0,
        permission: db.rules?.[key] || "public",
      }));

    // 인증 스키마 + 자동 생성된 리소스 스키마
    const allSchemas = {
      ...authSchemas,
    };

    // 리소스 스키마를 배열로 받아서 객체로 변환
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
    return NextResponse.json({ message: "API 정보를 불러오는데 실패했습니다" }, { status: 500 });
  }
};
