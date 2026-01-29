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

// ✅ 환경변수로 DB 경로 전달
const child = spawn(
  "node",
  [
    "-e",
    `process.env.USER_DB_PATH = "${userDbPath.replace(/\\/g, "\\\\")}"; require("${path.join(standalonePath, "server.js").replace(/\\/g, "\\\\")}")`,
  ],
  {
    cwd: standalonePath,
    stdio: "inherit",
    env: {
      ...process.env,
      USER_DB_PATH: userDbPath,
      PORT: argv.port.toString(),
      HOSTNAME: "0.0.0.0",
    },
    shell: true,
  },
);

child.on("exit", (code) => process.exit(code));
