#!/usr/bin/env bash
# ==============================================================================
# Build Debian Package (.deb) for Glitch
# ==============================================================================
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="${1:-$(node "${ROOT_DIR}/scripts/version.mjs" --next)}"
ARCH="all"
PKG_NAME="glitch"
BUILD_DIR="${ROOT_DIR}/build/deb"
OUTPUT_DIR="${ROOT_DIR}/dist"
DEB_FILE="${OUTPUT_DIR}/${PKG_NAME}_${VERSION}_${ARCH}.deb"

echo "⚡ [Glitch] Building Debian Package: ${PKG_NAME}_${VERSION}_${ARCH}.deb (Branch-driven SemVer)..."

# 1. Clean previous builds
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR" "$OUTPUT_DIR"

# 2. Build Web Assets
echo "  • Building web UI production bundle..."
cd "${ROOT_DIR}/packages/web"
npm run build --silent
cd "$ROOT_DIR"

# 3. Create Package Directory Tree
mkdir -p "${BUILD_DIR}/DEBIAN"
mkdir -p "${BUILD_DIR}/opt/glitch"
mkdir -p "${BUILD_DIR}/opt/glitch/data"
mkdir -p "${BUILD_DIR}/usr/bin"
mkdir -p "${BUILD_DIR}/etc/apt/apt.conf.d"
mkdir -p "${BUILD_DIR}/etc/systemd/system"

# 4. Copy Application Files to /opt/glitch
cp -r "${ROOT_DIR}/services" "${BUILD_DIR}/opt/glitch/"
cp -r "${ROOT_DIR}/bin" "${BUILD_DIR}/opt/glitch/"
cp "${ROOT_DIR}/package.json" "${BUILD_DIR}/opt/glitch/"
mkdir -p "${BUILD_DIR}/opt/glitch/packages/web"
cp -r "${ROOT_DIR}/packages/web/dist" "${BUILD_DIR}/opt/glitch/packages/web/"
cp "${ROOT_DIR}/packages/web/package.json" "${BUILD_DIR}/opt/glitch/packages/web/"

# 5. Copy System & APT Configurations
cp "${ROOT_DIR}/etc/apt/apt.conf.d/99glitch-update" "${BUILD_DIR}/etc/apt/apt.conf.d/99glitch-update"
cp "${ROOT_DIR}/etc/systemd/system/glitch-daemon.service" "${BUILD_DIR}/etc/systemd/system/glitch-daemon.service"

# 6. Create Symlinks in /usr/bin
ln -sf "/opt/glitch/bin/glitch" "${BUILD_DIR}/usr/bin/glitch"
ln -sf "/opt/glitch/bin/glitch-update" "${BUILD_DIR}/usr/bin/glitch-update"

# 7. Write DEBIAN/control
cat > "${BUILD_DIR}/DEBIAN/control" << EOF
Package: ${PKG_NAME}
Version: ${VERSION}
Section: admin
Priority: optional
Architecture: ${ARCH}
Depends: nodejs (>= 18.0.0), curl, lsof
Maintainer: Glitch DevOps Team <support@glitch.internal>
Description: Autonomous AI DevOps Engineer & Local Infrastructure Copilot
 Glitch is a local-first DevOps assistant with an embedded SQLite
 database, autonomous incident triage, container monitoring, and
 APT update hooks.
EOF

# 8. Write DEBIAN/postinst
cat > "${BUILD_DIR}/DEBIAN/postinst" << 'EOF'
#!/bin/sh
set -e

# Initialize SQLite database if not present
mkdir -p /opt/glitch/data
if [ ! -f /opt/glitch/data/glitch.db ]; then
  /usr/bin/node -e '
    import("/opt/glitch/services/daemon/src/db.mjs").then(m => {
      const { db } = m.initDatabase("/opt/glitch/data/glitch.db");
      db.close();
    });
  ' 2>/dev/null || true
fi

# Reload systemd and enable daemon
if command -v systemctl >/dev/null 2>&1; then
  systemctl daemon-reload || true
  systemctl enable --now glitch-daemon.service 2>/dev/null || true
fi

echo "✔ Glitch installed successfully."
echo "  Run 'glitch status' or visit http://127.0.0.1:4780"
exit 0
EOF
chmod 755 "${BUILD_DIR}/DEBIAN/postinst"

# 9. Write DEBIAN/prerm
cat > "${BUILD_DIR}/DEBIAN/prerm" << 'EOF'
#!/bin/sh
set -e

if command -v systemctl >/dev/null 2>&1; then
  systemctl stop glitch-daemon.service 2>/dev/null || true
  systemctl disable glitch-daemon.service 2>/dev/null || true
fi
exit 0
EOF
chmod 755 "${BUILD_DIR}/DEBIAN/prerm"

# 10. Build the .deb with dpkg-deb
echo "  • Packaging with dpkg-deb..."
dpkg-deb --build --root-owner-group "$BUILD_DIR" "$DEB_FILE"

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║          ✔ DEBIAN PACKAGE BUILT SUCCESSFULLY (.deb)             ║"
echo "╠══════════════════════════════════════════════════════════════════╣"
echo "║  Package: ${DEB_FILE} "
echo "║                                                                  ║"
echo "║  Install with:                                                   ║"
echo "║    sudo apt install ${DEB_FILE}                                  ║"
echo "║    (or sudo dpkg -i ${DEB_FILE})                                 ║"
echo "║                                                                  ║"
echo "║  Once installed, 'sudo apt update' & 'sudo apt upgrade' will     ║"
echo "║  automatically check and update Glitch via APT hooks!            ║"
echo "╚══════════════════════════════════════════════════════════════════╝"

