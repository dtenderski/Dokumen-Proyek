#!/bin/bash
set -e

# Invalidate Vite's pre-bundled dependency cache so the next dev-server
# start rebuilds it from the freshly installed modules.  Without this,
# the browser can receive a mix of old pre-bundled React chunks and new
# modules, causing null-hook crashes (e.g. "Cannot read properties of
# null (reading 'useEffect')").
rm -rf node_modules/.vite

# Install dependencies
npm install

# Push database schema changes
npm run db:push
