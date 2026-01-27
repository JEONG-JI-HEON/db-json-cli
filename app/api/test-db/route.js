import { NextResponse } from "next/server";
import { getDB } from "@/lib/db"; // ← 이걸 호출해야 .env.runtime을 읽음

export const GET = async () => {
  try {
    // ✅ getDB()를 호출하면 loadRuntimeEnv()가 실행됨
    const db = await getDB();

    return NextResponse.json({
      env_DB_PATH: process.env.DB_PATH,
      cwd: process.cwd(),
      db_keys: Object.keys(db),
      db_users_count: db.users?.length || 0,
      db_list_count: db.list?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
        env_DB_PATH: process.env.DB_PATH,
        cwd: process.cwd(),
      },
      { status: 500 },
    );
  }
};
