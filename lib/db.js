import fs from "fs-extra";

import path from "path";

let dbCache = null;
let dbPath = null;

// db.json 파일을 프로젝트 내에서 찾는 함수
const findDBPath = () => {
  if (process.env.DB_PATH) {
    return process.env.DB_PATH;
  }

  // 현재 디렉토리부터 시작해서 상위로 올라가며 db.json 찾기
  let currentDir = process.cwd();

  while (currentDir !== path.parse(currentDir).root) {
    const potentialPath = path.join(currentDir, "db.json");
    if (fs.existsSync(potentialPath)) {
      return potentialPath;
    }
    currentDir = path.dirname(currentDir);
  }

  // 못 찾으면 기본 경로
  return path.join(process.cwd(), "db.json");
};

export const getDB = async () => {
  if (dbCache) return dbCache;

  if (!dbPath) {
    dbPath = findDBPath();
  }

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
  dbPath = null;
  return await getDB();
};
