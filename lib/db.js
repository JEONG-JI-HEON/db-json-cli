import fs from "fs-extra";
import path from "path";

let dbCache = null;
let dbPath = null;
let originalDbPath = null;
let lastLoadTime = 0;

const loadDbPaths = () => {
  if (dbPath) return;

  const pathFilePath = path.join(process.cwd(), ".db-absolute-path.txt");

  if (fs.existsSync(pathFilePath)) {
    dbPath = fs.readFileSync(pathFilePath, "utf-8").trim();

    const originalPathFile = path.join(process.cwd(), ".db-original-path.txt");
    if (fs.existsSync(originalPathFile)) {
      originalDbPath = fs.readFileSync(originalPathFile, "utf-8").trim();
    }
  } else {
    dbPath = path.join(process.cwd(), "db.json");
    originalDbPath = null;
  }
};

export const getDB = async () => {
  // ✅ 캐시가 있어도 5초마다 파일 변경 확인
  const now = Date.now();
  if (dbCache && now - lastLoadTime < 5000) {
    return dbCache;
  }

  loadDbPaths();

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
    dbCache = await fs.readJson(dbPath);
    lastLoadTime = now;
  } else {
    dbCache = defaultDB;
    lastLoadTime = now;
    await fs.writeJson(dbPath, defaultDB, { spaces: 2 });
    if (originalDbPath) {
      await fs.writeJson(originalDbPath, defaultDB, { spaces: 2 });
    }
  }

  return dbCache;
};

export const saveDB = async (db) => {
  loadDbPaths();

  dbCache = db;
  lastLoadTime = Date.now();

  await fs.writeJson(dbPath, db, { spaces: 2 });

  if (originalDbPath) {
    await fs.writeJson(originalDbPath, db, { spaces: 2 });
  }
};

export const refreshDB = async () => {
  dbCache = null;
  dbPath = null;
  originalDbPath = null;
  lastLoadTime = 0;
  return await getDB();
};
