import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbCache = null;

// ✅ standalone 루트로 올라가서 db.json 찾기
// lib/db.js가 .next/standalone/.next/server/... 어딘가에 있으니
// 여러 단계 상위로 올라가서 standalone 폴더 찾기
const findStandaloneRoot = () => {
  let currentDir = __dirname;

  // standalone 폴더를 찾을 때까지 상위로
  while (currentDir !== path.parse(currentDir).root) {
    if (path.basename(currentDir) === "standalone") {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  // 못 찾으면 현재 cwd 사용 (fallback)
  return process.cwd();
};

const standaloneRoot = findStandaloneRoot();
const dbPath = path.join(standaloneRoot, "db.json");

export const getDB = async () => {
  if (dbCache) return dbCache;

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
  }

  return dbCache;
};

export const saveDB = async (db) => {
  dbCache = db;
  await fs.writeJson(dbPath, db, { spaces: 2 });
};

export const refreshDB = async () => {
  dbCache = null;
  return await getDB();
};
