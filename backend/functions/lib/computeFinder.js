"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeFinder = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("./lib/firebase");
function reduceToOneDigit(num) {
    while (num > 9) {
        num = num
            .toString()
            .split('')
            .map((d) => parseInt(d, 10))
            .reduce((a, b) => a + b, 0);
    }
    return num === 0 ? 1 : num;
}
function nameNumberFromString(str) {
    const letters = str.toUpperCase().replace(/[^A-Z]/g, '');
    const map = {};
    const sequence = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let idx = 0;
    for (let code = 65; code <= 90; code++) {
        const ch = String.fromCharCode(code);
        map[ch] = sequence[idx % 9];
        idx++;
    }
    const sum = letters.split('').reduce((acc, ch) => acc + (map[ch] || 0), 0);
    return reduceToOneDigit(sum);
}
function dobNumberFromISO(dateIso) {
    const digits = dateIso.replace(/[^0-9]/g, '');
    const sum = digits.split('').reduce((a, b) => a + parseInt(b, 10), 0);
    return reduceToOneDigit(sum);
}
exports.computeFinder = functions
    .region('asia-south1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }
    const nameNumber = nameNumberFromString(`${data.fullName} ${data.motherName}`);
    const dobNumber = dobNumberFromISO(data.dateOfBirth);
    const ruleSnap = await firebase_1.db
        .collection('finder_rules')
        .where('nameNumber', '==', nameNumber)
        .where('dobNumber', '==', dobNumber)
        .limit(1)
        .get();
    if (ruleSnap.empty) {
        throw new functions.https.HttpsError('not-found', 'No matching rule found');
    }
    const rule = ruleSnap.docs[0].data();
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
        userRef: firebase_1.db.doc(`users/${context.auth.uid}`),
        submittedData: data,
        nameNumber,
        dobNumber,
        recommendedPrimary: rule.primaryGemstone,
        recommendedSecondary: rule.secondaryGemstone,
        createdAt: new Date(),
    };
    const saved = await firebase_1.db.collection('finder_requests').add(requestDoc);
    const readyMadeWhatsAppMessage = `Finder Request ${saved.id}: NameNo ${nameNumber}, DOBNo ${dobNumber}, Primary ${rule.primaryGemstone}, Secondary ${rule.secondaryGemstone}`;
    return { ...payload, readyMadeWhatsAppMessage, requestId: saved.id };
});
//# sourceMappingURL=computeFinder.js.map