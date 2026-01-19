import * as functions from 'firebase-functions';
import { db } from './lib/firebase';

type FinderInput = {
  fullName: string;
  dateOfBirth: string; // ISO date string
  timeOfBirth?: string;
  motherName: string;
  birthPlace: string;
  gender: string;
  preferredLanguage: 'EN' | 'HI' | 'UR' | 'AR';
};

function reduceToOneDigit(num: number): number {
  while (num > 9) {
    num = num
      .toString()
      .split('')
      .map((d) => parseInt(d, 10))
      .reduce((a, b) => a + b, 0);
  }
  return num === 0 ? 1 : num;
}

function nameNumberFromString(str: string): number {
  const letters = str.toUpperCase().replace(/[^A-Z]/g, '');
  // Pythagorean numerology mapping A1..I9, J1..R9, S1..Z8
  const map: Record<string, number> = {};
  const sequence = [1,2,3,4,5,6,7,8,9];
  let idx = 0;
  for (let code = 65; code <= 90; code++) {
    const ch = String.fromCharCode(code);
    map[ch] = sequence[idx % 9];
    idx++;
  }
  const sum = letters.split('').reduce((acc, ch) => acc + (map[ch] || 0), 0);
  return reduceToOneDigit(sum);
}

function dobNumberFromISO(dateIso: string): number {
  const digits = dateIso.replace(/[^0-9]/g, '');
  const sum = digits.split('').reduce((a, b) => a + parseInt(b, 10), 0);
  return reduceToOneDigit(sum);
}

export const computeFinder = functions
  .region('asia-south1')
  .https.onCall(async (data: FinderInput, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
  }

  const nameNumber = nameNumberFromString(`${data.fullName} ${data.motherName}`);
  const dobNumber = dobNumberFromISO(data.dateOfBirth);

  const ruleSnap = await db
    .collection('finder_rules')
    .where('nameNumber', '==', nameNumber)
    .where('dobNumber', '==', dobNumber)
    .limit(1)
    .get();

  if (ruleSnap.empty) {
    throw new functions.https.HttpsError('not-found', 'No matching rule found');
  }

  const rule = ruleSnap.docs[0].data() as any;

  const payload = {
    primaryGemstone: rule.primaryGemstone,
    secondaryGemstone: rule.secondaryGemstone,
    explanation: rule.explanation,
    personality: rule.personality ?? '',
    strengths: rule.strengths ?? '',
    challenges: rule.challenges ?? '',
    howToWear: rule.howToWear ?? '',
    disclaimer: rule.disclaimer ?? '',
  };

  const requestDoc = {
    userRef: db.doc(`users/${context.auth.uid}`),
    submittedData: data,
    nameNumber,
    dobNumber,
    recommendedPrimary: rule.primaryGemstone,
    recommendedSecondary: rule.secondaryGemstone,
    createdAt: new Date(),
  };

  const saved = await db.collection('finder_requests').add(requestDoc);

  // Build WhatsApp message using app_settings.whatsappNumber on client; here we return a ready template.
  const readyMadeWhatsAppMessage = `Finder Request ${saved.id}: NameNo ${nameNumber}, DOBNo ${dobNumber}, Primary ${rule.primaryGemstone}, Secondary ${rule.secondaryGemstone}`;

  return { ...payload, readyMadeWhatsAppMessage, requestId: saved.id };
});
