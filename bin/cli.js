#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import fs from "fs"; // ← 이거 추가!

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// package.json에서 버전 읽기
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

process.env.DB_PATH = path.resolve(argv.db);
process.env.PORT = argv.port.toString();
process.env.HOSTNAME = "0.0.0.0";

console.log(`✅ db-json-cli v${version} running on http://localhost:${argv.port}\n`);

spawn("node", [path.join(standalonePath, "server.js")], {
  cwd: standalonePath,
  stdio: "inherit",
  env: process.env,
});
