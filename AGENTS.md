# AGENTS.md — Cebu Level

Cebu Level is an interactive SVG map of Cebu province for tracking travel progress.
Built with React 18, TypeScript (strict), Bootstrap 5 (via Reactstrap), and Rsbuild.

## Build & Dev Commands

```bash
npm install          # Install dependencies
npm run dev          # Start Rsbuild dev server
npm run build        # Type-check (tsc) then build (rsbuild build)
npm run preview      # Preview production build locally
npx tsc --noEmit     # Type-check only (no output)
npm run lint         # Run oxlint on the project
npm run fmt          # Format all files with oxfmt
npm run fmt:check    # Check formatting without writing
```

No test framework is configured. Vitest is the natural choice if tests are added.
Oxlint and oxfmt run automatically on staged files on commit via husky + lint-staged.

### Commit Messages

Short imperative phrases, no period, no conventional-commit prefix:

```
Update all dependencies to latest versions
Migrate from Vite to Rsbuild
```

## Project Structure

All source code lives in `src/` (flat, no subdirectories). Static assets in `public/`.
Deploys to GitHub Pages at `/cebu-level/` via GitHub Actions on push to `main`.

## Code Style

**Formatting** (`.oxfmtrc.json`): no semicolons, single quotes, 80-char print width.
**TypeScript** (`tsconfig.json`): strict mode + `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`.

### Import Order

1. Third-party imports (`react`, `reactstrap`, etc.)
2. Local imports (`./App`, `./data`, `./utils`)
3. CSS imports

Use named imports. Use inline `type` keyword for type-only imports:

```typescript
import { useState } from 'react'
import { Button, Modal } from 'reactstrap'
import { HOME_URL, VALUES, type Result, type Values } from './data'
import './App.css'
```

### Naming Conventions

| Element            | Convention        | Examples                                |
| ------------------ | ----------------- | --------------------------------------- |
| Files (components) | PascalCase `.tsx` | `EditMap.tsx`, `SaveImage.tsx`          |
| Files (modules)    | camelCase `.ts`   | `data.ts`, `utils.ts`                   |
| React components   | PascalCase        | `EditMap`, `ShareMapModal`              |
| Types              | PascalCase        | `Values`, `Result`, `Props`, `Level`    |
| Functions          | camelCase         | `computeScore`, `validateValues`        |
| Constants          | UPPER_SNAKE_CASE  | `VALUES`, `DEFAULT_COLOR`, `HOME_URL`   |
| Variables          | camelCase         | `activeTown`, `valuesParam`, `isCopied` |
| Boolean state      | `is`/`has` prefix | `isOpen`, `isLoading`, `isCopied`       |

### Component Patterns

- **Functional components only** — no class components
- **Props type** defined as `type Props = { ... }` inline in the file, not an interface
- **Default export** for the public component of each file: `export default function App(...)`
- **Modal pattern**: parent holds `isOpen` state, conditionally renders modal, passes `toggle`:

```typescript
// Private modal component (not exported)
function EditMapModal({ values, toggle }: Props & { toggle: () => void }) {
  return <Modal isOpen toggle={toggle}>...</Modal>
}

// Public wrapper (default export)
export default function EditMap(props: Props) {
  const [isOpen, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit</Button>
      {isOpen && <EditMapModal {...props} toggle={() => setOpen(false)} />}
    </>
  )
}
```

### Error Handling

- **try/catch with fallback defaults** for parsing (see `tryParse` in `utils.ts`)
- **Type guard functions** (`(data: any): data is T`) for runtime validation
- **Optional chaining + nullish coalescing**: `values.levels[index]?.points ?? 0`
- **Optional chaining for browser APIs**: `window.gtag?.(...)`

### State & Styling

- State: `useState` hooks only — no external state library
- Persistence: `localStorage` via helpers in `utils.ts`; URL sharing via `JSONCrush` + `query-string`
- Styling: Bootstrap 5 utility classes + Reactstrap components; custom CSS in `App.css`/`index.css`
- No CSS modules, no Tailwind, no CSS-in-JS
