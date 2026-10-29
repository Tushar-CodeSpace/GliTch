#!/usr/bin/env bash
set -e

echo "⚡ [Glitch] Cleaning up local database and build artifacts..."

read -p "Are you sure you want to remove data/glitch.db and build artifacts? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  rm -rf data/glitch.db data/glitch.db-wal data/glitch.db-shm
  rm -rf packages/web/dist
  echo "✔ SQLite database and build artifacts removed."
else
  echo "Aborted."
fi

