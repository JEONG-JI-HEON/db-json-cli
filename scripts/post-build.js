import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const standalonePath = path.join(__dirname, "..", ".next", "standalone");
const serverFilePath = path.join(standalonePath, "server.js");

// server.js 파일 읽기
let serverCode = fs.readFileSync(serverFilePath, "utf-8");

// 환경변수 디버깅 코드 추가 (server.js 맨 앞에 삽입)
const debugCode = `
console.log("\\n🚀 [Server] Starting standalone server...");
console.log("🔍 [Server] Environment variables:");
console.log("   - DB_PATH:", process.env.DB_PATH);
console.log("   - PORT:", process.env.PORT);
console.log("   - HOSTNAME:", process.env.HOSTNAME);
console.log("   - NODE_ENV:", process.env.NODE_ENV);
console.log("   - cwd:", process.cwd());
console.log("");
`;

// 코드 앞에 추가
serverCode = debugCode + serverCode;

// 다시 저장
fs.writeFileSync(serverFilePath, serverCode, "utf-8");

console.log("✅ post-build.js: Added environment variable logging to server.js");
