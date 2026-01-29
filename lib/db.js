import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbCache = null;
let dbPath = null;

// 프로젝트 루트 찾기 (node_modules 역추적)
const findProjectRoot = () => {
  let currentDir = __dirname;

  // node_modules를 찾을 때까지 상위로 이동
  while (currentDir !== path.parse(currentDir).root) {
    if (path.basename(currentDir) === "node_modules") {
      // node_modules의 부모가 프로젝트 루트
      return path.dirname(currentDir);
    }
    currentDir = path.dirname(currentDir);
  }

  // 못 찾으면 현재 디렉토리
  return process.cwd();
};

const getDbPath = () => {
  if (dbPath) return dbPath;

  // CLI에서 전달한 환경변수 우선
  if (process.env.USER_DB_PATH && fs.existsSync(process.env.USER_DB_PATH)) {
    dbPath = process.env.USER_DB_PATH;
    return dbPath;
  }

  // 프로젝트 루트에서 db.json 찾기
  const projectRoot = findProjectRoot();

  // 여러 가능한 위치 시도
  const possiblePaths = [
    path.join(projectRoot, "src", "db", "db.json"),
    path.join(projectRoot, "db.json"),
    path.join(projectRoot, "data", "db.json"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      dbPath = p;
      return dbPath;
    }
  }

  // 기본값
  dbPath = path.join(projectRoot, "db.json");
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

  if (fs.existsSync(finalDbPath)) {
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
