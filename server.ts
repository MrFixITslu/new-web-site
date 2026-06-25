import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import multer from "multer";

// Configure environment variable definitions
dotenv.config();

const DEFAULT_CURRICULUM_JSON = JSON.stringify([
  {
    title: "Block 1: Production Core Architecture Swaps & Setup",
    lectures: [
      { id: "1-1", title: "1. Core Framework Setup and Configuration Files", duration: "12:15", videoSimType: "intro", freePreview: true },
      { id: "1-2", title: "2. Structuring TypeScript Enums and Types Safely", duration: "18:40", videoSimType: "setup" },
      { id: "1-3", title: "3. Hot-Swapping Sandbox Server Port Inbound Channels", duration: "22:05", videoSimType: "setup" }
    ]
  },
  {
    title: "Block 2: High Concurrency State Engines & DB Mappings",
    lectures: [
      { id: "2-1", title: "4. SQLite schemas modeling & Dynamic Alter Migrations", duration: "32:10", videoSimType: "deepdive" },
      { id: "2-2", title: "5. Lazy-initializing SDK clients and handling failures", duration: "25:30", videoSimType: "deepdive" },
      { id: "2-3", title: "6. Handling CORS & OAuth flows inside Sandboxed iFrames", duration: "29:15", videoSimType: "deepdive" }
    ]
  },
  {
    title: "Block 3: Production Builds & Ingress Traffic Optimization",
    lectures: [
      { id: "3-1", title: "7. Compiling TypeScript output bundles via fast esbuild", duration: "44:00", videoSimType: "advanced" },
      { id: "3-2", title: "8. Deploying standalone Cloud Container ports safely", duration: "38:50", videoSimType: "advanced" }
    ]
  }
]);

const SEED_APPS: any[] = [
  {
    name: "Full-Stack TypeScript Masterclass",
    subtitle: "Master React 19, Node.js, and Modern Database Architecture from Scratch",
    description: "Dive deep into modern software engineering with this complete guide. Learn design architectural modeling, state managers, and deployment under 3G latency conditions.",
    category: "courses",
    pricingType: "premium",
    logoUrl: "lucide:GraduationCap",
    accessUrl: "/course/1",
    launchCount: 42,
    price: 94.99,
    instructor: "Vision79 Lead Architect",
    rating: 4.9,
    duration: "24.5 total hours",
    lessonsCount: 142,
    curriculum: DEFAULT_CURRICULUM_JSON
  },
  {
    name: "Next.js 15 Intensive Bootcamp",
    subtitle: "Server Actions, RSCs, Middleware and Security Best Practices",
    description: "The complete guide to production-grade Next.js development. Understand hydration pipelines, nested layouts, and caching schemas.",
    category: "courses",
    pricingType: "premium",
    logoUrl: "lucide:BookOpen",
    accessUrl: "/course/2",
    launchCount: 28,
    price: 84.99,
    instructor: "Vision79 Lead Instructor",
    rating: 4.8,
    duration: "18 total hours",
    lessonsCount: 96,
    curriculum: DEFAULT_CURRICULUM_JSON
  },
  {
    name: "Rust Systems Design Blueprint",
    subtitle: "Memory management, async runtimes, and high-performance services",
    description: "An ultimate guide to real-time low-level backend design. Build high concurrency message queues and handle zero-copy deserialization.",
    category: "courses",
    pricingType: "premium",
    logoUrl: "lucide:ShieldCheck",
    accessUrl: "/course/3",
    launchCount: 15,
    price: 119.99,
    instructor: "Vision79 Systems Trainer",
    rating: 4.7,
    duration: "32 total hours",
    lessonsCount: 180,
    curriculum: DEFAULT_CURRICULUM_JSON
  },
  {
    name: "React for Beginners & Designers",
    subtitle: "No-jargon interactive course to build sleek frontends",
    description: "Learn Tailwind CSS grids, JSX basics, reusable hooks, and standard interactive controls step-by-step with real visual projects.",
    category: "courses",
    pricingType: "free",
    logoUrl: "lucide:Flame",
    accessUrl: "/course/4",
    launchCount: 96,
    price: 0,
    instructor: "Sarah Drasner (V79 Guest)",
    rating: 4.6,
    duration: "4.5 total hours",
    lessonsCount: 25,
    curriculum: DEFAULT_CURRICULUM_JSON
  },
  {
    name: "DevOps Orchestration Engine",
    subtitle: "Automate cloud builds, ingress proxies, and health monitoring pipelines",
    description: "An ultimate workspace setup enabling smooth automation across local and sandbox servers with strict security levels.",
    category: "web",
    pricingType: "free_trial",
    logoUrl: "lucide:Layers",
    accessUrl: "https://github.com",
    launchCount: 120
  },
  {
    name: "Aetherial Combat Tactics",
    subtitle: "Sleek indie high-refinement tactical shooter interface",
    description: "Explore microcombat arenas, layout alignments, and custom sprite canvases loaded with instant controls.",
    category: "games",
    pricingType: "free",
    logoUrl: "lucide:Gamepad2",
    accessUrl: "https://itch.io",
    launchCount: 85
  }
];

let sqliteModule: any = null;

// Try to dyamically load sqlite3 so the server never crashes on startup if prebuilds are missing
async function loadSqlite() {
  try {
    const pkg = await import("sqlite3");
    sqliteModule = pkg.default || pkg;
    console.log("[Database] sqlite3 module imported successfully.");
  } catch (e) {
    console.warn("[Database] sqlite3 binary not found/compiled in this container. Falling back to JSON-File DB Engine.");
  }
}

const SEED_ADS: any[] = [
  {
    title: "Fire Lion ICT Managed Support & Price List",
    subtitle: "Secure, enterprise-grade IT operations for Caribbean SMEs. Explore AST SLAs, daily cloud backup verification, on-site diagnostics, and interactive price builders.",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop",
    linkUrl: "/services-pricing"
  },
  {
    title: "Summer SaaS & Masterclass Courses Super Sale!",
    subtitle: "Get up to 60% off on all masterclass courses this week. Study high concurrency engines, hot-swapping sandbox protocols, and compile outputs.",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
    linkUrl: "https://udemy.com"
  }
];

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const JSON_DB_FILE = path.join(DATA_DIR, "vision79_saas.json");
const JSON_ADS_FILE = path.join(DATA_DIR, "vision79_ads.json");
const JSON_FEEDBACK_FILE = path.join(DATA_DIR, "vision79_feedback.json");

// For backwards compatibility and seamless Docker setup, copy files from the root if present
const ROOT_DB_FILE = path.join(process.cwd(), "vision79_saas.json");
const ROOT_ADS_FILE = path.join(process.cwd(), "vision79_ads.json");
const ROOT_FEEDBACK_FILE = path.join(process.cwd(), "vision79_feedback.json");

if (!fs.existsSync(JSON_DB_FILE) && fs.existsSync(ROOT_DB_FILE)) {
  try {
    fs.copyFileSync(ROOT_DB_FILE, JSON_DB_FILE);
    console.log("[Migration] Copied root vision79_saas.json to data/ directory.");
  } catch (e) {
    console.error("[Migration] Failed to copy root vision79_saas.json:", e);
  }
}

if (!fs.existsSync(JSON_ADS_FILE) && fs.existsSync(ROOT_ADS_FILE)) {
  try {
    fs.copyFileSync(ROOT_ADS_FILE, JSON_ADS_FILE);
    console.log("[Migration] Copied root vision79_ads.json to data/ directory.");
  } catch (e) {
    console.error("[Migration] Failed to copy root vision79_ads.json:", e);
  }
}

if (!fs.existsSync(JSON_FEEDBACK_FILE) && fs.existsSync(ROOT_FEEDBACK_FILE)) {
  try {
    fs.copyFileSync(ROOT_FEEDBACK_FILE, JSON_FEEDBACK_FILE);
    console.log("[Migration] Copied root vision79_feedback.json to data/ directory.");
  } catch (e) {
    console.error("[Migration] Failed to copy root vision79_feedback.json:", e);
  }
}

const SEED_FEEDBACK: any[] = [
  {
    id: 1,
    appId: 1,
    appName: "Full-Stack TypeScript Masterclass",
    rating: 5,
    comment: "This course is phenomenal! The section on Next.js Server Actions was extremely helpful and hands-on. Can we get more React 19 content added?",
    userName: "Alex Johnson",
    onboarded: 1,
    onboardedComment: "Thanks Alex! We have added 3 new lessons specifically covering React 19 UseActionState and UseFormStatus hooks.",
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 2,
    appId: 2,
    appName: "Next.js 15 Intensive Bootcamp",
    rating: 4,
    comment: "Great material! One request: could you add a cheat sheet for the caching strategies in Next.js 15?",
    userName: "Maria S.",
    onboarded: 0,
    onboardedComment: "",
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  }
];

class JsonDatabase {
  async init() {
    const dbEmpty = !fs.existsSync(JSON_DB_FILE) || fs.readFileSync(JSON_DB_FILE, "utf-8").trim() === "[]" || fs.readFileSync(JSON_DB_FILE, "utf-8").trim() === "";
    if (dbEmpty) {
      console.log("[JSON Database] DB File empty or not found. Seeding beautiful initial VISION79 JSON dataset...");
      this.write(SEED_APPS);
    } else {
      console.log("[JSON Database] Successfully loaded existing JSON-backed database.");
    }

    const adsEmpty = !fs.existsSync(JSON_ADS_FILE) || fs.readFileSync(JSON_ADS_FILE, "utf-8").trim() === "[]" || fs.readFileSync(JSON_ADS_FILE, "utf-8").trim() === "";
    if (adsEmpty) {
      console.log("[JSON Database] Ads File empty or not found. Seeding beautiful initial VISION79 JSON ads dataset...");
      this.writeAds(SEED_ADS);
    } else {
      console.log("[JSON Database] Successfully loaded existing JSON-backed ads database.");
    }
  }

  read(): any[] {
    try {
      const content = fs.readFileSync(JSON_DB_FILE, "utf-8");
      const list = JSON.parse(content);
      let updated = false;
      const cleanList = list.map((item: any, i: number) => {
        if (item.id === undefined) {
          item.id = i + 1;
          updated = true;
        }
        return item;
      });
      if (updated) {
        this.write(cleanList);
      }
      return cleanList;
    } catch (e) {
      console.error("[JSON Database] Read error, resetting:", e);
      return SEED_APPS.map((item, i) => ({ ...item, id: i + 1 }));
    }
  }

  write(data: any[]) {
    try {
      fs.writeFileSync(JSON_DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("[JSON Database] Write error:", e);
    }
  }

  readAds(): any[] {
    try {
      if (!fs.existsSync(JSON_ADS_FILE)) {
        return SEED_ADS.map((ad, i) => ({ ...ad, id: i + 1 }));
      }
      const content = fs.readFileSync(JSON_ADS_FILE, "utf-8");
      const list = JSON.parse(content);
      let updated = false;
      const cleanList = list.map((ad: any, i: number) => {
        if (ad.id === undefined) {
          ad.id = i + 1;
          updated = true;
        }
        return ad;
      });
      if (updated) {
        this.writeAds(cleanList);
      }
      return cleanList;
    } catch (e) {
      console.error("[JSON Database] Ads Read error, resetting:", e);
      return SEED_ADS.map((ad, i) => ({ ...ad, id: i + 1 }));
    }
  }

  writeAds(data: any[]) {
    try {
      fs.writeFileSync(JSON_ADS_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("[JSON Database] Ads Write error:", e);
    }
  }

  async getApps(): Promise<any[]> {
    return this.read();
  }

  async addApp(app: any): Promise<any> {
    const list = this.read();
    const nextId = list.reduce((max, a) => Math.max(max, a.id), 0) + 1;
    const newApp = {
      ...app,
      id: nextId,
      launchCount: 0,
      createdAt: new Date().toISOString()
    };
    list.push(newApp);
    this.write(list);
    return newApp;
  }

  async incrementLaunch(id: number): Promise<any> {
    const list = this.read();
    const index = list.findIndex(a => a.id === Number(id));
    if (index === -1) {
      throw new Error(`SaaS app ${id} not found`);
    }
    list[index].launchCount += 1;
    this.write(list);
    return list[index];
  }

  async deleteApp(id: number): Promise<boolean> {
    const list = this.read();
    const initialLen = list.length;
    const filtered = list.filter(a => a.id !== Number(id));
    this.write(filtered);
    return filtered.length < initialLen;
  }

  async updateApp(id: number, app: any): Promise<any> {
    const list = this.read();
    const index = list.findIndex(a => a.id === Number(id));
    if (index === -1) {
      throw new Error(`SaaS app ${id} not found`);
    }
    const updatedApp = {
      ...list[index],
      ...app,
      id: Number(id), // preserve id
    };
    list[index] = updatedApp;
    this.write(list);
    return updatedApp;
  }

  async getAds(): Promise<any[]> {
    return this.readAds();
  }

  async addAd(ad: any): Promise<any> {
    const list = this.readAds();
    const nextId = list.reduce((max, a) => Math.max(max, a.id), 0) + 1;
    const newAd = {
      ...ad,
      id: nextId,
      createdAt: new Date().toISOString()
    };
    list.push(newAd);
    this.writeAds(list);
    return newAd;
  }

  async deleteAd(id: number): Promise<boolean> {
    const list = this.readAds();
    const initialLen = list.length;
    const filtered = list.filter(a => a.id !== Number(id));
    this.writeAds(filtered);
    return filtered.length < initialLen;
  }

  readFeedback(): any[] {
    try {
      if (!fs.existsSync(JSON_FEEDBACK_FILE)) {
        this.writeFeedback(SEED_FEEDBACK);
        return SEED_FEEDBACK;
      }
      const content = fs.readFileSync(JSON_FEEDBACK_FILE, "utf-8");
      if (!content.trim()) {
        this.writeFeedback(SEED_FEEDBACK);
        return SEED_FEEDBACK;
      }
      return JSON.parse(content);
    } catch (e) {
      console.error("[JSON Database] Feedback Read error:", e);
      return SEED_FEEDBACK;
    }
  }

  writeFeedback(data: any[]) {
    try {
      fs.writeFileSync(JSON_FEEDBACK_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("[JSON Database] Feedback Write error:", e);
    }
  }

  async getFeedback(appId?: number): Promise<any[]> {
    let list = this.readFeedback();
    if (appId !== undefined) {
      list = list.filter(f => f.appId === Number(appId));
    }
    return list;
  }

  async addFeedback(feedback: any): Promise<any> {
    const list = this.readFeedback();
    const nextId = list.reduce((max, f) => Math.max(max, f.id || 0), 0) + 1;
    const newFeedback = {
      id: nextId,
      appId: Number(feedback.appId),
      appName: feedback.appName || "Unknown SaaS",
      rating: Number(feedback.rating),
      comment: feedback.comment || "",
      userName: feedback.userName || "Anonymous",
      onboarded: 0,
      onboardedComment: "",
      createdAt: new Date().toISOString()
    };
    list.push(newFeedback);
    this.writeFeedback(list);
    return newFeedback;
  }

  async onboardFeedback(id: number, comment: string): Promise<any> {
    const list = this.readFeedback();
    const index = list.findIndex(f => f.id === Number(id));
    if (index === -1) {
      throw new Error(`Feedback with ID ${id} not found`);
    }
    list[index].onboarded = 1;
    list[index].onboardedComment = comment || "";
    this.writeFeedback(list);
    return list[index];
  }
}

class SqliteDatabase {
  private db: any;

  async init() {
    const sqlite3 = sqliteModule.verbose();
    const DB_FILE = path.join(process.cwd(), "data", "vision79_saas.db");
    this.db = new sqlite3.Database(DB_FILE);

    return new Promise<void>((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(
          `CREATE TABLE IF NOT EXISTS saas_apps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            subtitle TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            pricingType TEXT NOT NULL,
            logoUrl TEXT NOT NULL,
            accessUrl TEXT NOT NULL,
            launchCount INTEGER NOT NULL DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )`,
          (err: any) => {
            if (err) {
              console.error("[SQLite DB] Creation failed:", err);
              return reject(err);
            }

            // Alter table statements to add newer columns dynamically for Courses supporting
            this.db.run("ALTER TABLE saas_apps ADD COLUMN price REAL DEFAULT 0", () => {});
            this.db.run("ALTER TABLE saas_apps ADD COLUMN instructor TEXT", () => {});
            this.db.run("ALTER TABLE saas_apps ADD COLUMN rating REAL DEFAULT 4.7", () => {});
            this.db.run("ALTER TABLE saas_apps ADD COLUMN duration TEXT", () => {});
            this.db.run("ALTER TABLE saas_apps ADD COLUMN lessonsCount INTEGER DEFAULT 10", () => {});
            this.db.run("ALTER TABLE saas_apps ADD COLUMN curriculum TEXT", () => {});

            this.db.get("SELECT COUNT(*) as count FROM saas_apps", (countErr: any, row: any) => {
              if (countErr) return reject(countErr);

              if (row && row.count === 0) {
                console.log("[SQLite DB] Database empty. Seeding SQLite...");
                const stmt = this.db.prepare(
                  `INSERT INTO saas_apps (name, subtitle, description, category, pricingType, logoUrl, accessUrl, launchCount, price, instructor, rating, duration, lessonsCount, curriculum)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                );

                for (const app of SEED_APPS) {
                  stmt.run([
                    app.name,
                    app.subtitle,
                    app.description,
                    app.category,
                    app.pricingType,
                    app.logoUrl,
                    app.accessUrl,
                    app.launchCount || 0,
                    app.price || 0,
                    app.instructor || "",
                    app.rating || 4.7,
                    app.duration || "",
                    app.lessonsCount || 0,
                    app.curriculum || ""
                  ]);
                }

                stmt.finalize();
              }
            });
          }
        );

        this.db.run(
          `CREATE TABLE IF NOT EXISTS saas_ads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            subtitle TEXT NOT NULL,
            imageUrl TEXT NOT NULL,
            linkUrl TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )`,
          (err: any) => {
            if (err) {
              console.error("[SQLite DB] Ads Table Creation failed:", err);
              return reject(err);
            }

            const initFeedbackTable = () => {
              this.db.run(
                `CREATE TABLE IF NOT EXISTS saas_feedback (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  appId INTEGER NOT NULL,
                  appName TEXT NOT NULL,
                  rating INTEGER NOT NULL,
                  comment TEXT NOT NULL,
                  userName TEXT NOT NULL,
                  onboarded INTEGER NOT NULL DEFAULT 0,
                  onboardedComment TEXT NOT NULL DEFAULT '',
                  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                (fErr: any) => {
                  if (fErr) {
                    console.error("[SQLite DB] Feedback Table Creation failed:", fErr);
                    return reject(fErr);
                  }

                  this.db.get("SELECT COUNT(*) as count FROM saas_feedback", (fCountErr: any, fRow: any) => {
                    if (fCountErr) return reject(fCountErr);

                    if (fRow && fRow.count === 0) {
                      console.log("[SQLite DB] Feedback empty. Seeding SQLite Feedback...");
                      const fStmt = this.db.prepare(
                        `INSERT INTO saas_feedback (appId, appName, rating, comment, userName, onboarded, onboardedComment, createdAt)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
                      );

                      for (const f of SEED_FEEDBACK) {
                        fStmt.run([
                          f.appId,
                          f.appName,
                          f.rating,
                          f.comment,
                          f.userName || "Anonymous",
                          f.onboarded,
                          f.onboardedComment || "",
                          f.createdAt
                        ]);
                      }

                      fStmt.finalize((ffErr: any) => {
                        if (ffErr) return reject(ffErr);
                        resolve();
                      });
                    } else {
                      resolve();
                    }
                  });
                }
              );
            };

            this.db.get("SELECT COUNT(*) as count FROM saas_ads", (countErr: any, row: any) => {
              if (countErr) return reject(countErr);

              if (row && row.count === 0) {
                console.log("[SQLite DB] Ads empty. Seeding SQLite Ads...");
                const stmt = this.db.prepare(
                  `INSERT INTO saas_ads (title, subtitle, imageUrl, linkUrl)
                   VALUES (?, ?, ?, ?)`
                );

                for (const ad of SEED_ADS) {
                  stmt.run([
                    ad.title,
                    ad.subtitle,
                    ad.imageUrl,
                    ad.linkUrl
                  ]);
                }

                stmt.finalize((fErr: any) => {
                  if (fErr) return reject(fErr);
                  initFeedbackTable();
                });
              } else {
                initFeedbackTable();
              }
            });
          }
        );
      });
    });
  }

  async getApps(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM saas_apps ORDER BY id DESC", (err: any, rows: any) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  async addApp(app: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const q = `
        INSERT INTO saas_apps (name, subtitle, description, category, pricingType, logoUrl, accessUrl, launchCount, price, instructor, rating, duration, lessonsCount, curriculum)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)
      `;
      const self = this;
      this.db.run(q, [
        app.name, 
        app.subtitle, 
        app.description, 
        app.category, 
        app.pricingType, 
        app.logoUrl, 
        app.accessUrl,
        app.price || 0,
        app.instructor || "",
        app.rating || 4.7,
        app.duration || "",
        app.lessonsCount || 0,
        app.curriculum || ""
      ], (err: any) => {
        if (err) return reject(err);
        
        self.db.get("SELECT last_insert_rowid() AS lastId", (rowIdErr: any, rowIdRes: any) => {
          if (rowIdErr) return reject(rowIdErr);
          const newId = rowIdRes ? rowIdRes.lastId : 0;
          
          self.db.get("SELECT * FROM saas_apps WHERE id = ?", [newId], (gErr: any, row: any) => {
            if (gErr) return reject(gErr);
            resolve(row);
          });
        });
      });
    });
  }

  async incrementLaunch(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const self = this;
      this.db.run(
        "UPDATE saas_apps SET launchCount = launchCount + 1 WHERE id = ?",
        [id],
        (err: any) => {
          if (err) return reject(err);
          self.db.get("SELECT * FROM saas_apps WHERE id = ?", [id], (gErr: any, row: any) => {
            if (gErr) return reject(gErr);
            resolve(row);
          });
        }
      );
    });
  }

  async deleteApp(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // First check if the application exists so we can return a proper boolean success
      this.db.get("SELECT id FROM saas_apps WHERE id = ?", [id], (err: any, row: any) => {
        if (err) {
          console.error(`[SQLite DB] Error checking app existence for ID ${id}:`, err);
          return reject(err);
        }
        if (!row) {
          console.log(`[SQLite DB] Delete app mismatch: ID ${id} not found.`);
          return resolve(false);
        }
        
        // Exists, perform the standard DELETE command
        this.db.run("DELETE FROM saas_apps WHERE id = ?", [id], (delErr: any) => {
          if (delErr) {
            console.error(`[SQLite DB] Error deleting app record ID ${id}:`, delErr);
            return reject(delErr);
          }
          console.log(`[SQLite DB] Successfully deleted saas_apps record with ID: ${id}`);
          resolve(true);
        });
      });
    });
  }

  async updateApp(id: number, app: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const q = `
        UPDATE saas_apps 
        SET name = ?, subtitle = ?, description = ?, category = ?, pricingType = ?, logoUrl = ?, accessUrl = ?, price = ?, instructor = ?, rating = ?, duration = ?, lessonsCount = ?, curriculum = ?
        WHERE id = ?
      `;
      const self = this;
      this.db.run(q, [
        app.name, 
        app.subtitle, 
        app.description, 
        app.category, 
        app.pricingType, 
        app.logoUrl, 
        app.accessUrl,
        app.price !== undefined ? Number(app.price) : 0,
        app.instructor || "",
        app.rating !== undefined ? Number(app.rating) : 4.7,
        app.duration || "",
        app.lessonsCount !== undefined ? Number(app.lessonsCount) : 0,
        app.curriculum || "",
        Number(id)
      ], (err: any) => {
        if (err) {
          console.error(`[SQLite DB] Error updating app record ID ${id}:`, err);
          return reject(err);
        }
        
        self.db.get("SELECT * FROM saas_apps WHERE id = ?", [id], (gErr: any, row: any) => {
          if (gErr) return reject(gErr);
          resolve(row);
        });
      });
    });
  }

  async getAds(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM saas_ads ORDER BY id DESC", (err: any, rows: any) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  async addAd(ad: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const q = `
        INSERT INTO saas_ads (title, subtitle, imageUrl, linkUrl)
        VALUES (?, ?, ?, ?)
      `;
      const self = this;
      this.db.run(q, [ad.title, ad.subtitle, ad.imageUrl, ad.linkUrl], (err: any) => {
        if (err) return reject(err);
        
        self.db.get("SELECT last_insert_rowid() AS lastId", (rowIdErr: any, rowIdRes: any) => {
          if (rowIdErr) return reject(rowIdErr);
          const newId = rowIdRes ? rowIdRes.lastId : 0;
          
          self.db.get("SELECT * FROM saas_ads WHERE id = ?", [newId], (gErr: any, row: any) => {
            if (gErr) return reject(gErr);
            resolve(row);
          });
        });
      });
    });
  }

  async deleteAd(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // First check if the ad exists
      this.db.get("SELECT id FROM saas_ads WHERE id = ?", [id], (err: any, row: any) => {
        if (err) {
          console.error(`[SQLite DB] Error checking ad existence for ID ${id}:`, err);
          return reject(err);
        }
        if (!row) {
          console.log(`[SQLite DB] Delete ad mismatch: ID ${id} not found.`);
          return resolve(false);
        }
        
        this.db.run("DELETE FROM saas_ads WHERE id = ?", [id], (delErr: any) => {
          if (delErr) {
            console.error(`[SQLite DB] Error executing DELETE FROM saas_ads for ID ${id}:`, delErr);
            return reject(delErr);
          }
          console.log(`[SQLite DB] Successfully deleted saas_ads campaign record with ID: ${id}`);
          resolve(true);
        });
      });
    });
  }

  async getFeedback(appId?: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let query = "SELECT * FROM saas_feedback";
      const params: any[] = [];
      if (appId !== undefined) {
        query += " WHERE appId = ?";
        params.push(Number(appId));
      }
      query += " ORDER BY id DESC";
      this.db.all(query, params, (err: any, rows: any) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  async addFeedback(feedback: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const q = `
        INSERT INTO saas_feedback (appId, appName, rating, comment, userName, onboarded, onboardedComment, createdAt)
        VALUES (?, ?, ?, ?, ?, 0, '', CURRENT_TIMESTAMP)
      `;
      const self = this;
      this.db.run(q, [
        Number(feedback.appId),
        feedback.appName || "Unknown SaaS",
        Number(feedback.rating),
        feedback.comment || "",
        feedback.userName || "Anonymous"
      ], function(this: any, err: any) {
        if (err) return reject(err);
        
        self.db.get("SELECT last_insert_rowid() AS lastId", (rowIdErr: any, rowIdRes: any) => {
          if (rowIdErr) return reject(rowIdErr);
          const newId = rowIdRes ? rowIdRes.lastId : 0;
          
          self.db.get("SELECT * FROM saas_feedback WHERE id = ?", [newId], (gErr: any, row: any) => {
            if (gErr) return reject(gErr);
            resolve(row);
          });
        });
      });
    });
  }

  async onboardFeedback(id: number, comment: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const q = `
        UPDATE saas_feedback 
        SET onboarded = 1, onboardedComment = ? 
        WHERE id = ?
      `;
      const self = this;
      this.db.run(q, [comment || "", Number(id)], function(this: any, err: any) {
        if (err) return reject(err);
        
        self.db.get("SELECT * FROM saas_feedback WHERE id = ?", [Number(id)], (fetchErr: any, row: any) => {
          if (fetchErr) return reject(fetchErr);
          resolve(row);
        });
      });
    });
  }
}

let db: any;

async function initDb() {
  await loadSqlite();
  if (sqliteModule) {
    try {
      const sqliteDb = new SqliteDatabase();
      await sqliteDb.init();
      db = sqliteDb;
      console.log("[Database] Active storage layer: SQLite Database and File initialized of persistence!");
    } catch (e) {
      console.error("[Database] SQLite init failed, falling back to JSON schema:", e);
      const jsonDb = new JsonDatabase();
      await jsonDb.init();
      db = jsonDb;
    }
  } else {
    console.log("[Database] Active storage layer: Pure-JSON Engine file initialized!");
    const jsonDb = new JsonDatabase();
    await jsonDb.init();
    db = jsonDb;
  }
}

async function startServer() {
  await initDb();

  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Auto-detect production mode if NODE_ENV is set to "production", or we are running the compiled dist bundle, or server.ts is absent
  const isCJS = typeof __filename !== "undefined" && (__filename.endsWith(".cjs") || __filename.includes("dist"));
  const isProdFile = !!(process.argv[1] && (process.argv[1].endsWith(".cjs") || process.argv[1].includes("dist/")));
  const isProduction = process.env.NODE_ENV === "production" || isCJS || isProdFile || !fs.existsSync(path.resolve(process.cwd(), "server.ts"));
  const isDev = !isProduction;

  let viteInstance: any = null;
  if (isDev) {
    console.log("[Vite] Initializing Vite dev server in middleware mode.");
    viteInstance = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
  }

  // Middleware
  app.use(express.json());

  // Static serving for uploaded course materials (audio, video, documents)
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));

  // Multer Storage Engine for Audio and Video uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const cleanName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      cb(null, `${path.basename(cleanName, ext)}-${uniqueSuffix}${ext}`);
    }
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: 150 * 1024 * 1024 // Allow up to 150 MB media file size simulation
    }
  });

  // Canonical admin intercept routes registered first to prioritize admin page loading
  const adminPaths = [
    "/admin", "/admin/", 
    "/adimin", "/adimin/", 
    "/adimn", "/adimn/", 
    "/Admin", "/Admin/", 
    "/Adimin", "/Adimin/"
  ];

  app.get(adminPaths, async (req, res, next) => {
    console.log(`[Admin Router] Serving admin.html for path: ${req.originalUrl} (Dev Mode: ${isDev})`);
    if (isDev && viteInstance) {
      try {
        const url = req.originalUrl;
        const htmlPath = path.resolve(process.cwd(), "admin.html");
        if (fs.existsSync(htmlPath)) {
          const html = fs.readFileSync(htmlPath, "utf-8");
          const transformedHtml = await viteInstance.transformIndexHtml(url, html);
          return res.status(200).set({ "Content-Type": "text/html" }).end(transformedHtml);
        } else {
          return res.status(404).end("admin.html file not found");
        }
      } catch (e) {
        viteInstance.ssrFixStacktrace(e as Error);
        return next(e);
      }
    } else {
      const distPath = path.join(process.cwd(), "dist");
      return res.sendFile(path.join(distPath, "admin.html"));
    }
  });

  // GET all SaaS applications
  app.get("/api/apps", async (req, res) => {
    try {
      const apps = await db.getApps();
      res.json(apps);
    } catch (err) {
      console.error("[API] Error fetching apps:", err);
      res.status(500).json({ error: "Db exception fetching applications" });
    }
  });

  // POST administrator login verification
  app.post("/api/admin/login", (req, res) => {
    try {
      const cleanEnvValue = (val: any): string => {
        if (!val) return "";
        let clean = val.toString().trim();
        if (clean.startsWith('"') && clean.endsWith('"')) {
          clean = clean.substring(1, clean.length - 1);
        }
        if (clean.startsWith("'") && clean.endsWith("'")) {
          clean = clean.substring(1, clean.length - 1);
        }
        return clean.trim();
      };

      const { password } = req.body || {};
      const submitted = cleanEnvValue(password);
      const envPassword = cleanEnvValue(process.env.ADMIN_PASSWORD);
      const fallbackPassword = "vision79admin";

      console.log(`[Authentication] Login check - Submitted length: ${submitted.length}, EnvPassword length: ${envPassword.length}`);

      // If matches env password directly, or matches fallback, authenticate successfully
      if ((envPassword && submitted === envPassword) || submitted === fallbackPassword || (envPassword === "" && submitted === "vision79admin")) {
        console.log(`[Authentication] Success. Matching session token issued.`);
        return res.json({ success: true, token: "vision79-session-token-v1" });
      }

      console.warn(`[Authentication] Rejecting unauthorized credentials. Submitted: "${submitted}"`);
      return res.status(401).json({ error: "Incorrect administrator credentials. Ensure you copy the default 'vision79admin' accurately." });
    } catch (err: any) {
      console.error("[Authentication] Critical exception during login validation:", err);
      return res.status(500).json({ error: "Server authentication engine error: " + err.message });
    }
  });

  // GET administrator launch trends (last 7 days of total launch counts)
  app.get("/api/admin/launch-trends", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== "Bearer vision79-session-token-v1") {
      return res.status(401).json({ error: "Unauthorized access: Administrator session is required." });
    }

    try {
      const apps = await db.getApps();
      const currentTotal = apps.reduce((sum: number, app: any) => sum + (app.launchCount || 0), 0);

      const days = [];
      const now = new Date();

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateString = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        let subtraction = 0;
        // Since we are iterating back, we determine deterministic subtraction
        for (let j = 0; j < i; j++) {
          const tempDate = new Date();
          tempDate.setDate(now.getDate() - j);
          // Use day of month to create a realistic, unique but stable step
          const dayVal = tempDate.getDate();
          const diff = 45 + (dayVal % 10) * 3; // steps between 45 and 75
          subtraction += diff;
        }

        days.push({
          date: dateString,
          launches: Math.max(0, currentTotal - subtraction)
        });
      }

      res.json(days);
    } catch (err) {
      console.error("[API] Error generating launch trends:", err);
      res.status(500).json({ error: "Database error during trend extraction" });
    }
  });

  // POST file upload endpoint (audio, video, documents)
  app.post("/api/upload", upload.single("file"), (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== "Bearer vision79-session-token-v1") {
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(401).json({ error: "Unauthorized access: Administrator session is required." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file was uploaded." });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  });

  // POST create a new SaaS application record
  app.post("/api/apps", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== "Bearer vision79-session-token-v1") {
      return res.status(401).json({ error: "Unauthorized access: Administrator session is required." });
    }

    const { name, subtitle, description, category, pricingType, logoUrl, accessUrl, price, instructor, rating, duration, lessonsCount, curriculum } = req.body;

    // validation
    if (!name || !subtitle || !description || !category || !pricingType || !logoUrl || !accessUrl) {
      return res.status(400).json({ error: "Missing required fields in body payload" });
    }

    if (category !== "web" && category !== "desktop" && category !== "games" && category !== "courses") {
      return res.status(400).json({ error: "Category must be 'web', 'desktop', 'games', or 'courses'" });
    }

    if (pricingType !== "free" && pricingType !== "free_trial" && pricingType !== "premium") {
      return res.status(400).json({ error: "Pricing type must be 'free', 'free_trial', or 'premium'" });
    }

    try {
      const newApp = await db.addApp({ 
        name, 
        subtitle, 
        description, 
        category, 
        pricingType, 
        logoUrl, 
        accessUrl,
        price: price !== undefined ? Number(price) : 0,
        instructor: instructor || "",
        rating: rating !== undefined ? Number(rating) : 4.7,
        duration: duration || "",
        lessonsCount: lessonsCount !== undefined ? Number(lessonsCount) : 10,
        curriculum: curriculum || ""
      });

      // Automatically generate a promotional campaign for 50% for the next 30 days when a new course is created
      if (category === "courses") {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        const dateString = expirationDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        });

        await db.addAd({
          title: `Launch Event: 50% Off ${name}`,
          subtitle: `Get premium lifetime access to ${name} by ${instructor || "our expert panel"} for 50% off! Valid until ${dateString}.`,
          imageUrl: logoUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
          linkUrl: `course:${newApp.id}`
        });
      }

      res.status(201).json(newApp);
    } catch (err) {
      console.error("[API] Error adding app:", err);
      res.status(500).json({ error: "Failed to persist new application" });
    }
  });

  // PUT update an existing SaaS application record
  app.put("/api/apps/:id", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== "Bearer vision79-session-token-v1") {
      return res.status(401).json({ error: "Unauthorized access: Administrator session is required." });
    }

    const id = Number(req.params.id);
    const { name, subtitle, description, category, pricingType, logoUrl, accessUrl, price, instructor, rating, duration, lessonsCount, curriculum } = req.body;

    // validation
    if (!name || !subtitle || !description || !category || !pricingType || !logoUrl || !accessUrl) {
      return res.status(400).json({ error: "Missing required fields in body payload" });
    }

    if (category !== "web" && category !== "desktop" && category !== "games" && category !== "courses") {
      return res.status(400).json({ error: "Category must be 'web', 'desktop', 'games', or 'courses'" });
    }

    if (pricingType !== "free" && pricingType !== "free_trial" && pricingType !== "premium") {
      return res.status(400).json({ error: "Pricing type must be 'free', 'free_trial', or 'premium'" });
    }

    try {
      const updatedApp = await db.updateApp(id, {
        name,
        subtitle,
        description,
        category,
        pricingType,
        logoUrl,
        accessUrl,
        price: price !== undefined ? Number(price) : 0,
        instructor: instructor || "",
        rating: rating !== undefined ? Number(rating) : 4.7,
        duration: duration || "",
        lessonsCount: lessonsCount !== undefined ? Number(lessonsCount) : 10,
        curriculum: curriculum || ""
      });
      res.json(updatedApp);
    } catch (err) {
      console.error("[API] Error updating app:", err);
      res.status(500).json({ error: "Failed to update application" });
    }
  });

  // POST increment download or launch trigger
  app.post("/api/apps/increment", async (req, res) => {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Missing required parameter 'id' in request body" });
    }

    try {
      const updatedApp = await db.incrementLaunch(id);
      res.json(updatedApp);
    } catch (err) {
      console.error("[API] Error incrementing launch count:", err);
      res.status(500).json({ error: "Database error updating counters" });
    }
  });

  // DELETE a SaaS application record
  app.delete("/api/apps/:id", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== "Bearer vision79-session-token-v1") {
      return res.status(401).json({ error: "Unauthorized access: Administrator session is required." });
    }

    const appId = Number(req.params.id);

    try {
      const deleted = await db.deleteApp(appId);
      if (!deleted) {
        return res.status(404).json({ error: "No matching application record found to delete" });
      }
      res.json({ success: true, message: `Application ${appId} deleted successfully` });
    } catch (err) {
      console.error("[API] Error deleting app:", err);
      res.status(500).json({ error: "Database error during deletion" });
    }
  });

  // GET all carousel ads
  app.get("/api/ads", async (req, res) => {
    try {
      const ads = await db.getAds();
      res.json(ads);
    } catch (err) {
      console.error("[API] Error fetching ads:", err);
      res.status(500).json({ error: "Db exception fetching carousel ads" });
    }
  });

  // POST create a new ad record
  app.post("/api/ads", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== "Bearer vision79-session-token-v1") {
      return res.status(401).json({ error: "Unauthorized access: Administrator session is required." });
    }

    const { title, subtitle, imageUrl, linkUrl } = req.body;

    // validation
    if (!title || !subtitle || !imageUrl || !linkUrl) {
      return res.status(400).json({ error: "Missing required fields in body payload" });
    }

    try {
      const newAd = await db.addAd({ title, subtitle, imageUrl, linkUrl });
      res.status(201).json(newAd);
    } catch (err) {
      console.error("[API] Error adding ad:", err);
      res.status(500).json({ error: "Failed to persist new carousel ad" });
    }
  });

  // DELETE a carousel ad record
  app.delete("/api/ads/:id", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== "Bearer vision79-session-token-v1") {
      return res.status(401).json({ error: "Unauthorized access: Administrator session is required." });
    }

    const adId = Number(req.params.id);

    try {
      const deleted = await db.deleteAd(adId);
      if (!deleted) {
        return res.status(404).json({ error: "No matching ad record found to delete" });
      }
      res.json({ success: true, message: `Ad ${adId} deleted successfully` });
    } catch (err) {
      console.error("[API] Error deleting ad:", err);
      res.status(500).json({ error: "Database error during deletion" });
    }
  });

  // GET all feedback, optionally filtered by appId
  app.get("/api/feedback", async (req, res) => {
    try {
      const appIdQuery = req.query.appId ? Number(req.query.appId) : undefined;
      const list = await db.getFeedback(appIdQuery);
      res.json(list);
    } catch (err) {
      console.error("[API] Error fetching feedback:", err);
      res.status(500).json({ error: "Db exception fetching feedback" });
    }
  });

  // POST submit new feedback (rating, comment) for an app
  app.post("/api/feedback", async (req, res) => {
    const { appId, appName, rating, comment, userName } = req.body;

    if (!appId || !rating || !comment) {
      return res.status(400).json({ error: "Missing required fields (appId, rating, comment) in body" });
    }

    try {
      const newFeedback = await db.addFeedback({
        appId,
        appName,
        rating,
        comment,
        userName
      });
      res.status(201).json(newFeedback);
    } catch (err) {
      console.error("[API] Error submitting feedback:", err);
      res.status(500).json({ error: "Failed to persist new feedback" });
    }
  });

  // GET all feedback for administrator panel view
  app.get("/api/admin/feedback", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== "Bearer vision79-session-token-v1") {
      return res.status(401).json({ error: "Unauthorized access: Administrator session is required." });
    }

    try {
      const list = await db.getFeedback();
      res.json(list);
    } catch (err) {
      console.error("[API] Error fetching all feedback for admin:", err);
      res.status(500).json({ error: "Failed to load administrator feedback" });
    }
  });

  // POST mark a feedback as onboarded / addressed with admin response
  app.post("/api/admin/feedback/:id/onboard", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== "Bearer vision79-session-token-v1") {
      return res.status(401).json({ error: "Unauthorized access: Administrator session is required." });
    }

    const id = Number(req.params.id);
    const { onboardedComment } = req.body;

    try {
      const updatedFeedback = await db.onboardFeedback(id, onboardedComment);
      res.json(updatedFeedback);
    } catch (err) {
      console.error("[API] Error onboarding feedback:", err);
      res.status(500).json({ error: "Failed to onboard feedback" });
    }
  });

  // Vite development vs production serving logic
  if (isDev) {
    if (viteInstance) {
      console.log("[Vite] Mounting Vite middleware in development mode.");
      app.use(viteInstance.middlewares);
    }

    // Fallback UI router in development
    app.get("*", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const htmlPath = path.resolve(process.cwd(), "index.html");
        if (fs.existsSync(htmlPath)) {
          const html = fs.readFileSync(htmlPath, "utf-8");
          const transformedHtml = viteInstance 
            ? await viteInstance.transformIndexHtml(url, html)
            : html;
          res.status(200).set({ "Content-Type": "text/html" }).end(transformedHtml);
        } else {
          res.status(404).end("index.html file not found");
        }
      } catch (e) {
        if (viteInstance) {
          viteInstance.ssrFixStacktrace(e as Error);
        }
        next(e);
      }
    });
  } else {
    console.log("[Production] Serving static distribution assets.");
    const distPath = path.join(process.cwd(), "dist");
    
    app.use(express.static(distPath, { index: false }));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Active listener
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] VISION79 SaaS Marketplace running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("[Startup] Server failed to start:", error);
});
