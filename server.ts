import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import { JSONFilePreset } from "lowdb/node";

const PORT = 3000;

interface AppState {
  users: Array<{ id: string; username: string; password?: string; data: any }>;
}

const defaultData: AppState = { users: [] };

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Initialize lowdb NoSQL database
  const db = await JSONFilePreset<AppState>("db.json", defaultData);

  // Login / Register route
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    let user = db.data.users.find((u) => u.username === username);
    if (!user) {
      user = { id: Date.now().toString(), username, password, data: null };
      db.data.users.push(user);
      await db.write();
    } else {
      if (user.password && user.password !== password) {
        return res.status(401).json({ error: "Invalid password" });
      }
      // If an existing user didn't have a password set, let's set it now for backwards compatibility
      if (!user.password) {
        user.password = password;
        await db.write();
      }
    }
    res.json({ id: user.id, username: user.username, data: user.data });
  });

  // Save game state
  app.post("/api/save", async (req, res) => {
    const { username, data } = req.body;
    if (!username || !data) {
      return res.status(400).json({ error: "Username and data are required" });
    }

    const userIndex = db.data.users.findIndex((u) => u.username === username);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    db.data.users[userIndex].data = data;
    await db.write();
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
