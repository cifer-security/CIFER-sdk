#!/usr/bin/env node

/**
 * Sync root CHANGELOG.md into the Docusaurus docs site.
 *
 * Output: docs-site/docs/changelog.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const sourcePath = path.join(ROOT_DIR, 'CHANGELOG.md');
const targetPath = path.join(ROOT_DIR, 'docs-site/docs/changelog.md');

const frontmatter = `---
sidebar_position: 6
title: Changelog
description: Version history and release notes for the CIFER SDK.
---

`;

const changelog = fs.readFileSync(sourcePath, 'utf-8');
fs.writeFileSync(targetPath, frontmatter + changelog);

console.log(`Synced changelog → ${targetPath}`);
