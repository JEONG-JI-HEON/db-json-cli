import fs from "fs-extra";
import path from "path";

let dbCache = null;
let dbPath = null;

const findDBPath = () => {
  // ✅ 환경변수가 있으면 무조건 이걸 사용 (CLI에서 설정한 경로)
  if (process.env.DB_PATH) {
    const resolvedPath = path.resolve(process.env.DB_PATH);
    console.log(`🔍 Using DB_PATH from env: ${resolvedPath}`);
    return resolvedPath;
  }

  // 현재 디렉토리부터 찾기
  let currentDir = process.cwd();
  const rootDir = path.parse(currentDir).root;

  while (currentDir !== rootDir) {
    const potentialPath = path.join(currentDir, "db.json");
    if (fs.existsSync(potentialPath)) {
      console.log(`✅ Found db.json at: ${potentialPath}`);
      return potentialPath;
    }
    currentDir = path.dirname(currentDir);
  }

  // 못 찾으면 기본 경로
  const defaultPath = path.join(process.cwd(), "db.json");
  console.log(`📝 Creating new db.json at: ${defaultPath}`);
  return defaultPath;
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
    console.log(`📖 Reading db.json from: ${dbPath}`);
    const data = await fs.readJson(dbPath);
    console.log(`📊 DB Keys: ${Object.keys(data).join(", ")}`);
    dbCache = data;
  } else {
    console.log(`🆕 Creating default db.json at: ${dbPath}`);
    dbCache = defaultDB;
    await fs.writeJson(dbPath, defaultDB, { spaces: 2 });
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
