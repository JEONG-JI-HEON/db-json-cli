import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const GET = async () => {
  const pathFilePath = path.join(process.cwd(), ".db-absolute-path.txt");
  const originalPathFile = path.join(process.cwd(), ".db-original-path.txt");

  let dbPath = null;
  let dbContent = null;

  if (fs.existsSync(pathFilePath)) {
    dbPath = fs.readFileSync(pathFilePath, "utf-8").trim();
    if (fs.existsSync(dbPath)) {
      dbContent = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    }
  }

  return NextResponse.json({
    cwd: process.cwd(),
    pathFileExists: fs.existsSync(pathFilePath),
    pathFileContent: fs.existsSync(pathFilePath) ? fs.readFileSync(pathFilePath, "utf-8") : null,
    originalPathFileExists: fs.existsSync(originalPathFile),
    originalPathFileContent: fs.existsSync(originalPathFile) ? fs.readFileSync(originalPathFile, "utf-8") : null,
    dbPath,
    dbExists: dbPath ? fs.existsSync(dbPath) : false,
    dbKeys: dbContent ? Object.keys(dbContent) : null,
    userCount: dbContent?.users?.length || 0,
    listCount: dbContent?.list?.length || 0,
    list2Count: dbContent?.list2?.length || 0,
  });
};
