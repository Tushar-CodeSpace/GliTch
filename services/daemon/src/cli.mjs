import { initDatabase } from "./db.mjs";
import fs from "node:fs";

const command = process.argv[2] || "status";

switch (command) {
  case "db": {
    const { db, dbPath } = initDatabase();
    const stats = fs.existsSync(dbPath) ? fs.statSync(dbPath) : null;
    console.log("⚡ GLITCH SQLITE DATABASE INSPECTION");
    console.log(`• Path:      ${dbPath}`);
    console.log(`• Size:      ${stats ? (stats.size / 1024).toFixed(1) + " KB" : "0 KB"}`);
    
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all();
    console.log("\nTable Record Counts:");
    for (const { name } of tables) {
      try {
        const count = db.prepare(`SELECT COUNT(*) as c FROM "${name}"`).get().c;
        console.log(`  • ${name.padEnd(18)} : ${count}`);
      } catch {
        console.log(`  • ${name.padEnd(18)} : error`);
      }
    }
    db.close();
    break;
  }

  case "triage": {
    const { db } = initDatabase();
    const incidents = db.prepare("SELECT * FROM incidents ORDER BY created_at DESC").all();
    console.log("⚡ ACTIVE INCIDENT TRIAGE:\n");
    for (const inc of incidents) {
      const color = inc.severity === "critical" ? "\x1b[31m[CRITICAL]\x1b[0m" : "\x1b[33m[WARNING]\x1b[0m";
      console.log(`${color} ${inc.id}: ${inc.title} (${inc.status})`);
      console.log(`   Service: ${inc.service}`);
      console.log(`   Command: ${inc.command || "N/A"}`);
      console.log("");
    }
    db.close();
    break;
  }

  default:
    console.log("Unknown cli command:", command);
}

