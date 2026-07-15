import { overlayVariants, overlayBackdrop, overlayRecipes } from '../system';

describe('Overlay System', () => {
  it('provides a calm, consistent scrim', () => {
    const backdrop = overlayBackdrop();
    expect(backdrop).toContain('bg-scrim/70');
    expect(backdrop).toContain('backdrop-blur-sm');
    expect(backdrop).toContain('fixed');
    expect(backdrop).toContain('inset-0');
    expect(backdrop).toContain('motion-overlay-backdrop');
  });

  it('can contain a scrim inside a positioned preview', () => {
    const backdrop = overlayBackdrop({ contained: true });

    expect(backdrop).toContain('absolute');
    expect(backdrop).not.toContain('fixed');
  });

  it('uses semantic surface and depth tokens', () => {
    const surface = overlayVariants();
    expect(surface).toContain('border-border');
    expect(surface).toContain('bg-popover');
    expect(surface).toContain('shadow-overlay');
  });

  it('supports centered dialogs through a token-backed position recipe', () => {
    const dialog = overlayVariants({ variant: 'dialog' });
    expect(dialog).toContain('fixed');
    expect(dialog).toContain('overlay-dialog-position');
    expect(dialog).toContain('rounded-xl');
    expect(dialog).toContain('motion-overlay-surface');
  });

  it('supports mobile sheets', () => {
    const sheet = overlayVariants({ variant: 'sheet' });
    expect(sheet).toContain('overlay-sheet-position');
    expect(sheet).toContain('bottom-0');
    expect(sheet).toContain('rounded-t-xl');
    expect(sheet).toContain('motion-overlay-sheet');
  });

  it('supports popovers and dropdowns', () => {
    const popover = overlayVariants({ variant: 'popover' });
    const dropdown = overlayVariants({ variant: 'dropdown' });
    expect(popover).toContain('rounded-lg');
    expect(popover).toContain('p-4');
    expect(dropdown).toContain('rounded-lg');
    expect(dropdown).toContain('min-w-48');
    expect(dropdown).toContain('motion-overlay-popover');
  });

  it('supports responsive dialogs and tokenized picker dimensions', () => {
    const dialog = overlayVariants({ variant: 'responsiveDialog' });
    expect(dialog).toContain('overlay-responsive-position');
    expect(dialog).toContain('bottom-0');
    expect(dialog).toContain('sm:rounded-xl');
    expect(overlayRecipes.picker.viewport).toContain('overlay-picker-viewport');
  });
});
