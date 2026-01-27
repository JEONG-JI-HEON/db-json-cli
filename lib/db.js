import fs from "fs-extra";
import path from "path";

let dbCache = null;
let dbPath = null;

const getEnvDBPath = () => {
  return process.env.DB_PATH || process.env.NEXT_PUBLIC_DB_PATH;
};

const findDBPath = () => {
  const envPath = getEnvDBPath();

  if (envPath) {
    const resolvedPath = path.resolve(envPath);
    process.stdout.write(`🔍 [DB] Using DB_PATH: ${resolvedPath}\n`);
    return resolvedPath;
  }

  process.stdout.write(`⚠️ [DB] DB_PATH not set, using default\n`);
  const defaultPath = path.join(process.cwd(), "db.json");
  return defaultPath;
};

export const getDB = async () => {
  const currentEnvPath = getEnvDBPath();

  if (currentEnvPath && dbPath && dbPath !== path.resolve(currentEnvPath)) {
    process.stdout.write(`🔄 [DB] Cache cleared\n`);
    dbCache = null;
    dbPath = null;
  }

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
      process.stdout.write(`📊 [DB] users: ${data.users?.length || 0}, list: ${data.list?.length || 0}\n`);
      dbCache = data;
    } else {
      process.stdout.write(`🆕 [DB] Creating default db.json\n`);
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
