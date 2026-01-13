#!/usr/bin/env node

import { execSync } from "child_process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const argv = yargs(hideBin(process.argv))
  .option("port", { alias: "p", type: "number", default: 4000 })
  .option("db", { alias: "d", type: "string", default: "./db.json" })
  .option("watch", { alias: "w", type: "boolean", default: false })
  .help().argv;

// 패키지 내부의 프로젝트 루트 (db-json-cli 자체)
const packageRoot = path.join(__dirname, "..");

process.env.DB_PATH = path.resolve(argv.db);
process.env.PORT = argv.port.toString();

console.log(`✅ db-json-cli running on http://localhost:${argv.port}\n`);

try {
  // packageRoot에서 Next.js 실행
  execSync(`npx next start -p ${argv.port}`, {
    stdio: "inherit",
    cwd: packageRoot,
    env: process.env,
    shell: true,
  });
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
