import { initDatabase } from "./db.mjs";
import { createServer } from "./server.mjs";

const PORT = parseInt(process.env.GLITCH_PORT || "4780", 10);
const HOST = process.env.GLITCH_HOST || "127.0.0.1";

console.log("⚡ [Glitch] Initializing Local SQLite Database...");
const { db, dbPath } = initDatabase();

console.log(`✔ [Glitch] SQLite database initialized at: ${dbPath}`);

const server = createServer(db, dbPath);

server.listen(PORT, HOST, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                    GLITCH LOCAL DEVOPS DAEMON                    ║
║                        SQLite Local Setup                        ║
╠══════════════════════════════════════════════════════════════════╣
║  • Endpoint:   http://${HOST}:${PORT}                              ║
║  • Database:   ${dbPath.padEnd(46)}║
║  • Engine:     SQLite 3 (WAL mode enabled)                       ║
║  • Status:     ONLINE (Local-First · Zero Cloud Dependency)      ║
║  • Seed Users: admin (pw: admin) · operator (pw: glitch)         ║
╚══════════════════════════════════════════════════════════════════╝
`);
});

// Graceful termination
function shutdown() {
  console.log("\n⚡ [Glitch] Gracefully shutting down SQLite daemon...");
  server.close(() => {
    try {
      db.close();
      console.log("✔ [Glitch] Database closed cleanly.");
    } catch (e) {
      // Ignored
    }
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

