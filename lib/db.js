import fs from "fs-extra";
import path from "path";

let dbCache = null;
let dbPath = null;

const getDbPath = () => {
  if (dbPath) return dbPath;

  // 1️⃣ CLI / production (정식 루트)
  if (process.env.DB_JSON_PATH) {
    dbPath = process.env.DB_JSON_PATH;
    return dbPath;
  }

  // 2️⃣ dev fallback (라이브러리 개발용)
  if (process.env.NODE_ENV !== "production") {
    dbPath = path.join(process.cwd(), "db.json");
    return dbPath;
  }

  // 3️⃣ prod인데 ENV 없음 → 에러
  throw new Error("DB_JSON_PATH is not defined");
};

export const getDB = async () => {
  if (dbCache) return dbCache;

  const finalDbPath = getDbPath();

  const defaultDB = {
    users: [],
    rules: {},
  };

  if (await fs.pathExists(finalDbPath)) {
    dbCache = await fs.readJson(finalDbPath);
  } else {
    dbCache = defaultDB;
    await fs.writeJson(finalDbPath, defaultDB, { spaces: 2 });
  }

  return dbCache;
};

export const saveDB = async (db) => {
  const finalDbPath = getDbPath();
  dbCache = db;
  await fs.writeJson(finalDbPath, db, { spaces: 2 });
};

export const refreshDB = async () => {
  dbCache = null;
  dbPath = null;
  return await getDB();
};
