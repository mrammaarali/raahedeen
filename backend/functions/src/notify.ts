import * as functions from 'firebase-functions';
import { db, messaging } from './lib/firebase';

export const sendBroadcast = functions
  .region('asia-south1')
  .https.onCall(async (data: { title: string; body: string; language?: 'EN'|'HI'|'UR'|'AR'; type?: 'new_chapter'|'new_product'|'custom' }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }
    if (context.auth.token.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Admin only');
    }

    const { title, body, language, type } = data || {} as any;
    if (!title || !body) {
      throw new functions.https.HttpsError('invalid-argument', 'title and body are required');
    }

    let q = db.collection('users') as FirebaseFirestore.Query<FirebaseFirestore.DocumentData>;
    if (language) q = q.where('language', '==', language);
    const usersSnap = await q.get();

    const tokens: string[] = [];
    for (const doc of usersSnap.docs) {
      const userData = doc.data();
      const settingsSnap = await db.collection('user_settings').doc(doc.id).get();
      const toggles = settingsSnap.exists ? settingsSnap.data() || {} : {} as any;
      // Respect toggles where applicable. new_chapter -> notifyQuran, others allowed by default.
      const allow = type === 'new_chapter' ? toggles?.notifyQuran !== false : true;
      if (!allow) continue;
      if (Array.isArray(userData.fcmTokens)) tokens.push(...userData.fcmTokens);
    }

    const uniqueTokens = Array.from(new Set(tokens)).filter(Boolean);
    let successCount = 0;
    const size = 500;
    for (let i = 0; i < uniqueTokens.length; i += size) {
      const batch = uniqueTokens.slice(i, i + size);
      const resp = await messaging.sendEachForMulticast({
        tokens: batch,
        notification: { title, body },
        data: { type: type || 'custom' },
      });
      successCount += resp.successCount;
    }

    await db.collection('notifications_log').add({
      title, body, audience: { language, type }, sentAt: new Date(), successCount
    });

    return { sent: successCount, tokens: uniqueTokens.length };
  });
