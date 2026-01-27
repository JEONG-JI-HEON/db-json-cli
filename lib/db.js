import fs from "fs-extra";
import path from "path";

let dbCache = null;
let dbPath = null;

const findDBPath = () => {
  // 이제 server.js에서 환경변수를 미리 로드했으니 바로 사용
  if (process.env.DB_PATH) {
    const resolvedPath = path.resolve(process.env.DB_PATH);
    process.stdout.write(`🔍 [DB] Using DB_PATH: ${resolvedPath}\n`);
    return resolvedPath;
  }

  process.stdout.write(`⚠️ [DB] DB_PATH not set\n`);
  return path.join(process.cwd(), "db.json");
};

export const getDB = async () => {
  if (dbCache) {
    return dbCache;
  }

  if (!dbPath) {
    dbPath = findDBPath();
  }

  process.stdout.write(`📂 [DB] Final path: ${dbPath}\n`);
  process.stdout.write(`🔍 [DB] File exists: ${fs.existsSync(dbPath)}\n`);

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
      process.stdout.write(`📖 [DB] Reading file...\n`);
      const data = await fs.readJson(dbPath);
      process.stdout.write(`✅ [DB] Loaded! Keys: ${Object.keys(data).join(", ")}\n`);
      process.stdout.write(`📊 [DB] users: ${data.users?.length}, list: ${data.list?.length}\n`);
      dbCache = data;
    } else {
      process.stdout.write(`🆕 [DB] Creating default\n`);
      dbCache = defaultDB;
      await fs.writeJson(dbPath, defaultDB, { spaces: 2 });
    }
  } catch (error) {
    process.stderr.write(`❌ [DB] Error: ${error.message}\n`);
    throw error;
  }

  return dbCache;
};

export const saveDB = async (db) => {
  if (!dbPath) {
    dbPath = findDBPath();
  }
  dbCache = db;
  await fs.writeJson(dbPath, db, { spaces: 2 });
};

export const refreshDB = async () => {
  dbCache = null;
  dbPath = null;
  return await getDB();
};
