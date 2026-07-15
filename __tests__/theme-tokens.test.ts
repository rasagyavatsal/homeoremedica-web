import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import glob from 'fast-glob';

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

  it('uses a true-black dark canvas token', () => {
    expect(cssContent).toMatch(/\.dark\s*\{[\s\S]*--background:\s*0\s+0%\s+0%;/);
  });

  it('keeps raw color values out of route and component files', async () => {
    const files = await glob(['app/**/*.tsx', 'components/**/*.tsx'], {
      cwd: join(__dirname, '..'),
      absolute: true,
    });

    const offenders = files.filter((file) => {
      const content = readFileSync(file, 'utf-8');
      return /#[0-9a-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i.test(content);
    });

    expect(offenders).toEqual([]);
  });

  it('keeps arbitrary visual utility values out of product UI', async () => {
    const files = await glob(
      ['app/**/*.tsx', 'components/**/*.tsx', 'lib/{controls,overlay,motion}/**/*.ts'],
      {
        cwd: join(__dirname, '..'),
        absolute: true,
        ignore: ['**/__tests__/**', '**/*.test.*'],
      },
    );
    const arbitraryVisualValue =
      /(?:text|tracking|border|bg|w|h|max-w|min-h|top|left|right|bottom|translate|rounded|gap|grid-cols|flex|p[trblxy]?|m[trblxy]?)-\[[^\]]+\]/;
    const offenders = files.filter((file) => arbitraryVisualValue.test(readFileSync(file, 'utf-8')));

    expect(offenders).toEqual([]);
  });
});
