// Bootstrap seed script for GitHub Actions
// - Seeds app_settings/default with sensible defaults
// - Promotes OWNER_EMAIL to admin if user exists
// Usage: node backend/tools/bootstrap-seed.mjs

import admin from 'firebase-admin';

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const projectId = process.env.FIREBASE_PROJECT_ID;
const ownerEmail = (process.env.OWNER_EMAIL || '').toLowerCase();

if (!serviceAccountJson || !projectId) {
  console.error('Missing FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID');
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountJson);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId,
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function seed() {
  const defaults = {
    appName: 'RaaheDeen',
    whatsappNumber: '+918889544888',
    radioStreamUrl: 'https://raahedeen.in/live-radio-stream',
    donationUPI: 'raahedeen@upi',
    donationBankDetails: 'Account Name: RaaheDeen Foundation\nAccount No: 1234567890\nIFSC: HDFC0000000\nBank: HDFC Bank, Mumbai',
    donationQRImageUrl: 'https://raahedeen.in/assets/donation-qr.png',
    enabledLanguages: ['EN', 'HI', 'UR', 'AR']
  };

  await db.collection('app_settings').doc('default').set(defaults, { merge: true });
  console.log('app_settings/default seeded');

  if (ownerEmail) {
    try {
      const user = await auth.getUserByEmail(ownerEmail);
      await auth.setCustomUserClaims(user.uid, { role: 'admin' });
      await db.collection('users').doc(user.uid).set({ role: 'admin' }, { merge: true });
      console.log(`Promoted ${ownerEmail} to admin`);
    } catch (e) {
      console.log(`Owner email not found yet (${ownerEmail}). Sign up first, then re-run this job.`);
    }
  }
}

seed().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
