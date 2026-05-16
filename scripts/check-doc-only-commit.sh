#!/usr/bin/env bash
# Vercel ignoreCommand — skip the build when the only files changed since
# the previous deploy are docs (.md / .txt / LICENSE / .gitignore).
#
# Convention: exit 0 = SKIP build, exit 1 = RUN build.
#
# Sister glw v36.605 + scc v27.885 — cross-stack port from GW v2.97.V2.
# Per `feedback_vercel_build_cadence_doctrine.md`: every project should
# have this. Doug's Vercel bill was 92% Build CPU last week — this skips
# the ~30-40% of pushes that are doc-only.

set -euo pipefail

CHANGED=$(git diff HEAD~1 --name-only 2>/dev/null || echo "")

CODE_CHANGED=$(echo "$CHANGED" | grep -v -E '^[^/]*\.(md|txt)$|/[^/]+\.md$|^LICENSE$|^\.gitignore$' || true)

if [ -z "$CODE_CHANGED" ]; then
  COUNT=$(echo "$CHANGED" | grep -c . || echo 0)
  echo "Skipping deploy: doc-only diff ($COUNT files, all .md/.txt/LICENSE/.gitignore)"
  exit 0
else
  COUNT=$(echo "$CODE_CHANGED" | grep -c . || echo 0)
  echo "Building: $COUNT code file(s) changed"
  exit 1
fi
