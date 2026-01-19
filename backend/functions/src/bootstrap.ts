import * as functions from 'firebase-functions';
import { auth, db } from './lib/firebase';

type SeedInput = {
  ownerEmail: string;
  defaults?: Partial<{
    appName: string;
    whatsappNumber: string;
    radioStreamUrl: string;
    donationUPI: string;
    donationBankDetails: string;
    donationQRImageUrl: string;
    enabledLanguages: string[];
  }>;
};

async function anyAdminExists(): Promise<boolean> {
  const snap = await db.collection('users').where('role', '==', 'admin').limit(1).get();
  return !snap.empty;
}

export const bootstrapSeed = functions
  .region('asia-south1')
  .https.onCall(async (data: SeedInput, context) => {
    const requestedEmail = (data?.ownerEmail || '').toLowerCase();
    const ownerEnv = (process.env.OWNER_EMAIL || '').toLowerCase();
    const hasAdmin = await anyAdminExists();

    if (hasAdmin) {
      // After first admin exists, only admins may run this
      if (!context.auth || context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Admin only');
      }
    } else {
      // First-time bootstrap: allow if ownerEmail matches env
      if (!requestedEmail || requestedEmail !== ownerEnv) {
        throw new functions.https.HttpsError('permission-denied', 'Owner email mismatch');
      }
    }

    const defaults = {
      appName: 'RaaheDeen',
      whatsappNumber: '+918889544888',
      radioStreamUrl: 'https://raahedeen.in/live-radio-stream',
      donationUPI: 'raahedeen@upi',
      donationBankDetails: 'Account Name: RaaheDeen Foundation\nAccount No: 1234567890\nIFSC: HDFC0000000\nBank: HDFC Bank, Mumbai',
      donationQRImageUrl: 'https://raahedeen.in/assets/donation-qr.png',
      enabledLanguages: ['EN', 'HI', 'UR', 'AR'],
      ...(data?.defaults || {}),
    };

    await db.collection('app_settings').doc('default').set(defaults, { merge: true });

    if (!hasAdmin && requestedEmail) {
      // Promote first admin
      try {
        const u = await auth.getUserByEmail(requestedEmail);
        await auth.setCustomUserClaims(u.uid, { role: 'admin' });
        await db.collection('users').doc(u.uid).set({ role: 'admin' }, { merge: true });
      } catch (e) {
        throw new functions.https.HttpsError('failed-precondition', 'Owner user not found; sign up first then retry');
      }
    }

    return { ok: true };
  });
