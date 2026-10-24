import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import session from "express-session";
import SQLiteStoreFactory from "connect-sqlite3";
import Database from "better-sqlite3";
import argon2 from "argon2";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 3000);
const appOrigin = process.env.APP_ORIGIN;
const dataDir = path.resolve(process.env.DATA_DIR || path.join(__dirname, "data"));
mkdirSync(dataDir, { recursive: true, mode: 0o700 });

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET muss in der Server-Umgebung gesetzt sein.");
}
if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: isProduction ? [] : null
    }
  }
}));
app.use(express.json({ limit: "10kb", strict: true }));

const db = new Database(path.join(dataDir, "users.sqlite"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    username_key TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const SQLiteStore = SQLiteStoreFactory(session);
app.use(session({
  name: "auth.sid",
  store: new SQLiteStore({
    db: "sessions.sqlite",
    dir: dataDir,
    table: "sessions",
    concurrentDB: true
  }),
  secret: process.env.SESSION_SECRET || randomBytes(32).toString("hex"),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 8
  }
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Zu viele Versuche. Bitte warte 15 Minuten." }
});
const registerUser = db.prepare(
  "INSERT INTO users (username, username_key, password_hash) VALUES (?, ?, ?)"
);
const findUser = db.prepare(
  "SELECT id, username, password_hash FROM users WHERE username_key = ?"
);

function validOrigin(req, res, next) {
  const origin = req.get("origin");
  if (!origin) return next();
  const expected = appOrigin || `${req.protocol}://${req.get("host")}`;
  if (origin !== expected) return res.status(403).json({ error: "Ungültige Herkunft der Anfrage." });
  next();
}
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: "Bitte melde dich zuerst an." });
  next();
}
function normalizeUsername(value) {
  return typeof value === "string" ? value.trim() : "";
}

app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/style.css", (_req, res) => res.sendFile(path.join(__dirname, "style.css")));
app.get("/script.js", (_req, res) => res.sendFile(path.join(__dirname, "script.js")));
app.get("/favicon.ico", (_req, res) => res.status(204).end());

app.post("/api/register", authLimiter, validOrigin, async (req, res, next) => {
  try {
    const username = normalizeUsername(req.body?.username);
    const password = req.body?.password;
    if (!/^[a-zA-Z0-9_-]{3,32}$/.test(username)) {
      return res.status(400).json({ error: "Benutzername: 3–32 Zeichen, nur Buchstaben, Zahlen, _ und -." });
    }
    if (typeof password !== "string" || password.length < 6 || password.length > 100) {
      return res.status(400).json({ error: "Das Passwort muss zwischen 6 und 100 Zeichen lang sein." });
    }
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1
    });
    try {
      const result = registerUser.run(username, username.toLowerCase(), passwordHash);
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.userId = Number(result.lastInsertRowid);
        req.session.username = username;
        req.session.save((saveErr) => {
          if (saveErr) return next(saveErr);
          res.status(201).json({ username });
        });
      });
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return res.status(409).json({ error: "Dieser Benutzername ist bereits vergeben." });
      }
      throw error;
    }
  } catch (error) { next(error); }
});

app.post("/api/login", authLimiter, validOrigin, async (req, res, next) => {
  try {
    const username = normalizeUsername(req.body?.username);
    const password = req.body?.password;
    if (!/^[a-zA-Z0-9_-]{3,32}$/.test(username) || typeof password !== "string" || password.length < 6 || password.length > 100) {
      return res.status(400).json({ error: "Benutzername oder Passwort ist falsch." });
    }
    const user = findUser.get(username.toLowerCase());
    const matches = user && await argon2.verify(user.password_hash, password).catch(() => false);
    if (!matches) return res.status(401).json({ error: "Benutzername oder Passwort ist falsch." });
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.save((saveErr) => {
        if (saveErr) return next(saveErr);
        res.json({ username: user.username });
      });
    });
  } catch (error) { next(error); }
});

app.get("/api/me", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Nicht angemeldet." });
  res.json({ username: req.session.username });
});

app.post("/api/logout", validOrigin, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie("auth.sid", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict"
    });
    res.status(204).end();
  });
});

// Only files explicitly listed here can be read. Keep real private files outside public web folders.
const privateFiles = {
  "welcome": { name: "Willkommen.txt", path: path.join(__dirname, "private-files", "welcome.txt") }
};
app.get("/api/files", requireLogin, (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(Object.entries(privateFiles).map(([id, file]) => ({ id, name: file.name })));
});
app.get("/api/files/:id", requireLogin, (req, res, next) => {
  const file = privateFiles[req.params.id];
  if (!file) return res.status(404).json({ error: "Datei nicht gefunden." });
  try {
    const content = readFileSync(file.path, "utf8");
    res.set("Cache-Control", "no-store");
    res.type("text/plain").send(content);
  } catch (error) { next(error); }
});

app.use((_req, res) => res.status(404).json({ error: "Nicht gefunden." }));
app.use((error, _req, res, _next) => {
  console.error("Serverfehler:", error.message);
  if (res.headersSent) return;
  res.status(500).json({ error: "Interner Serverfehler." });
});

app.listen(port, () => {
  console.log(`Anmeldesystem läuft auf Port ${port}.`);
  if (isProduction && !appOrigin) console.warn("APP_ORIGIN ist nicht gesetzt; Herkunft wird anhand der Anfrage geprüft.");
});
