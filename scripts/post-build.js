import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const standalonePath = path.join(__dirname, "..", ".next", "standalone");
const serverFilePath = path.join(standalonePath, "server.js");

// 1. server.js에 디버깅 코드 추가
let serverCode = fs.readFileSync(serverFilePath, "utf-8");

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

serverCode = debugCode + serverCode;
fs.writeFileSync(serverFilePath, serverCode, "utf-8");

// 2. ✅ static 폴더와 public 폴더 복사
const staticSource = path.join(__dirname, "..", ".next", "static");
const staticDest = path.join(standalonePath, ".next", "static");

const publicSource = path.join(__dirname, "..", "public");
const publicDest = path.join(standalonePath, "public");

console.log("📦 Copying static files...");

if (fs.existsSync(staticSource)) {
  fs.copySync(staticSource, staticDest);
  console.log("✅ Copied .next/static");
} else {
  console.warn("⚠️  .next/static not found");
}

if (fs.existsSync(publicSource)) {
  fs.copySync(publicSource, publicDest);
  console.log("✅ Copied public");
} else {
  console.log("ℹ️  No public folder to copy");
}

console.log("✅ post-build.js completed");
