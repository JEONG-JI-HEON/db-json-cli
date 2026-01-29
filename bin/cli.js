#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const version = packageJson.version;

const argv = yargs(hideBin(process.argv))
  .option("port", { alias: "p", type: "number", default: 4000 })
  .option("db", { alias: "d", type: "string", default: "./db.json" })
  .option("watch", { alias: "w", type: "boolean", default: false })
  .version(version)
  .help().argv;

const standalonePath = path.join(__dirname, "..", ".next", "standalone");
const userDbPath = path.resolve(argv.db);

console.log(`✅ db-json-cli v${version} running on http://localhost:${argv.port}`);
console.log(`📁 DB: ${userDbPath}\n`);

// ✅ server.js를 런타임에 수정해서 DB 경로 주입
const serverPath = path.join(standalonePath, "server.js");
const serverBackupPath = path.join(standalonePath, "server.js.backup");

// 백업이 없으면 원본 백업
if (!fs.existsSync(serverBackupPath)) {
  fs.copyFileSync(serverPath, serverBackupPath);
}

// 백업에서 복원
fs.copyFileSync(serverBackupPath, serverPath);

// DB 경로를 전역 변수로 주입
let serverCode = fs.readFileSync(serverPath, "utf-8");
const dbPathInjection = `
// === DB PATH INJECTION ===
global.USER_DB_PATH = "${userDbPath.replace(/\\/g, "\\\\")}";
console.log("✅ [Server] DB Path injected:", global.USER_DB_PATH);
// === END DB PATH INJECTION ===

`;
serverCode = dbPathInjection + serverCode;
fs.writeFileSync(serverPath, serverCode, "utf-8");

const child = spawn("node", [serverPath], {
  cwd: standalonePath,
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: argv.port.toString(),
    HOSTNAME: "0.0.0.0",
  },
  shell: process.platform === "win32",
});

child.on("exit", (code) => {
  // 종료 시 원본 복원
  if (fs.existsSync(serverBackupPath)) {
    fs.copyFileSync(serverBackupPath, serverPath);
  }
  process.exit(code);
});
