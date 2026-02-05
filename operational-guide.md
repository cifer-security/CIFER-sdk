# CIFER SDK - Operational Guide

## Prerequisites

- Node.js 18+
- npm 9+

## Build SDK

```bash
# Clean previous builds
npm run clean

# Build all formats (ESM + CJS + Types)
npm run build

# Or build individually
npm run build:esm    # ES Modules → dist/esm/
npm run build:cjs    # CommonJS → dist/cjs/
npm run build:types  # Type declarations → dist/types/
```

## Publish to npm

```bash
# 1. Ensure you're logged in
npm login

# 2. Update version in package.json
npm version patch  # or minor/major

# 3. Build and publish (prepublishOnly runs automatically)
npm publish --access public
```

## Build Documentation

```bash
# First time: install Docusaurus dependencies
npm run docs:install

# Full docs build (types → API report → TypeDoc → llm.txt → Docusaurus)
npm run docs:build

# Preview locally
npm run docs:serve
```

## Build llm.txt Only

```bash
# Generate llm.txt file to docs-site/static/llm.txt
npm run docs:llm
```

## Individual Doc Commands

| Command | Description |
|---------|-------------|
| `npm run docs:api-extractor` | Run API Extractor with verbose output |
| `npm run docs:api-report` | Generate API report to `etc/` |
| `npm run docs:typedoc` | Generate TypeDoc markdown to `docs-site/docs/api/` |
| `npm run docs:llm` | Generate `llm.txt` for AI agents |
| `npm run docs:build` | Full documentation build pipeline |
| `npm run docs:serve` | Start local Docusaurus dev server |

## Output Locations

| Output | Location |
|--------|----------|
| ESM build | `dist/esm/` |
| CJS build | `dist/cjs/` |
| Type declarations | `dist/types/` |
| API report | `etc/cifer-sdk.api.md` |
| API model | `temp/cifer-sdk.api.json` |
| TypeDoc output | `docs-site/docs/api/` |
| LLM context file | `docs-site/static/llm.txt` |
| Docusaurus build | `docs-site/build/` |
