#!/usr/bin/env node
/**
 * Glitch Semantic Versioning Engine — Branch-driven SemVer Calculator
 * 
 * Rules:
 *   - fix/...     -> PATCH bump  (0.1.0 -> 0.1.1)
 *   - feature/... -> MINOR bump  (0.1.0 -> 0.2.0)
 *   - major/...   -> MAJOR bump  (0.1.0 -> 1.0.0)
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

/**
 * Gets the current base version from the root package.json.
 */
export function getCurrentVersion() {
  const pkgPath = path.join(ROOT_DIR, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    return pkg.version || "0.1.0";
  }
  return "0.1.0";
}

/**
 * Gets the current active Git branch.
 */
export function getCurrentBranch() {
  if (process.env.GITHUB_HEAD_REF) {
    return process.env.GITHUB_HEAD_REF; // Pull request source branch in CI
  }
  if (process.env.GITHUB_REF_NAME) {
    return process.env.GITHUB_REF_NAME; // Branch push in CI
  }
  try {
    return execSync("git branch --show-current", { cwd: ROOT_DIR, encoding: "utf-8" }).trim();
  } catch {
    return "main";
  }
}

/**
 * Determines SemVer bump type based on branch naming.
 * Returns: 'major' | 'minor' | 'patch' | null
 */
export function determineBumpType(branch) {
  if (!branch) return null;
  const clean = branch.trim().toLowerCase();

  if (/^(major|breaking)\//.test(clean)) {
    return "major";
  }
  if (/^(feature|feat)\//.test(clean)) {
    return "minor";
  }
  if (/^(fix|patch|bugfix)\//.test(clean)) {
    return "patch";
  }
  return null;
}

/**
 * Calculates next version given a base SemVer string and a branch name.
 */
export function calculateNextVersion(baseVersion, branch) {
  const match = baseVersion.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) {
    throw new Error(`Invalid base version: "${baseVersion}". Must follow SemVer (e.g. 0.1.0).`);
  }

  let major = parseInt(match[1], 10);
  let minor = parseInt(match[2], 10);
  let patch = parseInt(match[3], 10);

  const bumpType = determineBumpType(branch);

  switch (bumpType) {
    case "major":
      major += 1;
      minor = 0;
      patch = 0;
      break;
    case "minor":
      minor += 1;
      patch = 0;
      break;
    case "patch":
      patch += 1;
      break;
    default:
      // On main/master or non-prefixed branches, maintain current base version
      return baseVersion;
  }

  return `${major}.${minor}.${patch}`;
}

/**
 * Updates all package.json files in the repository with the new version.
 */
export function updateAllPackageJsons(newVersion) {
  const files = [
    path.join(ROOT_DIR, "package.json"),
    path.join(ROOT_DIR, "packages", "web", "package.json"),
    path.join(ROOT_DIR, "services", "daemon", "package.json"),
  ];

  const updated = [];

  for (const file of files) {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, "utf-8"));
      data.version = newVersion;
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf-8");
      updated.push(path.relative(ROOT_DIR, file));
    }
  }

  return updated;
}

// -----------------------------------------------------------------------------
// CLI Execution Handler
// -----------------------------------------------------------------------------
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    branch: null,
    next: false,
    current: false,
    bump: false,
    validate: false,
    json: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--branch" && i + 1 < args.length) {
      options.branch = args[++i];
    } else if (arg === "--next") {
      options.next = true;
    } else if (arg === "--current") {
      options.current = true;
    } else if (arg === "--bump") {
      options.bump = true;
    } else if (arg === "--validate") {
      options.validate = true;
    } else if (arg === "--json") {
      options.json = true;
    }
  }

  return options;
}

function runCli() {
  const options = parseArgs();
  const currentVersion = getCurrentVersion();
  const branch = options.branch || getCurrentBranch();
  const bumpType = determineBumpType(branch);
  const nextVersion = calculateNextVersion(currentVersion, branch);

  // 1. Output current version only
  if (options.current) {
    console.log(currentVersion);
    return;
  }

  // 2. Output next version only (ideal for scripts & CI)
  if (options.next) {
    console.log(nextVersion);
    return;
  }

  // 3. Validation check
  if (options.validate) {
    if (bumpType !== null || branch === "main" || branch === "master") {
      console.log(`✔ Branch '${branch}' conforms to SemVer naming (bump: ${bumpType || "none"})`);
      process.exit(0);
    } else {
      console.error(`❌ Branch '${branch}' does NOT conform to Glitch versioning naming convention.`);
      console.error("   Allowed branch prefixes: fix/*, feature/*, major/* (or main/master)");
      process.exit(1);
    }
  }

  // 4. Bump all package.json files
  if (options.bump) {
    if (nextVersion === currentVersion) {
      console.log(`⚡ Already on target version: ${currentVersion} (branch '${branch}' did not require bump)`);
      return;
    }
    const updated = updateAllPackageJsons(nextVersion);
    console.log(`⚡ Bumped Glitch version: ${currentVersion} → ${nextVersion} (${bumpType} bump from branch '${branch}')`);
    console.log("Updated files:");
    for (const file of updated) {
      console.log(`  • ${file}`);
    }
    return;
  }

  // 5. JSON output
  if (options.json) {
    console.log(JSON.stringify({
      currentVersion,
      branch,
      bumpType: bumpType || "none",
      nextVersion,
    }, null, 2));
    return;
  }

  // 6. Default Human-Readable Summary
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║               GLITCH BRANCH-BASED SEMVER ENGINE                  ║
╠══════════════════════════════════════════════════════════════════╣
║  • Current Version:  ${currentVersion.padEnd(43)}║
║  • Detected Branch:  ${branch.padEnd(43)}║
║  • Bump Strategy:    ${(bumpType ? bumpType.toUpperCase() : "NONE (Tracking)").padEnd(43)}║
║  • Next SemVer:      ${nextVersion.padEnd(43)}║
╠══════════════════════════════════════════════════════════════════╣
║  Conventions:                                                    ║
║    fix/...     → PATCH bump  (0.1.0 → 0.1.1)                     ║
║    feature/... → MINOR bump  (0.1.0 → 0.2.0)                     ║
║    major/...   → MAJOR bump  (0.1.0 → 1.0.0)                     ║
╚══════════════════════════════════════════════════════════════════╝
`);
}

// Run when executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCli();
}

