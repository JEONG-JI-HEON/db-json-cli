import fs from "fs-extra";
import path from "path";

let dbCache = null;
let dbPath = null;

const findDBPath = () => {
  // ✅ 환경변수가 있으면 무조건 사용 (CLI에서 사용자 프로젝트 경로 전달)
  if (process.env.DB_PATH) {
    const resolvedPath = path.resolve(process.env.DB_PATH);
    console.log(`🔍 [findDBPath] Using DB_PATH from env: ${resolvedPath}`);
    return resolvedPath;
  }

  // ⚠️ 환경변수가 없으면 경고하고 기본값 사용
  console.warn(`⚠️ [findDBPath] DB_PATH not set! Using default: ./db.json`);
  const defaultPath = path.join(process.cwd(), "db.json");
  console.log(`📝 [findDBPath] Default path: ${defaultPath}`);
  return defaultPath;
};

export const getDB = async () => {
  // ✅ 환경변수가 바뀌면 캐시 무효화
  const currentEnvPath = process.env.DB_PATH;
  if (currentEnvPath && dbPath && dbPath !== path.resolve(currentEnvPath)) {
    console.log(`🔄 [getDB] DB_PATH changed, clearing cache`);
    dbCache = null;
    dbPath = null;
  }

  if (dbCache) {
    console.log(`💾 [getDB] Returning cached DB`);
    return dbCache;
  }

  if (!dbPath) {
    dbPath = findDBPath();
  }

  console.log(`📂 [getDB] Using dbPath: ${dbPath}`);
  console.log(`🔍 [getDB] File exists: ${fs.existsSync(dbPath)}`);

  const defaultDB = {
    users: [],
    rules: { test1: "public", test2: "private", test3: "public" },
    test1: [
      { id: 1, message: "good" },
      { id: 2, message: "good" },
      { id: 3, message: "good" },
    ],
    test2: [
      { id: 1, message: "good" },
      { id: 2, message: "good" },
      { id: 3, message: "good" },
    ],
    test3: [
      { id: 1, message: "good" },
      { id: 2, message: "good" },
      { id: 3, message: "good" },
    ],
  };

  try {
    if (fs.existsSync(dbPath)) {
      console.log(`📖 [getDB] Reading file...`);
      const data = await fs.readJson(dbPath);
      console.log(`✅ [getDB] Successfully loaded! Keys: ${Object.keys(data).join(", ")}`);
      console.log(`📊 [getDB] - users: ${data.users?.length || 0} items`);
      console.log(`📊 [getDB] - list: ${data.list?.length || 0} items`);
      console.log(`📊 [getDB] - rules:`, data.rules);
      dbCache = data;
    } else {
      console.log(`🆕 [getDB] File doesn't exist, creating default db.json`);
      dbCache = defaultDB;
      await fs.writeJson(dbPath, defaultDB, { spaces: 2 });
    }
  } catch (error) {
    console.error(`❌ [getDB] Error:`, error);
    throw error;
  }

  return dbCache;
};

export const saveDB = async (db) => {
  if (!dbPath) {
    dbPath = findDBPath();
  }
  console.log(`💾 [saveDB] Saving to: ${dbPath}`);
  dbCache = db;
  await fs.writeJson(dbPath, db, { spaces: 2 });
};

export const refreshDB = async () => {
  console.log(`🔄 [refreshDB] Clearing cache and reloading...`);
  dbCache = null;
  dbPath = null;
  return await getDB();
};
