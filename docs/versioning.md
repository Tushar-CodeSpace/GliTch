# Branch-Driven Semantic Versioning 🏷️

GliTch uses an automated Semantic Versioning (SemVer) engine driven directly by Git branch naming conventions.

---

## 1. Branch Naming Rules

The branch prefix defines the version bump applied to `package.json`:

| Branch Pattern | Bump Type | Transition Example | Use Case |
| :--- | :--- | :--- | :--- |
| **`fix/...`** or **`patch/...`** | **PATCH** | `0.1.0` → `0.1.1` | Bug fixes, UI glitch patches, security hotfixes |
| **`feature/...`** or **`feat/...`** | **MINOR** | `0.1.0` → `0.2.0` | New Copilot tools, SRE playbooks, new dashboards |
| **`major/...`** or **`breaking/...`** | **MAJOR** | `0.1.0` → `1.0.0` | Breaking API changes, architectural rewrites |
| **`main`** or **`master`** | **CURRENT** | `0.1.0` → `0.1.0` | Production releases and release tracking |

---

## 2. CLI Usage & Helper Scripts

The SemVer engine is located in `scripts/version.mjs` and is accessible via npm scripts:

### Preview Calculated Version
```bash
# Displays the next version based on the active branch
npm run version
```

### Output Target Version Only
```bash
# Useful for shell scripts and CI outputs
npm run version:next
# Output: 0.2.0
```

### Validate Branch Name
```bash
# Exits with 0 if branch name is valid, 1 otherwise
npm run version:check
```

### Apply Bump to `package.json`
```bash
# Automatically rewrites package.json with the new version
npm run version:bump
```

---

## 3. GitHub Actions CI Integration

In `.github/workflows/ci.yml`, the first job (`version-check`) resolves and validates the branch:

```yaml
- name: Calculate Semantic Version
  id: semver
  run: |
    BRANCH="${{ github.head_ref || github.ref_name }}"
    node scripts/version.mjs --branch "$BRANCH" --validate
    NEXT_VER=$(node scripts/version.mjs --branch "$BRANCH" --next)
    echo "version=$NEXT_VER" >> "$GITHUB_OUTPUT"
```

Subsequent build jobs use this resolved SemVer string for artifact naming and Debian `.deb` builds.
