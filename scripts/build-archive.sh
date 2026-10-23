#!/usr/bin/env bash
# Rebuild a past homepage from git so "변화 과정" can open it exactly as it was.
# Usage: scripts/build-archive.sh <commit> <date>   e.g. scripts/build-archive.sh 31e4092 2026-10-08
# Output: public/archive/<date>/ (a static export served under /archive/<date>/).
set -euo pipefail
commit="$1"; date="$2"
root="$(git rev-parse --show-toplevel)"
work="$(mktemp -d)"
git -C "$root" worktree add --detach "$work" "$commit" >/dev/null
trap 'git -C "$root" worktree remove --force "$work"' EXIT
cd "$work"
# Serve the old build under /archive/<date>/ without touching its code.
sed -i "s#output: 'export',#output: 'export', basePath: '/archive/$date',#" next.config.ts
grep -q "basePath: '/archive/$date'" next.config.ts
npm ci --no-audit --no-fund --loglevel=error
# Next stops the first build of a vulnerable release to print an upgrade notice; the same command then proceeds.
npx next build >/dev/null 2>&1 || npx next build >/dev/null
# Files the live site already serves at the root (shared assets, production notes, crawler files) stay out of the archive.
rm -rf out/notes out/deephold out/specimens out/robots.txt out/sitemap.xml out/_headers out/icon.svg
rm -rf "$root/public/archive/$date"
mkdir -p "$root/public/archive"
cp -r out "$root/public/archive/$date"
echo "archived $commit at /archive/$date/"
