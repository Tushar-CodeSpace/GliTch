# Installation & APT Integration Guide 🛠️

This guide covers installing GliTch locally, configuring automatic update checks during `sudo apt update`, building standalone Debian `.deb` packages, and uninstallation.

---

## 1. Single-Line Quick Install ⚡

To install GliTch directly with a single command without cloning manually:

### User Install (Installs into `~/.glitch` and symlinks CLI to `~/.local/bin`)
```bash
curl -fsSL https://raw.githubusercontent.com/Tushar-CodeSpace/GliTch/main/install.sh | bash
```

### System-Wide Install (Installs into `/opt/glitch`, registers APT hooks and `/usr/local/bin`)
```bash
curl -fsSL https://raw.githubusercontent.com/Tushar-CodeSpace/GliTch/main/install.sh | sudo bash
```

*(Alternatively with wget: `wget -qO- https://raw.githubusercontent.com/Tushar-CodeSpace/GliTch/main/install.sh | bash`)*

---

## 2. Prerequisites & Auto-Installation

* **Operating System**: Linux (Ubuntu 20.04+, Debian 11+, Arch, Fedora, RHEL) or macOS (Darwin 12+).
* **Go**: **Go 1.22+** (for compiling the native background daemon).
* **Node.js & npm**: For web frontend compilation.

> ⚡ **Automatic Resolution**: If Go, Node.js, or npm is not installed, `./install.sh` will automatically detect your package manager (APT, DNF, Pacman, Homebrew, or binary fallback) and install them for you.

---

## 3. Local Clone Installation

Run the universal installer script from the root of the repository:

```bash
# Standard local setup (installs web UI & daemon dependencies, initializes SQLite)
./install.sh
```

### Advanced Installer Options

| Flag | Purpose | Example |
| :--- | :--- | :--- |
| `--cli` | Symlinks `bin/glitch` and `bin/glitch-update` into `/usr/local/bin` | `sudo ./install.sh --cli` |
| `--apt` | Installs Debian APT hooks into `/etc/apt/apt.conf.d/99glitch-update` | `sudo ./install.sh --apt` |
| `--systemd` | Registers and enables `glitch-daemon.service` under systemd | `sudo ./install.sh --systemd` |
| `--all` | Installs dependencies, CLI symlinks, APT hooks, and systemd service | `sudo ./install.sh --all` |
| `--help` | Displays command options and usage manual | `./install.sh --help` |

---

## 4. Automatic Updates with APT (`sudo apt update`)

GliTch provides deep integration with Debian & Ubuntu package managers:

```
[User runs 'sudo apt update']
                │
                ▼
APT Hook: /etc/apt/apt.conf.d/99glitch-update
                │
                ▼
Executes: /usr/local/bin/glitch-update --check-only
                │
        ┌───────┴───────┐
        ▼               ▼
[Up to date]     [Update available]
 (Silent)        Prints terminal alert with version details
```

### How It Works

* **Hook Configuration**: Written to `/etc/apt/apt.conf.d/99glitch-update`:
  ```apt
  APT::Update::Post-Invoke-Success { "/usr/local/bin/glitch-update --check-only 2>/dev/null || true"; };
  DPkg::Post-Invoke { "/usr/local/bin/glitch-update --post-apt 2>/dev/null || true"; };
  ```
* **Post-Upgrade Hook**: When you run `sudo apt upgrade`, GliTch pulls updates, migrates database schemas, and restarts background services automatically.

---

## 5. Building Debian Package (`.deb`)

GliTch includes a packaging utility that bundles the application into a `.deb` package adhering to Debian policies:

```bash
# Build the .deb package
./scripts/build-deb.sh
```

The resulting package will be created in `dist/glitch_<version>_all.deb`.

Install it on any Debian/Ubuntu machine:
```bash
sudo apt install ./dist/glitch_0.1.0_all.deb
```

---

## 6. Uninstallation

To cleanly remove all GliTch binaries, systemd services, APT hooks, and data:

### Single Command Uninstaller
```bash
curl -fsSL https://raw.githubusercontent.com/Tushar-CodeSpace/GliTch/main/uninstall.sh | sudo bash
```

### Local Workspace Uninstaller
```bash
# Run local uninstaller
sudo ./uninstall.sh

# Or without prompts
sudo ./uninstall.sh -y

# Keep SQLite database during uninstall
sudo ./uninstall.sh --keep-data
```

