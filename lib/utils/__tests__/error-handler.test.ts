import { describe, it, expect, vi } from 'vitest';
import { handleApiError, createApiError } from '../error-handler';
import { ZodError } from 'zod';

// Mock NextResponse.json
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({
      data,
      status: init?.status || 200,
    })),
  },
}));

describe('error-handler', () => {
  describe('handleApiError', () => {
    it('should handle known API errors with correct status codes', () => {
      const authError = { code: 'AUTH_REQUIRED', message: 'Unauthorized' };
      const response = handleApiError(authError) as any;
      expect(response.status).toBe(401);
      expect(response.data).toEqual(authError);

      const inputError = { code: 'INVALID_INPUT', message: 'Bad request' };
      const response2 = handleApiError(inputError) as any;
      expect(response2.status).toBe(400);

      const notFoundError = { code: 'NOT_FOUND', message: 'Not found' };
      const response3 = handleApiError(notFoundError) as any;
      expect(response3.status).toBe(404);

      const internalError = { code: 'INTERNAL_ERROR', message: 'Error' };
      const response4 = handleApiError(internalError) as any;
      expect(response4.status).toBe(500);
    });

    it('should handle Zod errors with status 400', () => {
      const zodError = new ZodError([{ 
        code: 'invalid_string', 
        path: ['email'], 
        message: 'Invalid email',
        validation: 'email'
      } as any]);
      
      const response = handleApiError(zodError) as any;
      expect(response.status).toBe(400);
      expect(response.data.code).toBe('INVALID_INPUT');
      expect(response.data.details).toEqual(zodError.issues);
    });

    it('should handle generic errors with status 500', () => {
      const error = new Error('Something went wrong');
      const response = handleApiError(error) as any;
      expect(response.status).toBe(500);
      expect(response.data.code).toBe('INTERNAL_ERROR');
    });

    it('should handle non-error objects with status 500', () => {
      const response = handleApiError('string error') as any;
      expect(response.status).toBe(500);
      expect(response.data.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('createApiError', () => {
    it('should create a correctly shaped ApiError object', () => {
      const error = createApiError('INVALID_INPUT', 'Test message', { field: 'name' });
      expect(error).toEqual({
        code: 'INVALID_INPUT',
        message: 'Test message',
        details: { field: 'name' }
      });
    });

    it('should handle missing details', () => {
      const error = createApiError('AUTH_REQUIRED', 'No token');
      expect(error).toEqual({
        code: 'AUTH_REQUIRED',
        message: 'No token'
      });
    });
  });
});
