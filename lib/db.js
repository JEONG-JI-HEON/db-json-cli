import fs from "fs-extra";
import path from "path";

let dbCache = null;
let dbPath = null;

const findDBPath = () => {
  // ✅ 환경변수 최우선 (런타임에 매번 체크)
  if (process.env.DB_PATH) {
    const resolvedPath = path.resolve(process.env.DB_PATH);
    console.log(`🔍 [findDBPath] Using DB_PATH from env: ${resolvedPath}`);
    return resolvedPath;
  }

  console.log(`⚠️ [findDBPath] DB_PATH not set, searching...`);

  let currentDir = process.cwd();
  const rootDir = path.parse(currentDir).root;

  while (currentDir !== rootDir) {
    const potentialPath = path.join(currentDir, "db.json");
    if (fs.existsSync(potentialPath)) {
      console.log(`✅ [findDBPath] Found db.json at: ${potentialPath}`);
      return potentialPath;
    }
    currentDir = path.dirname(currentDir);
  }

  const defaultPath = path.join(process.cwd(), "db.json");
  console.log(`📝 [findDBPath] Creating new db.json at: ${defaultPath}`);
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
    console.log(`💾 [getDB] Returning cached DB from: ${dbPath}`);
    return dbCache;
  }

  if (!dbPath) {
    dbPath = findDBPath();
  }

  console.log(`📂 [getDB] Final dbPath: ${dbPath}`);
  console.log(`🔍 [getDB] Checking if file exists...`);

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

  if (fs.existsSync(dbPath)) {
    console.log(`📖 [getDB] File exists! Reading from: ${dbPath}`);
    try {
      const data = await fs.readJson(dbPath);
      console.log(`📊 [getDB] Successfully read DB. Keys: ${Object.keys(data).join(", ")}`);
      console.log(`📊 [getDB] Users count: ${data.users?.length || 0}`);
      console.log(`📊 [getDB] List count: ${data.list?.length || 0}`);
      dbCache = data;
    } catch (error) {
      console.error(`❌ [getDB] Error reading db.json:`, error);
      throw error;
    }
  } else {
    console.log(`🆕 [getDB] File doesn't exist. Creating default db.json at: ${dbPath}`);
    dbCache = defaultDB;
    await fs.writeJson(dbPath, defaultDB, { spaces: 2 });
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
