import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

describe('Raw Palette Audits', () => {
  it('callout should not use raw emerald or amber classes', () => {
    const calloutPath = join(__dirname, '../components/ui/callout.tsx');
    const calloutContent = readFileSync(calloutPath, 'utf-8');
    
    expect(calloutContent).not.toMatch(/\bemerald-/);
    expect(calloutContent).not.toMatch(/\bamber-/);
  });
  
  it('overlay system should not use raw slate classes', () => {
    const systemPath = join(__dirname, '../lib/overlay/system.ts');
    const systemContent = readFileSync(systemPath, 'utf-8');
    
    expect(systemContent).not.toMatch(/\bslate-/);
  });
});
