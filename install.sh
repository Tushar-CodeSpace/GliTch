#!/usr/bin/env bash
# ==============================================================================
# Glitch — Local DevOps & Autonomous AI SRE Installer Script
# ==============================================================================
set -e

# ANSI Color Codes
GREEN='\033[0;32m'
LIME='\033[38;5;155m'
CYAN='\033[0;36m'
AMBER='\033[0;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="4780"
DB_PATH="${ROOT_DIR}/data/glitch.db"
INSTALL_CLI=false
INSTALL_SYSTEMD=false
INSTALL_APT=false
SKIP_BUILD=false

print_banner() {
  echo -e "${LIME}"
  cat << "EOF"
    __  ___  __         __  
   / /_/ /  / /_ ____  / /_ 
  / __/ /  / __// __ \/ __ \
 / /_/ /__/ /_ / /_/ / / / /
 \__/_/____\__(_)___/_/ /_/ 
      LOCAL DEVOPS TOOLKIT
EOF
  echo -e "${GRAY}  Autonomous AI Infrastructure SRE & Local DevOps Console${NC}"
  echo ""
}

print_help() {
  print_banner
  echo -e "${BOLD}Usage:${NC} ./install.sh [options]"
  echo ""
  echo -e "${BOLD}Options:${NC}"
  echo -e "  ${GREEN}--apt${NC}            Register APT hook in /etc/apt/apt.conf.d (requires sudo)"
  echo -e "  ${GREEN}--cli${NC}            Symlink 'glitch' CLI tool into ~/.local/bin or /usr/local/bin"
  echo -e "  ${GREEN}--systemd${NC}        Install systemd service for autonomous daemon startup"
  echo -e "  ${GREEN}--port <num>${NC}     Set local daemon port (default: 4780)"
  echo -e "  ${GREEN}--db-path <path>${NC} Set custom SQLite database file location"
  echo -e "  ${GREEN}--no-build${NC}       Skip web UI Vite production build"
  echo -e "  ${GREEN}-h, --help${NC}       Display this help documentation"
  echo ""
  exit 0
}

# Parse Command-Line Arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --apt)
      INSTALL_APT=true
      shift
      ;;
    --cli)
      INSTALL_CLI=true
      shift
      ;;
    --systemd)
      INSTALL_SYSTEMD=true
      shift
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    --db-path)
      DB_PATH="$2"
      shift 2
      ;;
    --no-build)
      SKIP_BUILD=true
      shift
      ;;
    -h|--help)
      print_help
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use ./install.sh --help for available options."
      exit 1
      ;;
  esac
done

print_banner

echo -e "${BOLD}▶ [1/5] Verifying System Requirements...${NC}"

# Check Operating System
OS_NAME=$(uname -s)
ARCH_NAME=$(uname -m)
echo -e "  • Operating System: ${CYAN}${OS_NAME} (${ARCH_NAME})${NC}"

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
  echo -e "  ${RED}❌ Error: Node.js is required but not installed.${NC}"
  echo "  Please install Node.js 18+ (Node 20+ or 24+ recommended)."
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
  echo -e "  ${RED}❌ Error: Node.js version 18.0.0+ is required (found v${NODE_VERSION}).${NC}"
  exit 1
fi
echo -e "  • Node.js Version:  ${GREEN}v${NODE_VERSION} (supported)${NC}"

# Check npm
if ! command -v npm >/dev/null 2>&1; then
  echo -e "  ${RED}❌ Error: npm package manager is required.${NC}"
  exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "  • npm Version:      ${GREEN}v${NPM_VERSION}${NC}"

echo -e "\n${BOLD}▶ [2/5] Initializing Embedded SQLite Database...${NC}"
mkdir -p "$(dirname "$DB_PATH")"

export GLITCH_DB_PATH="$DB_PATH"
node -e '
import("./services/daemon/src/db.mjs").then(m => {
  const { db, dbPath } = m.initDatabase(process.env.GLITCH_DB_PATH);
  console.log("  • Database Engine:  SQLite 3 (WAL mode active)");
  console.log("  • Database File:    " + dbPath);
  const userCount = db.prepare("SELECT COUNT(*) as c FROM users").get().c;
  const incCount = db.prepare("SELECT COUNT(*) as c FROM incidents").get().c;
  console.log("  • Seeded Operators: " + userCount + " accounts ready");
  console.log("  • SRE Incidents:    " + incCount + " incidents tracked");
  db.close();
}).catch(err => {
  console.error("  ❌ Database initialization failed:", err);
  process.exit(1);
});
'

echo -e "\n${BOLD}▶ [3/5] Installing Frontend Dependencies...${NC}"
cd "${ROOT_DIR}/packages/web"
if [ -f "package-lock.json" ]; then
  npm ci --silent 2>/dev/null || npm install --silent
else
  npm install --silent
fi
echo -e "  ${GREEN}✔ Web UI dependencies installed successfully.${NC}"

if [ "$SKIP_BUILD" = false ]; then
  echo -e "\n${BOLD}▶ [4/5] Building Web UI Production Bundle...${NC}"
  npm run build
  echo -e "  ${GREEN}✔ Web distribution bundle generated in packages/web/dist.${NC}"
else
  echo -e "\n${BOLD}▶ [4/5] Skipping Web UI Build (--no-build specified)${NC}"
fi
cd "${ROOT_DIR}"

echo -e "\n${BOLD}▶ [5/5] Configuring CLI Tooling & Services...${NC}"
chmod +x "${ROOT_DIR}/bin/glitch"
chmod +x "${ROOT_DIR}/bin/glitch-update"
echo -e "  ${GREEN}✔ CLI wrapper configured at ./bin/glitch${NC}"
echo -e "  ${GREEN}✔ Autonomous updater configured at ./bin/glitch-update${NC}"

# APT Integration (Triggers on 'sudo apt update' & 'sudo apt upgrade')
if [ "$INSTALL_APT" = true ] || [ "$EUID" -eq 0 ]; then
  if [ "$EUID" -ne 0 ]; then
    echo -e "  ${AMBER}⚠ Installing APT hooks requires root. Re-run with sudo:${NC}"
    echo -e "    ${CYAN}sudo ./install.sh --apt${NC}"
  else
    echo -e "\n${BOLD}▶ Configuring System APT Hooks...${NC}"
    mkdir -p /etc/apt/apt.conf.d /usr/local/bin /etc/systemd/system

    # 1. Symlink binaries to /usr/local/bin
    ln -sf "${ROOT_DIR}/bin/glitch" /usr/local/bin/glitch
    ln -sf "${ROOT_DIR}/bin/glitch-update" /usr/local/bin/glitch-update
    echo -e "  ${GREEN}✔ Installed /usr/local/bin/glitch & /usr/local/bin/glitch-update${NC}"

    # 2. Install APT configuration hook
    cp "${ROOT_DIR}/etc/apt/apt.conf.d/99glitch-update" /etc/apt/apt.conf.d/99glitch-update
    chmod 644 /etc/apt/apt.conf.d/99glitch-update
    echo -e "  ${GREEN}✔ Registered APT hook at /etc/apt/apt.conf.d/99glitch-update${NC}"
    echo -e "    ${GRAY}→ 'sudo apt update' will now check for Glitch updates.${NC}"
    echo -e "    ${GRAY}→ 'sudo apt upgrade' will now automatically upgrade Glitch.${NC}"

    # 3. Install System-wide systemd service
    cp "${ROOT_DIR}/etc/systemd/system/glitch-daemon.service" /etc/systemd/system/glitch-daemon.service
    if command -v systemctl >/dev/null 2>&1; then
      systemctl daemon-reload || true
      systemctl enable glitch-daemon.service 2>/dev/null || true
      echo -e "  ${GREEN}✔ Registered systemd service: /etc/systemd/system/glitch-daemon.service${NC}"
    fi
  fi
fi

# Optional CLI Symlink for non-root user
if [ "$INSTALL_CLI" = true ] && [ "$EUID" -ne 0 ]; then
  TARGET_BIN="${HOME}/.local/bin"
  mkdir -p "$TARGET_BIN"
  ln -sf "${ROOT_DIR}/bin/glitch" "${TARGET_BIN}/glitch"
  ln -sf "${ROOT_DIR}/bin/glitch-update" "${TARGET_BIN}/glitch-update"
  echo -e "  ${GREEN}✔ Symlinked 'glitch' & 'glitch-update' to ${TARGET_BIN}${NC}"
  if [[ ":$PATH:" != *":${TARGET_BIN}:"* ]]; then
    echo -e "  ${AMBER}Note: Make sure ${TARGET_BIN} is in your PATH:${NC}"
    echo -e "    export PATH=\"\$HOME/.local/bin:\$PATH\""
  fi
fi

# Optional Systemd User Service Setup (non-root)
if [ "$INSTALL_SYSTEMD" = true ] && [ "$EUID" -ne 0 ]; then
  SYSTEMD_DIR="${HOME}/.config/systemd/user"
  mkdir -p "$SYSTEMD_DIR"
  cat > "${SYSTEMD_DIR}/glitch-daemon.service" << EOF
[Unit]
Description=Glitch Local DevOps Daemon (SQLite)
After=network.target

[Service]
Type=simple
WorkingDirectory=${ROOT_DIR}
ExecStart=$(which node) ${ROOT_DIR}/services/daemon/src/index.mjs
Restart=on-failure
RestartSec=5
Environment=GLITCH_PORT=${PORT}
Environment=GLITCH_DB_PATH=${DB_PATH}

[Install]
WantedBy=default.target
EOF
  echo -e "  ${GREEN}✔ Installed systemd user service to ${SYSTEMD_DIR}/glitch-daemon.service${NC}"
  echo -e "  Enable with: ${CYAN}systemctl --user enable --now glitch-daemon.service${NC}"
fi

echo ""
echo -e "${LIME}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${LIME}║             ⚡ GLITCH INSTALLATION SUCCESSFUL ⚡                 ║${NC}"
echo -e "${LIME}╠══════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${LIME}║${NC}  ${BOLD}Database Engine:${NC} SQLite 3 (WAL Mode Enabled)                     ${LIME}║${NC}"
printf "${LIME}║${NC}  ${BOLD}Database File:${NC}   %-47s ${LIME}║${NC}\n" "${DB_PATH}"
echo -e "${LIME}║${NC}  ${BOLD}Daemon Port:${NC}     http://127.0.0.1:${PORT}                            ${LIME}║${NC}"
echo -e "${LIME}║${NC}  ${BOLD}Web Interface:${NC}   http://127.0.0.1:5173 (dev) / :4173 (preview)   ${LIME}║${NC}"
echo -e "${LIME}║                                                                  ║${NC}"
echo -e "${LIME}║${NC}  ${BOLD}Default Operator Credentials:${NC}                                   ${LIME}║${NC}"
echo -e "${LIME}║${NC}    • ${CYAN}admin${NC}    / ${CYAN}admin${NC}   (System Administrator)                   ${LIME}║${NC}"
echo -e "${LIME}║${NC}    • ${CYAN}operator${NC} / ${CYAN}glitch${NC}  (Local DevOps Operator)                  ${LIME}║${NC}"
echo -e "${LIME}║                                                                  ║${NC}"
echo -e "${LIME}║${NC}  ${BOLD}Quick Start Commands:${NC}                                            ${LIME}║${NC}"
echo -e "${LIME}║${NC}    • Start Daemon:   ${GREEN}./bin/glitch start${NC} (or npm run daemon)       ${LIME}║${NC}"
echo -e "${LIME}║${NC}    • Check Status:   ${GREEN}./bin/glitch status${NC}                          ${LIME}║${NC}"
echo -e "${LIME}║${NC}    • Inspect DB:     ${GREEN}./bin/glitch db${NC}                              ${LIME}║${NC}"
echo -e "${LIME}║${NC}    • Start Web UI:   ${GREEN}./bin/glitch web${NC}                             ${LIME}║${NC}"
echo -e "${LIME}║                                                                  ║${NC}"
echo -e "${LIME}║${NC}  ${BOLD}APT Integration:${NC}                                                 ${LIME}║${NC}"
echo -e "${LIME}║${NC}    Run ${CYAN}sudo ./install.sh --apt${NC} to hook into ${CYAN}sudo apt update${NC}       ${LIME}║${NC}"
echo -e "${LIME}║${NC}    and ${CYAN}sudo apt upgrade${NC} for automated updates!                    ${LIME}║${NC}"
echo -e "${LIME}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
