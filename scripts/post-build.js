import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

const staticSrc = path.join(projectRoot, ".next", "static");
const staticDest = path.join(projectRoot, ".next", "standalone", ".next", "static");

console.log("Copying static files to standalone...");
fs.copySync(staticSrc, staticDest);
console.log("Done!");
