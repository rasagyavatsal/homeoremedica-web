import { describe, it, expect, vi, beforeEach } from 'vitest';
import { changePassword } from '../firebase-auth';

const { mockChangePassword } = vi.hoisted(() => ({
  mockChangePassword: vi.fn(),
}));

vi.mock('@homeoremedica/shared', () => ({
  createFirebaseAuthCore: vi.fn(() => ({
    changePassword: mockChangePassword,
  })),
  mapFirebaseUser: vi.fn(),
}));

vi.mock('../../firebase', () => ({
  auth: {}
}));

describe('changePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates changePassword to the core adapter and propagates errors', async () => {
    mockChangePassword.mockRejectedValue(new Error('Password does not meet minimum requirements'));
    
    await expect(changePassword('old-pass', 'weak')).rejects.toThrow('Password does not meet minimum requirements');
    expect(mockChangePassword).toHaveBeenCalledWith('old-pass', 'weak');
  });
});
