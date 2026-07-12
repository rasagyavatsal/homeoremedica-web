import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import glob from 'fast-glob';

describe('Typography Recipe Migration', () => {
  it('should not contain scattered arbitrary eyebrow typographic settings', async () => {
    // Check components and app directory for the old inline styles
    const files = await glob(['components/**/*.tsx', 'app/**/*.tsx'], { 
      cwd: join(__dirname, '..'), 
      absolute: true 
    });
    
    let hasOldStyles = false;
    const oldPatterns = [
      /text-\[11px\]/,
      /tracking-\[0\.1[246]em\]/,
      /text-\[10px\]\s+uppercase/,
      /text-xs\s+font-semibold\s+uppercase\s+tracking/
    ];

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      for (const pattern of oldPatterns) {
        if (pattern.test(content)) {
          hasOldStyles = true;
          console.error(`Found old style in ${file} matching ${pattern}`);
        }
      }
    }

    expect(hasOldStyles).toBe(false);
  });

  it('does not use the eyebrow text recipe', async () => {
    const files = await glob(['components/**/*.tsx', 'app/**/*.tsx', 'app/globals.css'], {
      cwd: join(__dirname, '..'),
      absolute: true,
    });

    const offenders = files.filter((file) => readFileSync(file, 'utf-8').includes('text-eyebrow'));

    expect(offenders).toEqual([]);
  });
});
