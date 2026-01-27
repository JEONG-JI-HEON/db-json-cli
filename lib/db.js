import fs from "fs-extra";
import path from "path";

let dbCache = null;
let dbPath = null;

// db.json 파일을 프로젝트 내에서 찾는 함수
const findDBPath = () => {
  // 1. 환경변수가 있으면 최우선
  if (process.env.DB_PATH) {
    return path.resolve(process.env.DB_PATH);
  }

  // 2. 사용자가 명령어를 실행한 위치(현재 작업 디렉토리)부터 찾기
  let currentDir = process.cwd();
  const rootDir = path.parse(currentDir).root;

  // 현재 디렉토리부터 루트까지 올라가며 db.json 찾기
  while (currentDir !== rootDir) {
    const potentialPath = path.join(currentDir, "db.json");
    if (fs.existsSync(potentialPath)) {
      console.log(`✅ Found db.json at: ${potentialPath}`); // 디버깅용
      return potentialPath;
    }
    currentDir = path.dirname(currentDir);
  }

  // 3. 못 찾으면 현재 작업 디렉토리에 새로 생성
  const defaultPath = path.join(process.cwd(), "db.json");
  console.log(`📝 Creating new db.json at: ${defaultPath}`); // 디버깅용
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
    console.log(`📖 Reading existing db.json from: ${dbPath}`); // 디버깅용
    dbCache = await fs.readJson(dbPath);
  } else {
    console.log(`🆕 Creating default db.json at: ${dbPath}`); // 디버깅용
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
