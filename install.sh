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

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || pwd)"
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

# Auto-detect remote pipe execution (e.g. curl -fsSL ... | bash)
if [ ! -f "${ROOT_DIR}/services/daemon/main.go" ]; then
  if ! command -v git >/dev/null 2>&1; then
    echo -e "  ${RED}❌ Error: git is required for 1-line curl install.${NC}"
    echo "  Please install git or clone the repository manually."
    exit 1
  fi

  if [ "$EUID" -eq 0 ]; then
    INSTALL_DIR="${GLITCH_DIR:-/opt/glitch}"
    INSTALL_CLI=true
    INSTALL_APT=true
  else
    INSTALL_DIR="${GLITCH_DIR:-${HOME}/.local/share/glitch}"
    INSTALL_CLI=true
  fi
  echo -e "${BOLD}▶ Remote installation detected. Preparing GliTch workspace...${NC}"
  echo -e "  • Target directory: ${CYAN}${INSTALL_DIR}${NC}"
  if [ -d "${INSTALL_DIR}/.git" ]; then
    echo -e "  • Updating existing repository..."
    git -C "${INSTALL_DIR}" pull --quiet || true
  else
    if [ -d "${INSTALL_DIR}" ]; then
      rm -rf "${INSTALL_DIR}"
    fi
    echo -e "  • Cloning repository from GitHub..."
    mkdir -p "$(dirname "$INSTALL_DIR")"
    git clone --depth 1 https://github.com/Tushar-CodeSpace/GliTch.git "${INSTALL_DIR}"
  fi
  ROOT_DIR="${INSTALL_DIR}"
  DB_PATH="${ROOT_DIR}/data/glitch.db"
fi

# Always anchor working directory to ROOT_DIR
cd "${ROOT_DIR}"

echo -e "${BOLD}▶ [1/5] Verifying System Requirements...${NC}"

# Check Operating System
OS_NAME=$(uname -s)
ARCH_NAME=$(uname -m)
echo -e "  • Operating System: ${CYAN}${OS_NAME} (${ARCH_NAME})${NC}"

install_golang() {
  echo -e "  ${AMBER}⚡ Auto-installing Go (Golang)...${NC}"
  if [ "$EUID" -eq 0 ] || command -v sudo >/dev/null 2>&1; then
    SUDO_CMD=""
    [ "$EUID" -ne 0 ] && SUDO_CMD="sudo"
    if command -v apt-get >/dev/null 2>&1; then
      $SUDO_CMD apt-get update -y && $SUDO_CMD apt-get install -y golang-go
      return
    elif command -v dnf >/dev/null 2>&1; then
      $SUDO_CMD dnf install -y golang
      return
    elif command -v pacman >/dev/null 2>&1; then
      $SUDO_CMD pacman -Sy --noconfirm go
      return
    elif [ "$(uname -s)" = "Darwin" ] && command -v brew >/dev/null 2>&1; then
      brew install go
      return
    fi
  fi

  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64) ARCH_GO="amd64" ;;
    aarch64|arm64) ARCH_GO="arm64" ;;
    *) ARCH_GO="amd64" ;;
  esac
  PLATFORM=$(uname -s | tr '[:upper:]' '[:lower:]')
  GO_TAR="go1.22.8.${PLATFORM}-${ARCH_GO}.tar.gz"
  TMP_DIR=$(mktemp -d)
  if curl -fsSL "https://go.dev/dl/${GO_TAR}" -o "$TMP_DIR/$GO_TAR"; then
    mkdir -p "$HOME/.local"
    tar -C "$HOME/.local" -xzf "$TMP_DIR/$GO_TAR"
    rm -rf "$TMP_DIR"
    export PATH="$HOME/.local/go/bin:$PATH"
  fi
}

install_nodejs() {
  echo -e "  ${AMBER}⚡ Auto-installing Node.js 22 (LTS) & npm...${NC}"

  # 1. If NVM is already installed in the environment
  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    echo -e "  • Found existing NVM. Installing Node.js 22..."
    # shellcheck source=/dev/null
    . "$HOME/.nvm/nvm.sh"
    nvm install 22
    nvm use 22
    return
  fi

  # 2. If running as root or sudo is available, use official system package manager
  if [ "$EUID" -eq 0 ] || command -v sudo >/dev/null 2>&1; then
    SUDO_CMD=""
    if [ "$EUID" -ne 0 ]; then
      SUDO_CMD="sudo"
    fi

    # Debian / Ubuntu / Mint / Pop!_OS
    if command -v apt-get >/dev/null 2>&1; then
      echo -e "  • Adding NodeSource repository for Node.js 22.x..."
      curl -fsSL https://deb.nodesource.com/setup_22.x | $SUDO_CMD -E bash -
      echo -e "  • Installing nodejs via apt-get..."
      $SUDO_CMD apt-get install -y nodejs
      return
    # Fedora / RHEL / Rocky / AlmaLinux
    elif command -v dnf >/dev/null 2>&1; then
      echo -e "  • Adding NodeSource repository for Node.js 22.x..."
      curl -fsSL https://rpm.nodesource.com/setup_22.x | $SUDO_CMD bash -
      echo -e "  • Installing nodejs via dnf..."
      $SUDO_CMD dnf install -y nodejs
      return
    elif command -v yum >/dev/null 2>&1; then
      curl -fsSL https://rpm.nodesource.com/setup_22.x | $SUDO_CMD bash -
      $SUDO_CMD yum install -y nodejs
      return
    # Arch Linux
    elif command -v pacman >/dev/null 2>&1; then
      echo -e "  • Installing nodejs and npm via pacman..."
      $SUDO_CMD pacman -Sy --noconfirm nodejs npm
      return
    # macOS Homebrew
    elif [ "$(uname -s)" = "Darwin" ] && command -v brew >/dev/null 2>&1; then
      echo -e "  • Installing node@22 via Homebrew..."
      brew install node@22
      brew link --overwrite --force node@22 || true
      export PATH="/opt/homebrew/opt/node@22/bin:/usr/local/opt/node@22/bin:$PATH"
      return
    fi
  fi

  # 3. User-level portable binary fallback (works without root / sudo privileges)
  echo -e "  • Downloading official Node.js 22 standalone binary..."
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64) ARCH_NODE="x64" ;;
    aarch64|arm64) ARCH_NODE="arm64" ;;
    armv7l) ARCH_NODE="armv7l" ;;
    *) ARCH_NODE="x64" ;;
  esac

  PLATFORM=$(uname -s | tr '[:upper:]' '[:lower:]')
  NODE_URL="https://nodejs.org/dist/latest-v22.x"
  TARBALL_NAME=$(curl -fsSL "$NODE_URL/SHASUMS256.txt" | grep "node-v22.*-${PLATFORM}-${ARCH_NODE}.tar.gz" | head -n1 | awk '{print $2}')

  if [ -n "$TARBALL_NAME" ]; then
    TMP_DIR=$(mktemp -d)
    INSTALL_TARGET="${HOME}/.local"
    mkdir -p "$INSTALL_TARGET"
    curl -fsSL "$NODE_URL/$TARBALL_NAME" -o "$TMP_DIR/$TARBALL_NAME"
    tar -xzf "$TMP_DIR/$TARBALL_NAME" -C "$TMP_DIR"
    EXTRACTED_DIR=$(find "$TMP_DIR" -maxdepth 1 -type d -name "node-v22*")
    cp -r "$EXTRACTED_DIR"/* "$INSTALL_TARGET/"
    rm -rf "$TMP_DIR"
    export PATH="${INSTALL_TARGET}/bin:$PATH"
    echo -e "  ${GREEN}✔ Node.js installed to ${INSTALL_TARGET}/bin${NC}"
    return
  fi

  # 4. Fallback to NVM automated setup
  echo -e "  • Installing NVM..."
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  # shellcheck source=/dev/null
  [ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"
  nvm install 22
  nvm use 22
}

install_npm() {
  echo -e "  ${AMBER}⚡ Auto-installing npm...${NC}"
  if [ "$EUID" -eq 0 ] || command -v sudo >/dev/null 2>&1; then
    SUDO_CMD=""
    [ "$EUID" -ne 0 ] && SUDO_CMD="sudo"
    if command -v apt-get >/dev/null 2>&1; then
      $SUDO_CMD apt-get install -y npm
      return
    elif command -v dnf >/dev/null 2>&1; then
      $SUDO_CMD dnf install -y npm
      return
    elif command -v pacman >/dev/null 2>&1; then
      $SUDO_CMD pacman -Sy --noconfirm npm
      return
    fi
  fi
  if command -v corepack >/dev/null 2>&1; then
    corepack enable || true
  fi
}

# Check Node.js
NODE_MAJOR=0
if command -v node >/dev/null 2>&1; then
  NODE_VERSION=$(node -v | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1)
fi

if [ -z "$NODE_MAJOR" ] || [ "$NODE_MAJOR" -lt 22 ]; then
  if ! command -v node >/dev/null 2>&1; then
    echo -e "  ${AMBER}⚠ Node.js is not installed.${NC}"
  else
    echo -e "  ${AMBER}⚠ Node.js v${NODE_VERSION} is installed, but Node.js 22+ (LTS) is required.${NC}"
  fi
  install_nodejs

  # Re-check after installation
  if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node -v | sed 's/v//')
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1)
  fi

  if [ -z "$NODE_MAJOR" ] || [ "$NODE_MAJOR" -lt 22 ]; then
    echo -e "  ${RED}❌ Error: Failed to auto-install Node.js 22+. Please install Node.js 22+ manually.${NC}"
    exit 1
  fi
fi
echo -e "  • Node.js Version:  ${GREEN}v${NODE_VERSION} (supported)${NC}"

# Check Go compiler
if ! command -v go >/dev/null 2>&1; then
  echo -e "  ${AMBER}⚠ Go compiler is not installed.${NC}"
  install_golang

  if ! command -v go >/dev/null 2>&1; then
    echo -e "  ${RED}❌ Error: Failed to auto-install Go. Please install Go (1.20+) manually.${NC}"
    exit 1
  fi
fi
GO_VERSION=$(go version | awk '{print $3}')
echo -e "  • Go Version:       ${GREEN}${GO_VERSION} (supported)${NC}"

# Check npm
if ! command -v npm >/dev/null 2>&1; then
  echo -e "  ${AMBER}⚠ npm is not installed.${NC}"
  install_npm

  if ! command -v npm >/dev/null 2>&1; then
    echo -e "  ${RED}❌ Error: Failed to auto-install npm. Please install npm manually.${NC}"
    exit 1
  fi
fi
NPM_VERSION=$(npm -v)
echo -e "  • npm Version:      ${GREEN}v${NPM_VERSION}${NC}"

echo -e "\n${BOLD}▶ [2/5] Compiling Go Backend Daemon & Initializing SQLite...${NC}"
mkdir -p "${ROOT_DIR}/bin" "$(dirname "$DB_PATH")"

echo -e "  • Compiling native Go daemon binary..."
go build -o "${ROOT_DIR}/bin/glitch-daemon" ./services/daemon
echo -e "  ${GREEN}✔ Native Go daemon binary compiled at ./bin/glitch-daemon${NC}"

export GLITCH_DB_PATH="$DB_PATH"
"${ROOT_DIR}/bin/glitch-daemon" db

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
    ln -sf "${ROOT_DIR}/bin/glitch-daemon" /usr/local/bin/glitch-daemon
    echo -e "  ${GREEN}✔ Installed /usr/local/bin/glitch, glitch-update & glitch-daemon${NC}"

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
      systemctl restart glitch-daemon.service 2>/dev/null || systemctl start glitch-daemon.service 2>/dev/null || true
      echo -e "  ${GREEN}✔ Started systemd service: glitch-daemon.service${NC}"
    fi
  fi
fi

# Optional CLI Symlink for non-root user
if [ "$INSTALL_CLI" = true ] && [ "$EUID" -ne 0 ]; then
  TARGET_BIN="${HOME}/.local/bin"
  mkdir -p "$TARGET_BIN"
  ln -sf "${ROOT_DIR}/bin/glitch" "${TARGET_BIN}/glitch"
  ln -sf "${ROOT_DIR}/bin/glitch-update" "${TARGET_BIN}/glitch-update"
  ln -sf "${ROOT_DIR}/bin/glitch-daemon" "${TARGET_BIN}/glitch-daemon"
  echo -e "  ${GREEN}✔ Symlinked 'glitch', 'glitch-update' & 'glitch-daemon' to ${TARGET_BIN}${NC}"
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
Description=Glitch Local DevOps Daemon (Go & SQLite)
After=network.target

[Service]
Type=simple
WorkingDirectory=${ROOT_DIR}
ExecStart=${ROOT_DIR}/bin/glitch-daemon -port ${PORT} -db ${DB_PATH} -static ${ROOT_DIR}/packages/web/dist
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

# Auto-start daemon if not already running
if ! curl -s "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; then
  echo -e "\n${BOLD}▶ Launching Glitch Background Daemon...${NC}"
  "${ROOT_DIR}/bin/glitch" start || true
fi

echo ""
echo -e "${LIME}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${LIME}║             ⚡ GLITCH INSTALLATION SUCCESSFUL ⚡                 ║${NC}"
echo -e "${LIME}╠══════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${LIME}║${NC}  ${BOLD}Database Engine:${NC} SQLite 3 (WAL Mode Enabled)                     ${LIME}║${NC}"
printf "${LIME}║${NC}  ${BOLD}Database File:${NC}   %-47s ${LIME}║${NC}\n" "${DB_PATH}"
echo -e "${LIME}║${NC}  ${BOLD}Web Interface:${NC}   ${CYAN}http://127.0.0.1:${PORT}${NC} (All-in-One Console)          ${LIME}║${NC}"
echo -e "${LIME}║${NC}  ${BOLD}Daemon API:${NC}      http://127.0.0.1:${PORT}/api/health                   ${LIME}║${NC}"
echo -e "${LIME}║${NC}  ${BOLD}Dev Server:${NC}      http://127.0.0.1:5173 (glitch web / npm run web)  ${LIME}║${NC}"
echo -e "${LIME}║                                                                  ║${NC}"
echo -e "${LIME}║${NC}  ${BOLD}Default Operator Credentials:${NC}                                   ${LIME}║${NC}"
echo -e "${LIME}║${NC}    • ${CYAN}admin${NC}    / ${CYAN}admin${NC}   (System Administrator)                   ${LIME}║${NC}"
echo -e "${LIME}║${NC}    • ${CYAN}operator${NC} / ${CYAN}glitch${NC}  (Local DevOps Operator)                  ${LIME}║${NC}"
echo -e "${LIME}║                                                                  ║${NC}"
echo -e "${LIME}║${NC}  ${BOLD}CLI Commands:${NC}                                                    ${LIME}║${NC}"
echo -e "${LIME}║${NC}    • Open Web UI:    ${GREEN}glitch web${NC}                                   ${LIME}║${NC}"
echo -e "${LIME}║${NC}    • Check Status:   ${GREEN}glitch status${NC}                                ${LIME}║${NC}"
echo -e "${LIME}║${NC}    • Inspect DB:     ${GREEN}glitch db${NC}                                    ${LIME}║${NC}"
echo -e "${LIME}║${NC}    • Restart:        ${GREEN}glitch restart${NC}                               ${LIME}║${NC}"
echo -e "${LIME}║                                                                  ║${NC}"
echo -e "${LIME}║${NC}  ${BOLD}APT Integration:${NC}                                                 ${LIME}║${NC}"
echo -e "${LIME}║${NC}    'sudo apt update' checks for updates automatically!            ${LIME}║${NC}"
echo -e "${LIME}║${NC}    'sudo apt upgrade' upgrades GliTch seamlessly.                 ${LIME}║${NC}"
echo -e "${LIME}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
