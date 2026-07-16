/**
 * User service - simplified for free app
 * No additional tracking needed - app is free for all users.
 */

import { getAdminDb } from '@/lib/firebase-admin';
import { UserDoc } from '@/lib/types/backend';
import { Timestamp } from 'firebase-admin/firestore';

export async function createOrUpdateUser(uid: string, email: string, name?: string): Promise<UserDoc> {
  try {
    const userRef = getAdminDb().collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data() as UserDoc;
      
      // Keep Firestore email/name in sync if they changed
      const updates: Record<string, any> = {};
      if (userData.email !== email) updates.email = email;
      if (name !== undefined && name !== userData.name) updates.name = name;
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = Timestamp.now();
        await userRef.update(updates);
        console.log(`Updated user ${uid} profile fields in Firestore: ${Object.keys(updates).join(', ')}`);
        return { ...userData, ...updates };
      }
      
      console.log(`User ${uid} already exists in Firestore`);
      return userData;
    }
    
    const now = Timestamp.now();
    const newUser: UserDoc = {
      email,
      name: name || '',
      createdAt: now,
      updatedAt: now
    };
    
    await userRef.set(newUser);
    console.log(`Created new user ${uid} in Firestore`);
    return newUser;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
}
