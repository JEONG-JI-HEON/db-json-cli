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

// ✅ 사용자 db.json을 standalone 폴더에 복사
const targetDbPath = path.join(standalonePath, "db.json");
fs.copyFileSync(userDbPath, targetDbPath);

console.log(`✅ db-json-cli v${version} running on http://localhost:${argv.port}`);
console.log(`📁 DB copied from: ${userDbPath}`);
console.log(`📁 DB copied to: ${targetDbPath}\n`);

process.env.PORT = argv.port.toString();
process.env.HOSTNAME = "0.0.0.0";
process.env.NODE_ENV = "production";

const child = spawn("node", [path.join(standalonePath, "server.js")], {
  cwd: standalonePath,
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

child.on("error", (error) => {
  console.error(`❌ Failed to start server:`, error);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code);
});
