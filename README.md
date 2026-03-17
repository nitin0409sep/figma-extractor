# Figma Extractor

A production-grade Next.js web application that extracts structured design data from Figma files and transforms it into development-ready output — CSS properties, Tailwind utility classes, component mappings, and design tokens.

![Dark Theme](screenshot-dark.png)
![Results View](screenshot-results.png)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [How It Works](#how-it-works)
  - [Extraction Pipeline](#extraction-pipeline)
  - [URL Parsing](#url-parsing)
  - [Figma API Integration](#figma-api-integration)
  - [Design Data Parsing](#design-data-parsing)
  - [CSS Generation](#css-generation)
  - [Tailwind Mapping](#tailwind-mapping)
  - [Component Suggestions](#component-suggestions)
  - [Design Token Extraction](#design-token-extraction)
- [Security](#security)
  - [Input Validation](#input-validation)
  - [Rate Limiting](#rate-limiting)
  - [Security Headers](#security-headers)
  - [Error Handling](#error-handling)
- [Theming](#theming)
- [Linting and Formatting](#linting-and-formatting)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Output Format](#output-format)
- [Supported Figma URL Formats](#supported-figma-url-formats)

---

## Features

- **Figma Data Extraction** — Parses Figma API responses and extracts all visual properties (colors, typography, spacing, effects, auto-layout)
- **CSS Generation** — Converts Figma node properties into standard CSS (fills, strokes, shadows, blurs, gradients, typography, layout)
- **Tailwind Conversion** — Maps CSS to Tailwind utility classes with intelligent spacing/size mapping and arbitrary value fallbacks
- **Component Suggestions** — Infers semantic HTML tags (`<nav>`, `<button>`, `<header>`, etc.) from node names and types, generates React component props
- **Design Token Extraction** — Collects unique colors, typography styles, and spacing values for design system documentation
- **Node-Specific Extraction** — When a `node-id` is present in the URL, fetches only that specific node for faster, targeted extraction
- **Dark / Light / System Theme** — Full theme support with system preference detection, localStorage persistence, and no flash of wrong theme
- **Multi-Tab JSON Viewer** — View extracted data as Full JSON, CSS-only, Tailwind-only, or Components-only with syntax highlighting
- **Copy & Download** — Copy any tab's content to clipboard or download the full JSON file
- **Stats Dashboard** — At-a-glance metrics showing node count, colors, typography, spacing, and components
- **Error Boundary** — Graceful crash recovery in the results view
- **Production Security** — Rate limiting, input validation, CSP headers, and proper error responses
- **Biome Linting/Formatting** — Consistent code style enforced across the entire codebase

---

## Tech Stack

| Layer          | Technology                         |
| -------------- | ---------------------------------- |
| Framework      | Next.js 14 (App Router)            |
| Frontend       | React 18                           |
| Language       | TypeScript 5 (strict mode)         |
| Styling        | Tailwind CSS 3 + CSS Variables     |
| Linting        | Biome 2                            |
| Build          | PostCSS, Autoprefixer              |
| External API   | Figma REST API v1                  |

No additional state management libraries, no external data fetching libraries — all vanilla Next.js/React.

---

## Project Structure

```
figma-extractor/
├── app/
│   ├── api/
│   │   └── extract/
│   │       └── route.ts          # POST API endpoint (validation, rate limiting, extraction)
│   ├── globals.css               # CSS variables, theme tokens, component classes, scrollbar
│   ├── layout.tsx                # Root layout (theme provider, flash prevention script)
│   └── page.tsx                  # Home page (main UI orchestration)
├── components/
│   ├── DownloadButton.tsx        # JSON file download
│   ├── ErrorBoundary.tsx         # React error boundary for crash recovery
│   ├── JsonPreview.tsx           # Multi-tab JSON viewer with syntax highlighting
│   ├── LinkInput.tsx             # Figma URL input with icon and Enter key support
│   ├── StatsBar.tsx              # Extraction stats dashboard (nodes, colors, etc.)
│   ├── ThemeToggle.tsx           # Light / Dark / System theme switcher
│   └── TokenInput.tsx            # Token input with show/hide toggle + localStorage
├── lib/
│   ├── component-mapper.ts       # Semantic HTML tag inference and React component suggestions
│   ├── css-mapper.ts             # Figma properties → CSS conversion
│   ├── figma-client.ts           # Figma API client (URL parsing, file/node/image fetching)
│   ├── parser.ts                 # Main parsing engine (nodes, tokens, component tree)
│   ├── rate-limit.ts             # In-memory rate limiter (10 req/min per IP)
│   ├── tailwind-mapper.ts        # CSS → Tailwind utility class conversion
│   ├── theme-provider.tsx        # React context for dark/light/system theme
│   └── validation.ts             # Input validation (URL pattern, token format, length limits)
├── types/
│   └── figma.ts                  # TypeScript type definitions (Figma API + output types)
├── biome.json                    # Biome linter/formatter configuration
├── next.config.js                # Next.js config (security headers, no X-Powered-By)
├── package.json                  # Dependencies and scripts
├── postcss.config.js             # PostCSS (Tailwind + Autoprefixer)
├── tailwind.config.ts            # Tailwind configuration (dark mode via class)
└── tsconfig.json                 # TypeScript strict mode configuration
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- A **Figma Personal Access Token** — generate one at [Figma Settings > Personal Access Tokens](https://www.figma.com/developers/api#access-tokens)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd figma-extractor

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

---

## Usage

1. **Enter your Figma Personal Access Token** — It's stored in your browser's localStorage and never sent to any server other than Figma's API.
2. **Paste a Figma URL** — Supports design files, FigJam boards, prototypes, and specific node links.
3. **Click "Extract"** (or press Enter) — The app fetches the design data from Figma's API and processes it.
4. **Browse the results** — Use the tabs to switch between Full JSON, CSS, Tailwind, and Components views.
5. **Copy or Download** — Copy any tab's content to clipboard, or download the complete JSON file.

---

## How It Works

### Extraction Pipeline

```
Figma URL + Token
      │
      ▼
┌─────────────────┐
│  Input Validation│ ← URL pattern, token format, length limits
│  Rate Limiting   │ ← 10 requests/minute per IP
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  URL Parsing     │ ← Extract fileKey + nodeId, convert node-id format
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Figma API       │ ← /files/{key} or /files/{key}/nodes?ids=...
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Node Parsing    │ ← Recursive traversal of Figma document tree
│  ├─ CSS Gen      │ ← Layout, fills, typography, effects → CSS properties
│  ├─ Tailwind Gen │ ← CSS properties → Tailwind utility classes
│  └─ Component Gen│ ← Node names/types → semantic HTML tags + props
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Token Collection│ ← Colors, typography styles, spacing values
│  Component Tree  │ ← Component ID → name mapping
└────────┬────────┘
         │
         ▼
   JSON Response
```

### URL Parsing

The `parseFigmaUrl()` function in `lib/figma-client.ts` handles:

- **URL types**: `/file/`, `/design/`, `/board/` (FigJam), `/proto/` (prototypes)
- **File key extraction**: The alphanumeric key from the URL path
- **Node ID extraction**: The `node-id` query parameter, converted from dash format (`942-2159`) to colon format (`942:2159`) as required by the Figma API

### Figma API Integration

Three API functions in `lib/figma-client.ts`:

| Function           | Endpoint                          | Purpose                                      |
| ------------------ | --------------------------------- | -------------------------------------------- |
| `fetchFile()`      | `GET /files/{fileKey}`            | Fetch the entire Figma file                  |
| `fetchFileNodes()` | `GET /files/{fileKey}/nodes?ids=` | Fetch specific nodes (when node-id is present)|
| `fetchImages()`    | `GET /images/{fileKey}?ids=`      | Fetch rendered images for nodes              |

All functions include proper error handling for HTTP 403 (invalid token), 404 (not found), and 429 (rate limited).

### Design Data Parsing

The `parseNode()` function in `lib/parser.ts` recursively processes each Figma node:

1. **Generates CSS** from Figma properties (width, height, fills, strokes, effects, etc.)
2. **Handles text nodes** specially — applies fills as `color` instead of `background-color`
3. **Generates Tailwind classes** from the CSS properties
4. **Suggests components** — infers semantic HTML tags from node names and types
5. **Extracts auto-layout** information (flexbox direction, gap, padding, alignment)
6. **Recursively processes children** (filtering out invisible nodes)

### CSS Generation

`lib/css-mapper.ts` converts Figma node properties into CSS:

| Figma Property        | CSS Output                                          |
| --------------------- | --------------------------------------------------- |
| `absoluteBoundingBox`  | `width`, `height`                                   |
| `layoutMode`           | `display: flex`, `flex-direction`, `gap`             |
| `primaryAxisAlignItems`| `justify-content`                                   |
| `counterAxisAlignItems`| `align-items`                                       |
| `padding*`             | `padding` (shorthand or individual)                 |
| `fills` (SOLID)        | `background-color` (rgb/rgba)                       |
| `fills` (GRADIENT)     | `background-image: linear-gradient(...)`            |
| `fills` (IMAGE)        | `background-image`, `background-size`               |
| `strokes`              | `border`                                            |
| `cornerRadius`         | `border-radius`                                     |
| `effects` (shadow)     | `box-shadow` (drop + inner)                         |
| `effects` (blur)       | `filter: blur()`, `backdrop-filter: blur()`         |
| `style` (typography)   | `font-family`, `font-size`, `font-weight`, etc.     |
| `opacity`              | `opacity`                                           |
| `clipsContent`         | `overflow: hidden`                                  |

### Tailwind Mapping

`lib/tailwind-mapper.ts` converts CSS properties into Tailwind classes using predefined maps:

- **Spacing**: 0–384px mapped to Tailwind scale (`0`, `px`, `0.5`, `1`, ..., `96`), with arbitrary value fallback `[Xpx]`
- **Font sizes**: 12–128px mapped to `xs`–`9xl`
- **Font weights**: 100–900 mapped to `thin`–`black`
- **Border radius**: 0–9999px mapped to `rounded-none`–`rounded-full`
- **Colors**: RGB/RGBA values converted to hex for arbitrary Tailwind values (e.g., `bg-[#ff5733]`)
- **Flexbox**: `justify-content` → `justify-*`, `align-items` → `items-*`

### Component Suggestions

`lib/component-mapper.ts` infers semantic HTML tags:

| Node Name Contains | Suggested Tag |
| ------------------- | ------------- |
| button, btn, cta    | `<button>`    |
| nav, menu           | `<nav>`       |
| header              | `<header>`    |
| footer              | `<footer>`    |
| input, field        | `<input>`     |
| image, img, avatar  | `<img>`       |
| card                | `<article>`   |
| modal, dialog       | `<dialog>`    |
| heading, title, h1  | `<h1>`–`<h6>` |
| link                | `<a>`         |
| list                | `<ul>`        |
| section             | `<section>`   |

Components (COMPONENT/INSTANCE types) get `isComponent: true` and a PascalCase `componentName`.

### Design Token Extraction

The `collectTokens()` function walks all parsed nodes and extracts:

- **Colors** — Unique hex values from solid fills, keyed by hex with node name as value
- **Typography** — Unique font combinations (family + size + weight), with line height and letter spacing
- **Spacing** — Unique gap and padding values from auto-layout nodes, sorted by size

---

## Security

### Input Validation

`lib/validation.ts` validates all user inputs before processing:

- **URL validation** — Must match `https://(www.)figma.com/(file|design|board|proto)/[key]` pattern, max 2048 characters
- **Token validation** — Must match `figd_[alphanumeric]{20+}` pattern, max 256 characters
- **String sanitization** — HTML entity encoding for `<`, `>`, `"`, `'`, `&` characters

### Rate Limiting

`lib/rate-limit.ts` implements an in-memory sliding window rate limiter:

- **Window**: 60 seconds
- **Max requests**: 10 per IP per window
- **Response**: HTTP 429 with `Retry-After` header when exceeded

### Security Headers

`next.config.js` sets production security headers on all routes:

| Header                    | Value                                    | Purpose                              |
| ------------------------- | ---------------------------------------- | ------------------------------------ |
| `X-Content-Type-Options`  | `nosniff`                                | Prevent MIME type sniffing           |
| `X-Frame-Options`         | `DENY`                                   | Prevent clickjacking                 |
| `X-XSS-Protection`        | `1; mode=block`                          | Legacy XSS filter                    |
| `Referrer-Policy`         | `strict-origin-when-cross-origin`        | Control referrer information         |
| `Permissions-Policy`      | `camera=(), microphone=(), geolocation()`| Disable unused browser APIs          |
| `Content-Security-Policy` | `default-src 'self'; connect-src ... api.figma.com` | Restrict resource loading |

Additional security measures:
- **`poweredByHeader: false`** — Removes the `X-Powered-By: Next.js` header
- **`robots: noindex, nofollow`** — Prevents search engine indexing
- **Token stored client-side** — The Figma PAT is stored in browser localStorage and only sent directly to Figma's API

### Error Handling

- **Client-side**: Error boundary catches rendering crashes with a recovery button
- **Server-side**: Errors are mapped to appropriate HTTP status codes (400, 403, 404, 429, 500)
- **No internal leakage**: Generic "Internal server error" for unexpected exceptions

---

## Theming

The app supports three theme modes: **Light**, **Dark**, and **System** (follows OS preference).

### How It Works

1. **CSS Variables** (`app/globals.css`) — All colors, shadows, and accents are defined as CSS custom properties in `:root` (light) and `.dark` (dark) scopes
2. **Theme Provider** (`lib/theme-provider.tsx`) — React context manages theme state, persists to localStorage, and listens for system preference changes
3. **Flash Prevention** — An inline `<script>` in `app/layout.tsx` reads the saved theme before React hydrates, preventing a flash of the wrong theme
4. **Tailwind Integration** — `darkMode: "class"` in `tailwind.config.ts` enables class-based dark mode

### Theme Variables

| Variable              | Light               | Dark                |
| --------------------- | ------------------- | ------------------- |
| `--bg-primary`        | `#ffffff`           | `#0b0f1a`           |
| `--bg-secondary`      | `#f8fafc`           | `#111827`           |
| `--bg-elevated`       | `#ffffff`           | `#162032`           |
| `--text-primary`      | `#0f172a`           | `#f1f5f9`           |
| `--text-secondary`    | `#475569`           | `#94a3b8`           |
| `--accent-primary`    | `#6366f1`           | `#818cf8`           |
| `--accent-success`    | `#10b981`           | `#34d399`           |
| `--syntax-key`        | `#6366f1`           | `#93c5fd`           |
| `--syntax-string`     | `#059669`           | `#6ee7b7`           |

---

## Linting and Formatting

The project uses [Biome](https://biomejs.dev/) (v2) for linting and formatting, configured in `biome.json`.

### Linter Rules

- **Recommended rules** enabled as baseline
- `noUnusedVariables`, `noUnusedImports` — warn on dead code
- `useExhaustiveDependencies` — warn on missing React hook deps
- `noExplicitAny` — warn (prefer typed code)
- `noConsole` — warn (use proper logging in production)
- `useConst` — error (enforce `const` over `let` when possible)
- `noForEach` — off (allow `.forEach()`)
- `noSvgWithoutTitle` — off (decorative icons don't need titles)
- `noDangerouslySetInnerHtml` — off (needed for syntax highlighting)

### Formatter

- Indent: 2 spaces
- Line width: 100 characters
- Quotes: double
- Semicolons: always
- Trailing commas: all (JS/TS), none (JSON)

---

## Available Scripts

| Script            | Command                                | Description                                  |
| ----------------- | -------------------------------------- | -------------------------------------------- |
| `npm run dev`     | `next dev`                             | Start development server                     |
| `npm run build`   | `next build`                           | Create production build                      |
| `npm start`       | `next start`                           | Start production server                      |
| `npm run lint`    | `biome check .`                        | Run linter checks                            |
| `npm run lint:fix`| `biome check --write .`                | Auto-fix linter issues                       |
| `npm run format`  | `biome format --write .`               | Format all files                             |
| `npm run check`   | `biome check --write . && next build`  | Lint, format, and build (CI-ready)           |
| `npm run typecheck`| `tsc --noEmit`                        | TypeScript type checking only                |

---

## API Reference

### `POST /api/extract`

Extract design data from a Figma file.

**Request Body:**

```json
{
  "url": "https://www.figma.com/design/FILE_KEY/Title?node-id=1-2",
  "token": "figd_your_personal_access_token"
}
```

**Success Response (200):**

```json
{
  "fileKey": "abc123",
  "fileName": "My Design",
  "lastModified": "2026-03-17T07:22:00Z",
  "nodes": [ ... ],
  "designTokens": {
    "colors": { "#ff5733": "Primary Button" },
    "typography": { "Inter-16-600": { ... } },
    "spacing": ["8px", "16px", "24px"]
  },
  "componentTree": { "1:23": "PrimaryButton" }
}
```

**Error Responses:**

| Status | Condition                           |
| ------ | ----------------------------------- |
| 400    | Invalid URL or token format         |
| 403    | Invalid token or no file access     |
| 404    | Figma file not found                |
| 429    | Rate limit exceeded                 |
| 500    | Internal server error               |

---

## Output Format

### DesignNode

Each extracted node contains:

```typescript
{
  id: string;                    // Figma node ID
  name: string;                  // Node name from Figma
  type: string;                  // FRAME, TEXT, RECTANGLE, etc.
  visible: boolean;
  dimensions: { width, height };
  position: { x, y };
  styles: {
    fills: FigmaPaint[];         // Raw fill data
    strokes: FigmaPaint[];       // Raw stroke data
    strokeWeight?: number;
    cornerRadius?: number;
    opacity?: number;
    effects: FigmaEffect[];      // Shadows, blurs
    typography?: FigmaTypeStyle;  // Font properties (TEXT nodes)
  };
  text?: string;                 // Text content (TEXT nodes)
  autoLayout?: {                 // Flexbox layout info
    direction, gap, padding,
    primaryAxisAlign, counterAxisAlign
  };
  css: Record<string, string>;   // Generated CSS properties
  tailwind: string;              // Generated Tailwind classes
  componentSuggestion: {
    tag: string;                 // Suggested HTML tag
    props: Record<string, string>;
    isComponent: boolean;
    componentName?: string;      // PascalCase name
  };
  children: DesignNode[];        // Nested child nodes
}
```

---

## Supported Figma URL Formats

| URL Pattern                                                    | Type      |
| -------------------------------------------------------------- | --------- |
| `https://www.figma.com/design/FILE_KEY/Title`                  | Design    |
| `https://www.figma.com/file/FILE_KEY/Title`                    | File      |
| `https://www.figma.com/board/FILE_KEY/Title`                   | FigJam    |
| `https://www.figma.com/proto/FILE_KEY/Title`                   | Prototype |
| Any of the above with `?node-id=123-456`                       | Specific node |

---

## License

Private project. All rights reserved.
