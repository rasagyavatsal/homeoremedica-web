import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { mockGetAdminAppCheck, mockVerifyToken } = vi.hoisted(() => ({
  mockGetAdminAppCheck: vi.fn(),
  mockVerifyToken: vi.fn(),
}));

vi.mock('@/lib/firebase-admin', () => ({
  getAdminAppCheck: () => mockGetAdminAppCheck(),
}));

import { checkAppCheck } from '../server';

function createRequest(token?: string) {
  const headers = new Headers();
  if (token) headers.set('x-firebase-appcheck', token);
  return new NextRequest('http://localhost:3000/api/find', {
    method: 'POST',
    headers,
  });
}

describe('checkAppCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    mockGetAdminAppCheck.mockReturnValue({ verifyToken: mockVerifyToken });
  });

  it('does nothing when App Check is off', async () => {
    await expect(checkAppCheck(createRequest())).resolves.toBe('off');
    expect(mockGetAdminAppCheck).not.toHaveBeenCalled();
  });

  it('reports a valid token in monitoring mode', async () => {
    vi.stubEnv('APP_CHECK_ENFORCEMENT_MODE', 'monitor');
    mockVerifyToken.mockResolvedValue({ appId: 'web-app' });

    await expect(checkAppCheck(createRequest('valid-token'))).resolves.toBe(
      'valid'
    );
    expect(mockVerifyToken).toHaveBeenCalledWith('valid-token');
  });

  it('logs but permits a missing token in monitoring mode', async () => {
    vi.stubEnv('APP_CHECK_ENFORCEMENT_MODE', 'monitor');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(checkAppCheck(createRequest())).resolves.toBe('missing');
    expect(warn).toHaveBeenCalledWith(
      '[App Check] missing token for POST /api/find'
    );
  });

  it('logs but permits an invalid token in monitoring mode', async () => {
    vi.stubEnv('APP_CHECK_ENFORCEMENT_MODE', 'monitor');
    mockVerifyToken.mockRejectedValue(new Error('Invalid token'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(checkAppCheck(createRequest('invalid-token'))).resolves.toBe(
      'invalid'
    );
    expect(warn).toHaveBeenCalledWith(
      '[App Check] invalid token for POST /api/find'
    );
  });

  it('rejects missing tokens in enforcement mode', async () => {
    vi.stubEnv('APP_CHECK_ENFORCEMENT_MODE', 'enforce');

    await expect(checkAppCheck(createRequest())).rejects.toMatchObject({
      code: 'APP_CHECK_REQUIRED',
    });
  });
});
