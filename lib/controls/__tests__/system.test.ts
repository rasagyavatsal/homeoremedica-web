import { describe, it, expect } from 'vitest';
import { controlVariants } from '../system';

describe('Control System', () => {
  it('provides base interaction styles', () => {
    const base = controlVariants();
    expect(base).toContain('focus-visible:outline-none');
    expect(base).toContain('focus-visible:ring-2');
    expect(base).toContain('disabled:opacity-50');
  });

  it('supports sizing variants', () => {
    const sm = controlVariants({ size: 'sm' });
    expect(sm).toContain('h-9');
    expect(sm).toContain('px-3');

    const defaultSize = controlVariants({ size: 'default' });
    expect(defaultSize).toContain('h-11');

    const lg = controlVariants({ size: 'lg' });
    expect(lg).toContain('h-12');

    const icon = controlVariants({ size: 'icon' });
    expect(icon).toContain('h-10');
    expect(icon).toContain('w-10');

    const header = controlVariants({ size: 'header' });
    expect(header).toContain('min-h-9');

    const headerIcon = controlVariants({ size: 'header-icon' });
    expect(headerIcon).toContain('h-9');
    expect(headerIcon).toContain('w-9');
  });

  it('supports shape variants', () => {
    const smShape = controlVariants({ shape: 'sm' });
    expect(smShape).toContain('rounded-md');

    const defaultShape = controlVariants({ shape: 'default' });
    expect(defaultShape).toContain('rounded-lg');

    const fullShape = controlVariants({ shape: 'full' });
    expect(fullShape).toContain('rounded-full');
  });
});
