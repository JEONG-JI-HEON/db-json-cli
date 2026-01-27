import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const standalonePath = path.join(__dirname, "..", ".next", "standalone");

// static 폴더 복사
const staticSource = path.join(__dirname, "..", ".next", "static");
const staticDest = path.join(standalonePath, ".next", "static");

const publicSource = path.join(__dirname, "..", "public");
const publicDest = path.join(standalonePath, "public");

if (fs.existsSync(staticSource)) {
  fs.copySync(staticSource, staticDest);
  console.log("✅ Copied .next/static");
}

if (fs.existsSync(publicSource)) {
  fs.copySync(publicSource, publicDest);
  console.log("✅ Copied public");
}

console.log("✅ post-build completed");
