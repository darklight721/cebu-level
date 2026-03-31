# AGENTS.md — Cebu Level

Cebu Level is an interactive SVG map of Cebu province for tracking travel progress.
Built with React 18, TypeScript (strict), Bootstrap 5 (via Reactstrap), and Rsbuild.

## Build & Dev Commands

```bash
npm install          # Install dependencies
npm run dev          # Start Rsbuild dev server
npm run build        # Type-check (tsc) then build (rsbuild build)
npm run preview      # Preview production build locally
```

**There is no test framework configured.** No test runner, no test files, no test scripts.
If adding tests, Vitest is the natural choice.

### Type Checking

```bash
npx tsc --noEmit     # Run TypeScript type checking only (no output)
```

The `npm run build` command runs `tsc && rsbuild build`, so type errors will block the build.

### Linting

```bash
npm run lint         # Run oxlint on the project
npx oxlint src/      # Lint a specific directory
```

Oxlint is configured in `.oxlintrc.json` with the `typescript`, `import`, `react-perf`, and `jsx-a11y` plugins enabled.
Oxlint runs automatically on staged `.ts`/`.tsx` files on commit via husky + lint-staged.

### Formatting

```bash
npm run fmt          # Format all files with oxfmt
npm run fmt:check    # Check formatting without writing
```

Oxfmt (configured in `.oxfmtrc.json`) replaces Prettier. It is Prettier-compatible — same
`semi: false` and `singleQuote: true` rules — with `printWidth: 80`.
Oxfmt runs automatically on all staged files on commit via husky + lint-staged.

### Commit Messages

Short imperative phrases, no period, no conventional-commit prefix:

```
Update all dependencies to latest versions
Migrate from Vite to Rsbuild
Add more info in readme
Validate values and result
```

## Project Structure

```
src/
  main.tsx          # Entry point: parses URL params, loads localStorage, renders App
  App.tsx           # Main component: SVG map, legend, action buttons
  data.ts           # Town SVG path data, default values/levels, types, validators
  utils.ts          # LocalStorage helpers, JSONCrush pack/unpack utilities
  EditMap.tsx        # Modal form for editing map name, levels, colors, points
  SaveImage.tsx      # html2canvas screenshot + download
  ShareMap.tsx       # URL sharing with social media buttons
  globals.d.ts       # Window interface augmentation (gtag)
  vite-env.d.ts      # Vite/Rsbuild client types
  App.css            # Component styles
  index.css          # Global styles
```

All source code lives in `src/`. There are no subdirectories — it's a flat structure.
Static assets are in `public/`. The app deploys to GitHub Pages at `/cebu-level/`.

## Code Style

### Formatting Rules (Oxfmt)

- **No semicolons** (`"semi": false`)
- **Single quotes** (`"singleQuote": true`)
- **Print width** of 80 characters (`"printWidth": 80`)
- These are enforced on every commit via husky pre-commit hook

### TypeScript Configuration

Strict mode is enabled with additional strictness flags:

- `"strict": true`
- `"noUncheckedIndexedAccess": true` — indexed access returns `T | undefined`
- `"noUnusedLocals": true` — no unused variables
- `"noUnusedParameters": true` — no unused function parameters
- `"noImplicitReturns": true` — every code path must return
- `"allowUnreachableCode": false`
- `"allowUnusedLabels": false`

Target is `ESNext` with `"module": "ESNext"` and `"jsx": "react-jsx"`.

### Import Order

1. Third-party library imports (react, reactstrap, etc.)
2. Local module imports (./App, ./data, ./utils)
3. CSS imports (./App.css, ./index.css)

Use **named imports** from libraries. Use **inline `type` keyword** for type-only imports:

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

- Use **try/catch with fallback defaults** for parsing operations (see `tryParse` in `utils.ts`)
- Use **type guard functions** (`(data: any): data is T`) for runtime validation
- Use **optional chaining and nullish coalescing** for safe property access:
  `values.levels[index]?.points ?? 0`
- Use **optional chaining for browser APIs** that may not exist: `window.gtag?.(...)`

### State Management

- All state is managed via `useState` hooks — no external state library
- Data persistence uses `localStorage` via helpers in `utils.ts`
- URL-based state sharing uses `JSONCrush` for compression + `query-string` for parsing

### CSS & Styling

- Bootstrap 5 utility classes for layout (`d-flex`, `text-center`, `mb-3`, etc.)
- Reactstrap components for UI elements (`Button`, `Modal`, `Form`, `Input`, etc.)
- Custom CSS in `App.css` and `index.css` — minimal, mostly for SVG map styling
- No CSS modules, no Tailwind, no CSS-in-JS

## Deployment

The app deploys to GitHub Pages via GitHub Actions on push to `main`.
The Rsbuild `base` is set to `/cebu-level/`.

## Key Dependencies

| Package      | Purpose                              |
| ------------ | ------------------------------------ |
| react        | UI framework (v18)                   |
| reactstrap   | Bootstrap 5 React components         |
| bootstrap    | CSS framework                        |
| html2canvas  | Screenshot/image export              |
| jsoncrush    | URL-safe JSON compression            |
| query-string | URL query parameter parsing          |
| react-share  | Social media share buttons           |
| rsbuild      | Build tool + dev server              |
| typescript   | Type checking (v4.9)                 |
| oxlint       | Linter                               |
| oxfmt        | Code formatter                       |
| husky        | Git hooks                            |
| lint-staged  | Run linter/formatter on staged files |
