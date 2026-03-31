# Migration Plan: Vite 4 to Rsbuild

## Overview

Migrate the cebu-level project from Vite 4 to Rsbuild. The project is a minimal Vite setup (one plugin, no env vars, no custom Rollup config, no import.meta.glob), making this a clean migration.

## Steps

### 1. Update npm dependencies

**Remove:** `vite`, `@vitejs/plugin-react-swc`  
**Install (devDependencies):** `@rsbuild/core`, `@rsbuild/plugin-react`

Already done:

```bash
npm uninstall vite @vitejs/plugin-react-swc
npm install -D @rsbuild/core @rsbuild/plugin-react
```

### 2. Update npm scripts in `package.json`

Change:

```json
"dev": "vite"           → "dev": "rsbuild dev"
"build": "tsc && vite build" → "build": "tsc && rsbuild build"
"preview": "vite preview"    → "preview": "rsbuild preview"
```

### 3. Create `rsbuild.config.ts`

```ts
import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/main.tsx',
    },
  },
  html: {
    template: './index.html',
  },
  server: {
    base: '/cebu-level/',
  },
})
```

### 4. Modify `index.html`

Remove the script tag (Rsbuild auto-injects it):

```html
<!-- DELETE THIS LINE -->
<script type="module" src="/src/main.tsx"></script>
```

### 5. Update type references

Rename `src/vite-env.d.ts` → `src/env.d.ts` and change content to:

```ts
/// <reference types="@rsbuild/core/types" />
```

### 6. Update `tsconfig.node.json`

Change `include` from `["vite.config.ts"]` to `["rsbuild.config.ts"]`.

### 7. Delete `vite.config.ts`

### 8. Verify

- `npm run dev` — dev server starts
- `npm run build` — production build succeeds, outputs to `./dist`
- No changes needed to GitHub Actions deploy workflow

## What doesn't change

- `tsconfig.json` — fully compatible
- `.github/workflows/deploy.yml` — still runs `npm run build` and deploys `./dist`
- `package.json` `"type": "module"` — compatible
- husky/lint-staged/prettier — unaffected
- All source code in `src/` — no Vite-specific APIs used
