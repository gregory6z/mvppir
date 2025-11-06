#!/bin/bash
# Vercel Ignore Build Script
# Returns exit code 1 to proceed with build, 0 to cancel

# Check if this is the first commit
if git rev-parse HEAD^ >/dev/null 2>&1; then
  # Check if apps/web has changes between HEAD^ and HEAD
  if git diff --quiet HEAD^ HEAD apps/web/; then
    echo "🟡 No changes detected in apps/web/ - skipping build"
    exit 0
  else
    echo "🟢 Changes detected in apps/web/ - proceeding with build"
    exit 1
  fi
else
  # First commit or no previous commit - always build
  echo "🟢 First deployment - proceeding with build"
  exit 1
fi
