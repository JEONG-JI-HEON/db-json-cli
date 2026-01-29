import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const GET = async () => {
  const globalDbPath = global.USER_DB_PATH;

  let dbContent = null;
  let dbExists = false;

  if (globalDbPath && fs.existsSync(globalDbPath)) {
    dbExists = true;
    dbContent = JSON.parse(fs.readFileSync(globalDbPath, "utf-8"));
  }

  return NextResponse.json({
    cwd: process.cwd(),
    globalDbPath: globalDbPath || "NOT SET",
    dbExists,
    dbKeys: dbContent ? Object.keys(dbContent) : null,
    userCount: dbContent?.users?.length || 0,
    listCount: dbContent?.list?.length || 0,
    list2Count: dbContent?.list2?.length || 0,
  });
};
