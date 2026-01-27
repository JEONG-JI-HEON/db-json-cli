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
const dbFullPath = path.resolve(argv.db);

// ✅ 환경변수를 파일로 저장
const envFilePath = path.join(standalonePath, ".env.runtime");
const envContent = `DB_PATH=${dbFullPath}\nPORT=${argv.port}\nHOSTNAME=0.0.0.0`;
fs.writeFileSync(envFilePath, envContent, "utf-8");

console.log(`✅ db-json-cli v${version} running on http://localhost:${argv.port}`);
console.log(`📁 DB Path: ${dbFullPath}`);
console.log(`💾 Runtime env saved to: ${envFilePath}\n`);

const childEnv = {
  ...process.env,
  DB_PATH: dbFullPath,
  PORT: argv.port.toString(),
  HOSTNAME: "0.0.0.0",
  NODE_ENV: "production",
};

const child = spawn("node", [path.join(standalonePath, "server.js")], {
  cwd: standalonePath,
  stdio: "inherit",
  env: childEnv,
  shell: process.platform === "win32",
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
