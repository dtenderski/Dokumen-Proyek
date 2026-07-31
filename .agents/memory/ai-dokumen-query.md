---
name: AI Dokumen Query — pdf-parse & createRequire
description: How to safely import pdf-parse (CJS-only) in a codebase that builds to CJS for production but runs as ESM in dev.
---

## Rule
Never use `createRequire(import.meta.url)` directly. In the CJS production build, `import.meta` is an empty object so `.url` is `undefined`, causing `createRequire` to throw `ERR_INVALID_ARG_VALUE` on startup.

## Fix (in server/routes.ts)
```typescript
import { createRequire } from "module";
let require: NodeRequire;
try {
  require = createRequire(import.meta.url); // ESM dev (tsx)
} catch {
  require = createRequire(__filename);      // CJS production build
}
const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;
```

**Why:** The build script (script/build.ts via esbuild) compiles the server to CJS (`dist/index.cjs`). esbuild emits a warning but still outputs the code with `import.meta` as `{}`. At runtime `import.meta.url` is `undefined`, so `createRequire(undefined)` throws immediately and crash-loops the container, failing the healthcheck.

**How to apply:** Any time pdf-parse (or another CJS-only module) must be `require()`d in a file that is ESM in dev and CJS in production, use the try/catch pattern above.
