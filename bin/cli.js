#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// version 읽기
const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const version = packageJson.version;

// args
const argv = yargs(hideBin(process.argv))
  .option("port", { alias: "p", type: "number", default: 4000 })
  .option("db", { alias: "d", type: "string", default: "./db.json" })
  .version(version)
  .help().argv;

// paths
const standalonePath = path.join(__dirname, "..", ".next", "standalone");
const userProjectRoot = process.cwd(); //사용자 프로젝트 루트
const userDbPath = path.resolve(userProjectRoot, argv.db); // db.json 절대경로

console.log(`✅ db-json-cli v${version} running on http://localhost:${argv.port}`);
console.log(`📁 DB: ${userDbPath}\n`);

// next standalone 실행
const child = spawn("node", ["server.js"], {
  cwd: standalonePath,
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: argv.port.toString(),
    HOSTNAME: "0.0.0.0",
    USER_PROJECT_ROOT: userProjectRoot,
    DB_JSON_PATH: userDbPath, // ⭐ 핵심
  },
});

child.on("exit", (code) => process.exit(code));
