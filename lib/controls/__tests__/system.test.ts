import { describe, it, expect } from 'vitest';
import { controlVariants } from '../system';

describe('Control System', () => {
  it('provides base interaction styles', () => {
    const base = controlVariants();
    expect(base).toContain('focus-visible:outline-none');
    expect(base).toContain('disabled:opacity-50');
  });

  it('supports sizing variants', () => {
    const sm = controlVariants({ size: 'sm' });
    expect(sm).toContain('h-control-sm');
    expect(sm).toContain('px-3');

    const defaultSize = controlVariants({ size: 'default' });
    expect(defaultSize).toContain('h-control');

    const lg = controlVariants({ size: 'lg' });
    expect(lg).toContain('h-control-lg');

    const icon = controlVariants({ size: 'icon' });
    expect(icon).toContain('h-control');
    expect(icon).toContain('w-control');

    const header = controlVariants({ size: 'header' });
    expect(header).toContain('min-h-touch');

    const headerIcon = controlVariants({ size: 'header-icon' });
    expect(headerIcon).toContain('h-control-sm');
    expect(headerIcon).toContain('w-control-sm');
  });

  it('supports shape variants', () => {
    const smShape = controlVariants({ shape: 'sm' });
    expect(smShape).toContain('rounded-sm');

    const defaultShape = controlVariants({ shape: 'default' });
    expect(defaultShape).toContain('rounded-md');

    const fullShape = controlVariants({ shape: 'full' });
    expect(fullShape).toContain('rounded-full');
  });
});
