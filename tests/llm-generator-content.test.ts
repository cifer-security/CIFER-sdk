import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const generatorPath = fileURLToPath(
  new URL('../scripts/generate-llm-txt.js', import.meta.url)
);

const generator = readFileSync(generatorPath, 'utf8');

describe('LLM documentation generator content', () => {
  it('uses Base mainnet for every chain-specific example', () => {
    expect(generator).toContain('chainId: 8453');
    expect(generator).toContain("name: 'Base'");
    expect(generator).toContain('https://mainnet.base.org');
    expect(generator).toContain('const base = defineChain({');
    expect(generator).toContain('chain: base');

    expect(generator).not.toContain('752025');
    expect(generator).not.toMatch(/ternoa/i);
  });
});
