import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import cors from "cors";

// Initialize SQLite Database
const db = new Database("dynasty.db");

// Run schema initialization
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS saves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    save_data TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

// Prepared statements
const insertUser = db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
const getUserByUsername = db.prepare("SELECT * FROM users WHERE username = ?");
const upsertSave = db.prepare(`
  INSERT INTO saves (user_id, save_data, updated_at) 
  VALUES (?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(user_id) DO UPDATE SET 
    save_data = excluded.save_data,
    updated_at = CURRENT_TIMESTAMP;
`);
// SQLite doesn't support ON CONFLICT without a UNIQUE constraint actually, 
// let's alter the schema so user_id is UNIQUE in saves. Wait, fixing that...
db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_saves_user_id ON saves(user_id);
`);


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" })); // App state can be large

  // --- API Routes ---
  
  app.post("/api/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    try {
      const hash = bcrypt.hashSync(password, 10);
      insertUser.run(username, hash);
      res.json({ success: true, message: "Registered successfully" });
    } catch (err: any) {
      if (err.message.includes("UNIQUE constraint failed")) {
        res.status(400).json({ error: "Username already exists" });
      } else {
        res.status(500).json({ error: "Server error" });
      }
    }
  });

  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const user = getUserByUsername.get(username) as any;
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Since we don't have a complex auth setup and cookies might be tricky locally, 
    // we'll just have the client use the user_id locally. 
    // For a real app we'd use JWTs, but this works for local container emulation.
    res.json({ success: true, userId: user.id, username: user.username });
  });

  app.post("/api/save", (req, res) => {
    const { userId, saveData } = req.body;
    if (!userId || !saveData) {
      return res.status(400).json({ error: "userId and saveData required" });
    }

    try {
      upsertSave.run(userId, JSON.stringify(saveData));
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save" });
    }
  });

  app.get("/api/load/:userId", (req, res) => {
    const { userId } = req.params;
    
    try {
      const loadStmt = db.prepare("SELECT save_data FROM saves WHERE user_id = ?");
      const result = loadStmt.get(userId) as any;
      if (result) {
        res.json({ success: true, saveData: JSON.parse(result.save_data) });
      } else {
        res.status(404).json({ error: "No save found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to load save" });
    }
  });


  // --- Vite Middleware ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
