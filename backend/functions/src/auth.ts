import * as functions from 'firebase-functions';
import { db } from './lib/firebase';

export const onAuthCreate = functions
  .region('asia-south1')
  .auth.user().onCreate(async (user) => {
  const userDoc = db.collection('users').doc(user.uid);
  await userDoc.set({
    email: user.email ?? '',
    name: user.displayName ?? '',
    role: 'user',
    fcmTokens: [],
    language: 'EN',
    createdAt: new Date(),
  }, { merge: true });
});
