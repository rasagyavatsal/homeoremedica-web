import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

describe('globals.css Theme Contract', () => {
  const cssPath = join(__dirname, '../app/globals.css');
  const cssContent = readFileSync(cssPath, 'utf-8');

  it('should not contain literal alpha values for border-color fallback', () => {
    // We expect it to use a var(--...) or at least not the literal / 0.9
    expect(cssContent).not.toMatch(/border-color:\s*hsl\(var\(--border\)\s*\/\s*0\.9\)/);
  });

  it('should not contain literal background radial gradient stops and opacities', () => {
    expect(cssContent).not.toMatch(/hsl\(var\(--primary\)\s*\/\s*0\.08\)/);
    expect(cssContent).not.toMatch(/transparent 30%/);
    expect(cssContent).not.toMatch(/hsl\(var\(--tertiary\)\s*\/\s*0\.06\)/);
    expect(cssContent).not.toMatch(/transparent 28%/);
  });

  it('should not contain literal selection alpha', () => {
    expect(cssContent).not.toMatch(/background:\s*hsl\(var\(--primary\)\s*\/\s*0\.18\)/);
  });

  it('should not contain literal scrollbar opacity utility classes', () => {
    expect(cssContent).not.toMatch(/bg-primary\/35/);
    expect(cssContent).not.toMatch(/bg-primary\/55/);
  });
});
