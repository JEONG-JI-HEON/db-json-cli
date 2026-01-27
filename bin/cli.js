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

// ✅ 절대 경로로 변환
const dbFullPath = path.resolve(argv.db);

console.log(`✅ db-json-cli v${version} running on http://localhost:${argv.port}`);
console.log(`📁 DB Path: ${dbFullPath}\n`);

// ✅ 환경변수를 명시적으로 객체로 만들어서 전달
const childEnv = {
  ...process.env, // 기존 환경변수 복사
  DB_PATH: dbFullPath,
  PORT: argv.port.toString(),
  HOSTNAME: "0.0.0.0",
  NODE_ENV: "production",
};

console.log(`🔍 [CLI] Setting environment variables:`);
console.log(`   - DB_PATH: ${childEnv.DB_PATH}`);
console.log(`   - PORT: ${childEnv.PORT}`);
console.log(`   - HOSTNAME: ${childEnv.HOSTNAME}\n`);

const child = spawn("node", [path.join(standalonePath, "server.js")], {
  cwd: standalonePath,
  stdio: "inherit",
  env: childEnv, // ✅ 명시적으로 환경변수 전달
  shell: process.platform === "win32", // ✅ Windows 호환성
});

child.on("error", (error) => {
  console.error(`❌ Failed to start server:`, error);
  process.exit(1);
});

child.on("exit", (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
  }
  process.exit(code);
});
