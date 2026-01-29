import fs from "fs-extra";

let dbCache = null;

const getDbPath = () => {
  // ✅ 전역 변수에서 경로 가져오기
  if (global.USER_DB_PATH) {
    return global.USER_DB_PATH;
  }
  // 개발 모드 fallback
  return "./db.json";
};

export const getDB = async () => {
  if (dbCache) return dbCache;

  const dbPath = getDbPath();

  const defaultDB = {
    users: [],
    rules: { test1: "public", test2: "private", test3: "public" },
    test1: [{ id: 1, message: "good" }],
    test2: [{ id: 1, message: "good" }],
    test3: [{ id: 1, message: "good" }],
  };

  if (fs.existsSync(dbPath)) {
    dbCache = await fs.readJson(dbPath);
  } else {
    dbCache = defaultDB;
    await fs.writeJson(dbPath, defaultDB, { spaces: 2 });
  }

  return dbCache;
};

export const saveDB = async (db) => {
  const dbPath = getDbPath();
  dbCache = db;
  await fs.writeJson(dbPath, db, { spaces: 2 });
};

export const refreshDB = async () => {
  dbCache = null;
  return await getDB();
};
