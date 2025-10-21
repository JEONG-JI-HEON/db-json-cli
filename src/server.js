import express from "express";
import fs from "fs-extra";
import bodyParser from "body-parser";
import cors from "cors";
import { hashPassword, comparePassword, generateTokens, authMiddleware } from "./auth.js";

export const startServer = async (dbPath, port = 4000) => {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  // JSON Load
  let db = { users: [], rules: {} };
  if (fs.existsSync(dbPath)) db = await fs.readJson(dbPath);

  const saveDB = async () => fs.writeJson(dbPath, db, { spaces: 2 });

  // 🔹 REGISTER
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

  // 🔹 LOGIN
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find((u) => u.email === email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const tokens = generateTokens({ id: user.id, email: user.email });
    res.json(tokens);
  });

  // 🔹 AUTO ROUTES
  Object.keys(db).forEach((key) => {
    if (["users", "rules"].includes(key)) return;
    const isPrivate = db.rules?.[key] === "private";

    const route = express.Router();

    // ✅ GET /key
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

    // ✅ GET /key/:id
    route.get("/:id", async (req, res) => {
      const id = Number(req.params.id);
      const item = db[key].find((i) => i.id === id);
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    });

    // ✅ POST /key
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
  });

  app.listen(port, () => console.log(`✅ db-json-cli running on http://localhost:${port}`));
};
