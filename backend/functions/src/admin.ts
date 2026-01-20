import * as functions from 'firebase-functions';
import { auth } from './lib/firebase';

export const listUsers = functions
  .region('asia-south1')
  .https.onCall(async (data, context) => {
    if (context.auth?.token.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Admin only');
    }
    const users = await auth.listUsers();
    return users.users.map(u => ({ 
      uid: u.uid, 
      email: u.email, 
      displayName: u.displayName, 
      creationTime: u.metadata.creationTime 
    }));
  });

// Temporary function to make the first admin.
// Deploy, call once with your email, then remove this function.
export const makeAdmin = functions
  .region('asia-south1')
  .https.onCall(async (data: { email: string }) => {
    try {
      const user = await auth.getUserByEmail(data.email);
      await auth.setCustomUserClaims(user.uid, { role: 'admin' });
      return { message: `Success! ${data.email} is now an admin.` };
    } catch (error) {
      console.error(error);
      throw new functions.https.HttpsError('internal', 'An error occurred');
    }
  });

export const setAdminRole = functions
  .region('asia-south1')
  .https.onCall(async (data: { uid: string; makeAdmin: boolean }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }
    if (context.auth.token.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Admin only');
    }
    const { uid, makeAdmin } = data || ({} as any);
    if (!uid) {
      throw new functions.https.HttpsError('invalid-argument', 'uid is required');
    }
    await auth.setCustomUserClaims(uid, { role: makeAdmin ? 'admin' : 'user' });
    return { uid, role: makeAdmin ? 'admin' : 'user' };
  });
