import { NextResponse } from "next/server";
import fs from "fs";

export const GET = async () => {
  const dbPath = process.env.DB_PATH;

  const result = {
    env_DB_PATH: dbPath,
    cwd: process.cwd(),
    file_exists: dbPath ? fs.existsSync(dbPath) : false,
    file_content: null,
  };

  if (dbPath && fs.existsSync(dbPath)) {
    try {
      result.file_content = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    } catch (err) {
      result.error = err.message;
    }
  }

  return NextResponse.json(result, { status: 200 });
};
