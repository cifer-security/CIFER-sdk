---
name: LLM Context File Generator
overview: Create a script that generates a comprehensive plaintext documentation file (`llm.txt`) for AI agents, containing complete SDK documentation without styling, and integrate it into the documentation build pipeline.
todos:
  - id: create-generator-script
    content: Create scripts/generate-llm-txt.js to generate the comprehensive LLM documentation file
    status: completed
  - id: integrate-build
    content: Update package.json to add docs:llm script and integrate into docs:build pipeline
    status: completed
---

# LLM Context File Generator

## Overview

Create a Node.js script that generates `docs-site/static/llm.txt` containing complete SDK documentation in a clean, AI-agent-friendly format. The file will be regenerated automatically whenever the documentation is built.

## File Structure

The `llm.txt` will contain:

1. **Header** - Purpose statement and generation timestamp
2. **Installation** - npm/yarn/pnpm commands
3. **Core Concepts** - Secrets, authorization, encryption model, block freshness
4. **SDK Initialization** - createCiferSdk patterns
5. **Namespace Reference** - Complete function signatures and usage for:

   - `keyManagement` - Secret CRUD operations
   - `blackbox.payload` - Payload encryption/decryption
   - `blackbox.files` - File operations
   - `blackbox.jobs` - Job management
   - `commitments` - On-chain storage
   - `flows` - High-level orchestrated operations

6. **Type Definitions** - All public interfaces/types
7. **Error Reference** - All error types and handling patterns
8. **Complete Examples** - End-to-end usage patterns

## Implementation

### 1. Create Generator Script

Create [`scripts/generate-llm-txt.js`](scripts/generate-llm-txt.js):

```javascript
// Node.js script that:
// - Reads source files to extract TSDoc comments
// - Reads existing documentation files
// - Generates structured plaintext output
// - Writes to docs-site/static/llm.txt
```

The script will:

- Read key source files (`src/index.ts`, `src/types/*.ts`, namespace index files)
- Extract function signatures and JSDoc comments
- Combine with content from README.md and docs/ files
- Output clean plaintext without markdown formatting noise

### 2. Content Template

The generated file will follow this structure:

```
CIFER SDK - Complete Reference for AI Agents
Generated: [timestamp]
Version: [package version]

================================================================================
OVERVIEW
================================================================================
[SDK description and capabilities]

================================================================================
INSTALLATION
================================================================================
[Package install commands]

================================================================================
INITIALIZATION
================================================================================
[createCiferSdk patterns with examples]

[...sections for each namespace...]

================================================================================
TYPES
================================================================================
[All type definitions with descriptions]

================================================================================
ERRORS
================================================================================
[All error types and handling]
```

### 3. Integration

Update [`package.json`](package.json) scripts:

```json
{
  "scripts": {
    "docs:llm": "node scripts/generate-llm-txt.js",
    "docs:build": "npm run build:types && npm run docs:api-report && npm run docs:typedoc && npm run docs:llm && cd docs-site && npm run build"
  }
}
```

## Files to Create/Modify

| Action | Path | Description |

|--------|------|-------------|

| Create | `scripts/generate-llm-txt.js` | Generator script |

| Modify | `package.json` | Add `docs:llm` script, update `docs:build` |

## Output Location

`docs-site/static/llm.txt` - Docusaurus serves static files at the root path, so it will be accessible at `/sdk/llm.txt` when deployed.

## Todos