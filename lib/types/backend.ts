import { Timestamp } from 'firebase-admin/firestore';

// User document in Firestore - simplified (app is free)
export interface UserDoc {
  email: string;
  name?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Note: UsageDoc removed - app is now free for all users, no usage tracking needed

// API Response types
export interface AuthSessionResponse {
  user: {
    uid: string;
    email: string;
  };
}

// Error response types
export interface ApiError {
  code: 'APP_CHECK_REQUIRED' | 'AUTH_REQUIRED' | 'INVALID_INPUT' | 'INTERNAL_ERROR' | 'NOT_FOUND' | 'UPSTREAM_UNAVAILABLE';
  message: string;
  details?: any;
}
