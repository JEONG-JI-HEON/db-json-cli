import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const standaloneRoot = findStandaloneRoot();
  const dbPath1 = path.join(standaloneRoot, "db.json");
  const dbPath2 = path.join(process.cwd(), "db.json");

  return NextResponse.json({
    __dirname,
    cwd: process.cwd(),
    standaloneRoot,
    dbPath1,
    dbPath1_exists: fs.existsSync(dbPath1),
    dbPath2,
    dbPath2_exists: fs.existsSync(dbPath2),
  });
};
