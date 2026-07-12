import { overlayVariants, overlayBackdrop } from '../system';

describe('Overlay System', () => {
  it('provides a consistent scrim background', () => {
    const backdrop = overlayBackdrop();
    expect(backdrop).toContain('bg-scrim/60');
    expect(backdrop).toContain('fixed');
    expect(backdrop).toContain('inset-0');
    expect(backdrop).toContain('z-50');
    expect(backdrop).toContain('motion-overlay-backdrop');
  });

  it('provides base surface styles for overlays', () => {
    const surface = overlayVariants();
    expect(surface).toContain('z-50');
    expect(surface).toContain('border');
    expect(surface).toContain('border-foreground/25');
    expect(surface).not.toMatch(/\bshadow-/);
  });

  it('supports dialog variant', () => {
    const dialog = overlayVariants({ variant: 'dialog' });
    expect(dialog).toContain('fixed');
    expect(dialog).toContain('left-[50%]');
    expect(dialog).toContain('top-[50%]');
    expect(dialog).toContain('translate-x-[-50%]');
    expect(dialog).toContain('translate-y-[-50%]');
    expect(dialog).toContain('rounded-md');
    expect(dialog).toContain('bg-card');
    expect(dialog).toContain('motion-overlay-surface');
  });

  it('supports sheet variant', () => {
    const sheet = overlayVariants({ variant: 'sheet' });
    expect(sheet).toContain('fixed');
    expect(sheet).toContain('inset-x-0');
    expect(sheet).toContain('bottom-0');
    expect(sheet).toContain('rounded-t-md');
    expect(sheet).toContain('bg-card');
    expect(sheet).toContain('motion-overlay-sheet');
  });

  it('supports popover variant', () => {
    const popover = overlayVariants({ variant: 'popover' });
    expect(popover).toContain('rounded-md');
    expect(popover).toContain('bg-popover');
    expect(popover).toContain('p-4');
    expect(popover).toContain('motion-overlay-popover');
  });

  it('supports dropdown variant', () => {
    const dropdown = overlayVariants({ variant: 'dropdown' });
    expect(dropdown).toContain('rounded-md');
    expect(dropdown).toContain('bg-popover');
    expect(dropdown).toContain('p-1.5');
    expect(dropdown).toContain('motion-overlay-popover');
  });

  it('supports responsiveDialog variant', () => {
    const dialog = overlayVariants({ variant: 'responsiveDialog' });
    expect(dialog).toContain('fixed');
    expect(dialog).toContain('bottom-0');
    expect(dialog).toContain('left-1/2');
    expect(dialog).toContain('-translate-x-1/2');
    expect(dialog).toContain('bg-card');
    expect(dialog).toContain('text-foreground');
  });
});
