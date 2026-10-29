# Command-Line Interface (CLI) Reference 💻

GliTch provides two primary command-line utilities: `glitch` and `glitch-update`.

---

## 1. `glitch` Command

The `glitch` CLI tool is located in `bin/glitch` (and symlinked to `/usr/local/bin/glitch` when installed with `--cli`).

### Syntax
```bash
glitch [command] [options]
```

### Commands

| Command | Description | Example |
| :--- | :--- | :--- |
| `status` | Checks daemon process state, SQLite connectivity, and host stats | `glitch status` |
| `triage` | Lists unresolved incidents and active warnings | `glitch triage` |
| `fix [id]` | Executes the automated playbook for the specified incident | `glitch fix inc_1` |
| `fix --all` | Runs playbooks for all pending incidents | `glitch fix --all` |
| `copilot "query"` | Queries the local DevOps Copilot via terminal | `glitch copilot "how to drain node"` |
| `start` | Starts the daemon in the background | `glitch start` |
| `stop` | Stops the running daemon process | `glitch stop` |
| `restart` | Restarts the daemon process | `glitch restart` |
| `help` | Displays command usage manual | `glitch --help` |

---

## 2. `glitch-update` Command

The `glitch-update` CLI tool is located in `bin/glitch-update` (and symlinked to `/usr/local/bin/glitch-update`).

### Syntax
```bash
glitch-update [options]
```

### Options

| Flag | Description |
| :--- | :--- |
| `--check-only` | Checks for newer versions remotely and exits silently unless updates are available (used by `APT::Update::Post-Invoke-Success`). |
| `--post-apt` | Executed after `sudo apt upgrade` to pull latest changes, run migrations, and reload services. |
| `--force` | Forces a re-pull and re-installation regardless of current version. |
| `--help` | Displays updater help message. |

