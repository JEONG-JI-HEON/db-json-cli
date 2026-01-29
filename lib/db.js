import fs from "fs-extra";
import path from "path";

let dbCache = null;
let dbPath = null;

const getDbPath = () => {
  if (dbPath) return dbPath;

  try {
    // db-config.json 읽기
    const configPath = path.join(process.cwd(), "db-config.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      dbPath = config.dbPath;
      return dbPath;
    }
  } catch (err) {
    // 무시
  }

  // fallback: 개발 모드
  dbPath = path.join(process.cwd(), "db.json");
  return dbPath;
};

export const getDB = async () => {
  if (dbCache) return dbCache;

  const finalDbPath = getDbPath();

  const defaultDB = {
    users: [],
    rules: { test1: "public", test2: "private", test3: "public" },
    test1: [{ id: 1, message: "good" }],
    test2: [{ id: 1, message: "good" }],
    test3: [{ id: 1, message: "good" }],
  };

  if (fs.existsSync(finalDbPath)) {
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
