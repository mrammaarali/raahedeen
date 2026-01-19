import * as functions from 'firebase-functions';
import { auth } from './lib/firebase';

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
