import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .next/standalone 경로
const standalonePath = path.join(__dirname, "..", ".next", "standalone");

/**
 * wrapper.js 생성
 * - CLI에서 전달된 ENV(DB_JSON_PATH)를 그대로 사용
 * - 여기서는 검증만 하고 실제 로직은 server.js → db.js에서 처리
 */
const wrapperCode = `
const path = require("path");

if (!process.env.DB_JSON_PATH) {
  console.error("ERROR: DB_JSON_PATH is not set");
  process.exit(1);
}

console.log("✅ [Wrapper] Using DB:", process.env.DB_JSON_PATH);

// Next standalone server 실행
require("./server.js");
`;

fs.writeFileSync(path.join(standalonePath, "wrapper.js"), wrapperCode, "utf-8");

// .next/static 복사
const staticSource = path.join(__dirname, "..", ".next", "static");
const staticDest = path.join(standalonePath, ".next", "static");

if (fs.existsSync(staticSource)) {
  fs.copySync(staticSource, staticDest);
  console.log("✅ Copied .next/static");
}

// public 복사
const publicSource = path.join(__dirname, "..", "public");
const publicDest = path.join(standalonePath, "public");

if (fs.existsSync(publicSource)) {
  fs.copySync(publicSource, publicDest);
  console.log("✅ Copied public");
}

console.log("✅ post-build completed");
