import fs from "fs-extra";
import path from "path";

let dbCache = null;
let dbPath = null;
let originalDbPath = null;

const loadDbPaths = () => {
  if (dbPath) return;

  const pathFilePath = path.join(process.cwd(), ".db-absolute-path.txt");

  if (fs.existsSync(pathFilePath)) {
    // 프로덕션 (standalone)
    dbPath = fs.readFileSync(pathFilePath, "utf-8").trim();

    const originalPathFile = path.join(process.cwd(), ".db-original-path.txt");
    if (fs.existsSync(originalPathFile)) {
      originalDbPath = fs.readFileSync(originalPathFile, "utf-8").trim();
    }
  } else {
    // 개발 모드
    dbPath = path.join(process.cwd(), "db.json");
    originalDbPath = null;
  }
};

export const getDB = async () => {
  if (dbCache) return dbCache;

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
  } else {
    dbCache = defaultDB;
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

  // standalone에 저장
  await fs.writeJson(dbPath, db, { spaces: 2 });

  // 원본에도 저장
  if (originalDbPath) {
    await fs.writeJson(originalDbPath, db, { spaces: 2 });
  }
};

export const refreshDB = async () => {
  dbCache = null;
  dbPath = null;
  originalDbPath = null;
  return await getDB();
};
