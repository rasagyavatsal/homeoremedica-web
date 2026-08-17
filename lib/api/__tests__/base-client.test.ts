import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient } from '../base-client';

describe('ApiClient', () => {
  let client: ApiClient;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = new ApiClient('http://localhost:3000/api');
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mockFetchResponse(body: any, status = 200) {
    fetchSpy.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      text: () => Promise.resolve(JSON.stringify(body)),
    });
  }

  describe('request() headers', () => {
    it('adds Content-Type header to every request', async () => {
      mockFetchResponse({ user: { uid: 'u1' } });
      await client.getSession();

      const [, options] = fetchSpy.mock.calls[0];
      expect(options.headers['Content-Type']).toBe('application/json');
    });

    it('adds Authorization header when auth token is set', async () => {
      client.setAuthToken('my-token');
      mockFetchResponse({ user: { uid: 'u1' } });
      await client.getSession();

      const [, options] = fetchSpy.mock.calls[0];
      expect(options.headers.Authorization).toBe('Bearer my-token');
    });

    it('omits Authorization header when setAuthToken(null) is called', async () => {
      client.setAuthToken('my-token');
      client.setAuthToken(null);
      mockFetchResponse({ user: { uid: 'u1' } });
      await client.getSession();

      const [, options] = fetchSpy.mock.calls[0];
      expect(options.headers.Authorization).toBeUndefined();
    });

    it('adds an App Check token when a token provider is configured', async () => {
      client = new ApiClient(
        'http://localhost:3000/api',
        async () => 'app-check-token'
      );
      mockFetchResponse({ user: { uid: 'u1' } });

      await client.getSession();

      const [, options] = fetchSpy.mock.calls[0];
      expect(options.headers['X-Firebase-AppCheck']).toBe('app-check-token');
    });

    it('omits the App Check header when no token is available', async () => {
      client = new ApiClient(
        'http://localhost:3000/api',
        async () => null
      );
      mockFetchResponse({ user: { uid: 'u1' } });

      await client.getSession();

      const [, options] = fetchSpy.mock.calls[0];
      expect(options.headers['X-Firebase-AppCheck']).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('throws structured error object for non-OK responses', async () => {
      mockFetchResponse(
        { code: 'AUTH_REQUIRED', message: 'Auth needed' },
        401
      );

      await expect(client.getSession()).rejects.toEqual({
        code: 'AUTH_REQUIRED',
        message: 'Auth needed',
      });
    });

    it('throws generic error for non-JSON error responses', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      await expect(client.getSession()).rejects.toEqual({
        code: 'INTERNAL_ERROR',
        message: 'The server could not complete the request. Please try again.',
        details: { status: 500 },
      });
    });

    it('never exposes an HTML error document to callers', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('<!DOCTYPE html><html><body>secret stack trace</body></html>'),
      });

      await expect(client.getSession()).rejects.not.toMatchObject({
        message: expect.stringContaining('secret stack trace'),
      });
    });
  });

  describe('getSession()', () => {
    it('calls POST /auth/session without name', async () => {
      mockFetchResponse({ user: { uid: 'u1', email: 'a@b.com' } });
      await client.getSession();

      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe('http://localhost:3000/api/auth/session');
      expect(options.method).toBe('POST');
    });

    it('calls POST /auth/session with name in body', async () => {
      mockFetchResponse({ user: { uid: 'u1', email: 'a@b.com' } });
      await client.getSession('John');

      const [, options] = fetchSpy.mock.calls[0];
      expect(JSON.parse(options.body)).toEqual({ name: 'John' });
    });
  });
});
