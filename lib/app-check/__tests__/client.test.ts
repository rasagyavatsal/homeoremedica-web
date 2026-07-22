import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetToken, mockInitializeAppCheck } = vi.hoisted(() => ({
  mockGetToken: vi.fn(),
  mockInitializeAppCheck: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({
  default: { name: 'test-app' },
}));

vi.mock('firebase/app-check', () => ({
  getToken: mockGetToken,
  initializeAppCheck: mockInitializeAppCheck,
  ReCaptchaEnterpriseProvider: class ReCaptchaEnterpriseProvider {
    constructor(readonly siteKey: string) {}
  },
}));

describe('getAppCheckToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('returns null when App Check is not configured', async () => {
    const { getAppCheckToken } = await import('../client');

    await expect(getAppCheckToken()).resolves.toBeNull();
    expect(mockInitializeAppCheck).not.toHaveBeenCalled();
  });

  it('initializes reCAPTCHA Enterprise once and returns its token', async () => {
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY', 'site-key');
    mockInitializeAppCheck.mockReturnValue({ name: 'app-check' });
    mockGetToken.mockResolvedValue({ token: 'verified-token' });
    const { getAppCheckToken } = await import('../client');

    expect(mockInitializeAppCheck).toHaveBeenCalledTimes(1);
    await expect(getAppCheckToken()).resolves.toBe('verified-token');
    await expect(getAppCheckToken()).resolves.toBe('verified-token');

    expect(mockInitializeAppCheck).toHaveBeenCalledTimes(1);
    expect(mockGetToken).toHaveBeenCalledTimes(2);
  });

  it('allows monitoring requests to continue when attestation fails', async () => {
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY', 'site-key');
    mockInitializeAppCheck.mockReturnValue({ name: 'app-check' });
    mockGetToken.mockRejectedValue(new Error('Attestation unavailable'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { getAppCheckToken } = await import('../client');

    await expect(getAppCheckToken()).resolves.toBeNull();
    expect(warn).toHaveBeenCalledWith(
      'App Check token unavailable; continuing without attestation.'
    );
  });
});
