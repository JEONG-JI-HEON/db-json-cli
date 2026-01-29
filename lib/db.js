import fs from "fs-extra";

let dbCache = null;
let dbPath = null;

const getDbPath = () => {
  if (dbPath) return dbPath;

  const envDbPath = process.env.DB_JSON_PATH;
  if (!envDbPath) {
    throw new Error("DB_JSON_PATH is not defined");
  }

  dbPath = envDbPath;
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
