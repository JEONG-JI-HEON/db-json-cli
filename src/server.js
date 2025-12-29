import express from "express";
import fs from "fs-extra";
import bodyParser from "body-parser";
import cors from "cors";
import { hashPassword, comparePassword, generateTokens, authMiddleware } from "./auth.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const startServer = async (dbPath, port = 4000) => {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  // EJS 설정
  app.set("view engine", "ejs");
  app.set("views", __dirname);

  app.use(express.static("public"));

  let db = {
    users: [],
    rules: { test1: "public", test2: "private", test3: "public" },
    test1: [
      { id: 1, message: "good" },
      { id: 2, message: "good" },
      { id: 3, message: "good" },
    ],
    test2: [
      { id: 1, message: "good" },
      { id: 2, message: "good" },
      { id: 3, message: "good" },
    ],
    test3: [
      { id: 1, message: "good" },
      { id: 2, message: "good" },
      { id: 3, message: "good" },
    ],
  };
  if (fs.existsSync(dbPath)) db = await fs.readJson(dbPath);

  const saveDB = async () => fs.writeJson(dbPath, db, { spaces: 2 });

  // REGISTER
  app.post("/register", async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email/password required" });

    const exists = db.users.find((u) => u.email === email);
    if (exists) return res.status(409).json({ message: "User already exists" });

    const hashed = await hashPassword(password);
    const id = db.users.length ? Math.max(...db.users.map((u) => u.id)) + 1 : 1;
    const newUser = { id, email, name: name || "", password: hashed };
    db.users.push(newUser);
    await saveDB();

    const tokens = generateTokens({ id, email });
    res.json(tokens);
  });

  // LOGIN
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find((u) => u.email === email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const tokens = generateTokens({ id: user.id, email: user.email });
    res.json(tokens);
  });

  // AUTO ROUTES
  const routeList = [];
  Object.keys(db).forEach((key) => {
    if (["users", "rules"].includes(key)) return;
    const isPrivate = db.rules?.[key] === "private";
    const route = express.Router();

    // GET /key
    route.get("/", async (req, res) => {
      const { from, to } = req.query;
      let data = db[key];
      if (from && to) {
        const fromNum = Number(from);
        const toNum = Number(to);
        data = data.filter((item) => item.id >= fromNum && item.id <= toNum);
      }
      res.json(data);
    });

    // GET /key/:id
    route.get("/:id", async (req, res) => {
      const id = Number(req.params.id);
      const item = db[key].find((i) => i.id === id);
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    });

    // POST /key
    route.post("/", async (req, res) => {
      const newItem = req.body;
      if (!newItem || typeof newItem !== "object") return res.status(400).json({ message: "Invalid body" });

      const id = db[key].length ? Math.max(...db[key].map((i) => i.id)) + 1 : 1;
      const item = { id, ...newItem };
      db[key].push(item);
      await saveDB();
      res.json(item);
    });

    if (isPrivate) {
      app.use(`/${key}`, authMiddleware, route);
    } else {
      app.use(`/${key}`, route);
    }

    // routeList에 추가 (권한 정보 포함)
    routeList.push({ 
      key, 
      count: db[key].length,
      permission: isPrivate ? "private" : "public"
    });
  });

  // Index HTML
  app.get("/", (req, res) => {
    res.render("index", { routeList, port });
  });

  app.listen(port, () => {
    console.log(`✅ db-json-cli Success! ✧*｡٩(ˊᗜˋ*)و✧*｡\n`);
    console.log(`Index:\nhttp://localhost:${port}/\n\n`);

    console.log("Endpoints:");
    routeList.forEach((r) => {
      const badge = r.permission === "private" ? "🔒 PRIVATE" : "🔓 PUBLIC";
      console.log(`${badge} - http://localhost:${port}/${r.key} (${r.count} items)`);
    });
  });
};