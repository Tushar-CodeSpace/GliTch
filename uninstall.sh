#!/usr/bin/env bash
# ==============================================================================
# Glitch — Uninstaller & System Cleanup Utility
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
AUTO_CONFIRM=false
KEEP_DATA=false

print_banner() {
  echo -e "${LIME}"
  cat << "EOF"
    __  ___  __         __  
   / /_/ /  / /_ ____  / /_ 
  / __/ /  / __// __ \/ __ \
 / /_/ /__/ /_ / /_/ / / / /
 \__/_/____\__(_)___/_/ /_/ 
      UNINSTALLATION UTILITY
EOF
  echo -e "${GRAY}  Autonomous Cleanup for GliTch Daemon, Services & Tooling${NC}"
  echo ""
}

print_help() {
  print_banner
  echo -e "${BOLD}Usage:${NC} ./uninstall.sh [options]"
  echo -e "       curl -fsSL https://.../uninstall.sh | sudo bash"
  echo ""
  echo -e "${BOLD}Options:${NC}"
  echo -e "  ${GREEN}-y, --yes, --force${NC}   Skip confirmation prompt and proceed immediately"
  echo -e "  ${GREEN}--keep-data${NC}          Preserve SQLite database (glitch.db)"
  echo -e "  ${GREEN}-h, --help${NC}           Display this help documentation"
  echo ""
  exit 0
}

# Parse Command-Line Arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -y|--yes|--force|-f)
      AUTO_CONFIRM=true
      shift
      ;;
    --keep-data)
      KEEP_DATA=true
      shift
      ;;
    -h|--help)
      print_help
      ;;
    *)
      shift
      ;;
  esac
done

print_banner

# Prompt for confirmation safely without consuming script stream when piped
if [ "$AUTO_CONFIRM" = false ]; then
  CONFIRMED=false
  PROMPT_MSG="Are you sure you want to completely uninstall GliTch from this system? (y/N): "

  if [ -t 0 ]; then
    read -r -p "$PROMPT_MSG" RESPONSE
  elif [ -e /dev/tty ] && [ -r /dev/tty ]; then
    read -r -p "$PROMPT_MSG" RESPONSE </dev/tty
  else
    # Non-interactive pipe without tty (e.g. piped in automation without -y)
    RESPONSE="y"
  fi

  if [[ "$RESPONSE" =~ ^[Yy]$ ]]; then
    CONFIRMED=true
  fi

  if [ "$CONFIRMED" = false ]; then
    echo -e "${AMBER}Uninstallation aborted by user.${NC}"
    exit 0
  fi
fi

echo -e "${BOLD}▶ [1/5] Stopping GliTch Services & Background Processes...${NC}"

# 1. Stop system-wide systemd service
if command -v systemctl >/dev/null 2>&1; then
  if systemctl is-active --quiet glitch-daemon.service 2>/dev/null; then
    echo -e "  • Stopping systemd service: ${CYAN}glitch-daemon.service${NC}..."
    systemctl stop glitch-daemon.service 2>/dev/null || true
  fi
  if systemctl is-enabled --quiet glitch-daemon.service 2>/dev/null; then
    systemctl disable glitch-daemon.service 2>/dev/null || true
  fi

  # Stop user systemd service if running
  if [ "$EUID" -ne 0 ]; then
    systemctl --user stop glitch-daemon.service 2>/dev/null || true
    systemctl --user disable glitch-daemon.service 2>/dev/null || true
  fi
fi

# 2. Terminate any orphaned process on port 4780
PORT_PID=$(lsof -ti :4780 2>/dev/null || true)
if [ -n "$PORT_PID" ]; then
  echo -e "  • Terminating process on port 4780 (PID $PORT_PID)..."
  kill -9 "$PORT_PID" 2>/dev/null || true
fi
echo -e "  ${GREEN}✔ Background processes stopped.${NC}"

echo -e "\n${BOLD}▶ [2/5] Removing System Service Configurations...${NC}"
RELOAD_SYSTEMD=false

if [ -f "/etc/systemd/system/glitch-daemon.service" ]; then
  rm -f "/etc/systemd/system/glitch-daemon.service"
  RELOAD_SYSTEMD=true
  echo -e "  ${GREEN}✔ Removed /etc/systemd/system/glitch-daemon.service${NC}"
fi

USER_SVC="${HOME}/.config/systemd/user/glitch-daemon.service"
if [ -f "$USER_SVC" ]; then
  rm -f "$USER_SVC"
  echo -e "  ${GREEN}✔ Removed $USER_SVC${NC}"
fi

if [ "$RELOAD_SYSTEMD" = true ] && command -v systemctl >/dev/null 2>&1; then
  systemctl daemon-reload 2>/dev/null || true
fi

echo -e "\n${BOLD}▶ [3/5] Removing APT Update Hooks & Configurations...${NC}"
if [ -f "/etc/apt/apt.conf.d/99glitch-update" ]; then
  rm -f "/etc/apt/apt.conf.d/99glitch-update"
  echo -e "  ${GREEN}✔ Removed /etc/apt/apt.conf.d/99glitch-update${NC}"
else
  echo -e "  • No APT hooks found."
fi

echo -e "\n${BOLD}▶ [4/5] Removing CLI Tools & Symlinks...${NC}"
CLI_PATHS=(
  "/usr/local/bin/glitch"
  "/usr/local/bin/glitch-update"
  "${HOME}/.local/bin/glitch"
  "${HOME}/.local/bin/glitch-update"
)

for bin_path in "${CLI_PATHS[@]}"; do
  if [ -L "$bin_path" ] || [ -f "$bin_path" ]; then
    rm -f "$bin_path"
    echo -e "  ${GREEN}✔ Removed $bin_path${NC}"
  fi
done

echo -e "\n${BOLD}▶ [5/5] Cleaning Workspace & Installation Directories...${NC}"

# Remove /opt/glitch if it was installed there
if [ -d "/opt/glitch" ]; then
  if [ "$KEEP_DATA" = true ] && [ -f "/opt/glitch/data/glitch.db" ]; then
    echo -e "  • Preserving database at /opt/glitch/data/glitch.db (--keep-data)"
    find /opt/glitch -mindepth 1 ! -regex '^/opt/glitch/data\(/.*\)?' -delete 2>/dev/null || true
  else
    rm -rf "/opt/glitch"
    echo -e "  ${GREEN}✔ Removed /opt/glitch installation directory${NC}"
  fi
fi

# Remove user directory if present
USER_INSTALL="${HOME}/.local/share/glitch"
if [ -d "$USER_INSTALL" ]; then
  if [ "$KEEP_DATA" = true ] && [ -f "${USER_INSTALL}/data/glitch.db" ]; then
    echo -e "  • Preserving database at ${USER_INSTALL}/data/glitch.db"
    find "$USER_INSTALL" -mindepth 1 ! -regex "^${USER_INSTALL}/data\(/.*\)?'" -delete 2>/dev/null || true
  else
    rm -rf "$USER_INSTALL"
    echo -e "  ${GREEN}✔ Removed $USER_INSTALL${NC}"
  fi
fi

# If inside repo workspace, clean local build artifacts and optionally database
if [ -f "${ROOT_DIR}/package.json" ]; then
  rm -rf "${ROOT_DIR}/packages/web/dist"
  rm -rf "${ROOT_DIR}/dist"
  rm -f "${ROOT_DIR}/data/glitch.pid"
  rm -f "${ROOT_DIR}/data/daemon.log"
  if [ "$KEEP_DATA" = false ]; then
    rm -rf "${ROOT_DIR}/data/glitch.db" "${ROOT_DIR}/data/glitch.db-wal" "${ROOT_DIR}/data/glitch.db-shm"
    echo -e "  ${GREEN}✔ Cleaned workspace build artifacts & local SQLite database${NC}"
  else
    echo -e "  • Preserved local database at ${ROOT_DIR}/data/glitch.db"
  fi
fi

# Clean temp/log files
rm -f /tmp/glitch-update-pending /var/log/glitch-update.log /tmp/glitch-daemon.pid

echo ""
echo -e "${LIME}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${LIME}║             ✔ GLITCH CLEANUP & UNINSTALL COMPLETE                ║${NC}"
echo -e "${LIME}╠══════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${LIME}║${NC}  All GliTch services, APT hooks, CLI symlinks, and binaries      ${LIME}║${NC}"
echo -e "${LIME}║${NC}  have been cleanly uninstalled from this system.                  ${LIME}║${NC}"
echo -e "${LIME}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
