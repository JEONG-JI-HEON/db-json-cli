import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const standalonePath = path.join(__dirname, "..", ".next", "standalone");
const serverFilePath = path.join(standalonePath, "server.js");

// server.js 파일 읽기
let serverCode = fs.readFileSync(serverFilePath, "utf-8");

// ✅ ES module 방식으로 환경변수 로딩 코드 주입
const envLoaderCode = `
// === Runtime ENV Loader ===
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename_env = fileURLToPath(import.meta.url);
const __dirname_env = dirname(__filename_env);

try {
  const envPath = join(__dirname_env, '.env.runtime');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    content.split('\\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=');
        process.env[key] = value;
        console.log(\`✅ [Runtime] Loaded \${key}=\${value}\`);
      }
    });
  } else {
    console.log(\`⚠️ [Runtime] .env.runtime not found at \${envPath}\`);
  }
} catch (err) {
  console.error('⚠️ [Runtime] Failed to load .env.runtime:', err.message);
}
// === End Runtime ENV Loader ===

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
serverCode = envLoaderCode + serverCode;
fs.writeFileSync(serverFilePath, serverCode, "utf-8");

// static 폴더 복사
const staticSource = path.join(__dirname, "..", ".next", "static");
const staticDest = path.join(standalonePath, ".next", "static");

const publicSource = path.join(__dirname, "..", "public");
const publicDest = path.join(standalonePath, "public");

console.log("📦 Copying static files...");

if (fs.existsSync(staticSource)) {
  fs.copySync(staticSource, staticDest);
  console.log("✅ Copied .next/static");
}

if (fs.existsSync(publicSource)) {
  fs.copySync(publicSource, publicDest);
  console.log("✅ Copied public");
}

console.log("✅ post-build.js completed");
