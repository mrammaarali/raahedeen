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
exports.bootstrapSeed = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("./lib/firebase");
async function anyAdminExists() {
    const snap = await firebase_1.db.collection('users').where('role', '==', 'admin').limit(1).get();
    return !snap.empty;
}
exports.bootstrapSeed = functions
    .region('asia-south1')
    .https.onCall(async (data, context) => {
    const requestedEmail = (data?.ownerEmail || '').toLowerCase();
    const ownerEnv = (process.env.OWNER_EMAIL || '').toLowerCase();
    const hasAdmin = await anyAdminExists();
    if (hasAdmin) {
        if (!context.auth || context.auth.token.role !== 'admin') {
            throw new functions.https.HttpsError('permission-denied', 'Admin only');
        }
    }
    else {
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
    await firebase_1.db.collection('app_settings').doc('default').set(defaults, { merge: true });
    if (!hasAdmin && requestedEmail) {
        try {
            const u = await firebase_1.auth.getUserByEmail(requestedEmail);
            await firebase_1.auth.setCustomUserClaims(u.uid, { role: 'admin' });
            await firebase_1.db.collection('users').doc(u.uid).set({ role: 'admin' }, { merge: true });
        }
        catch (e) {
            throw new functions.https.HttpsError('failed-precondition', 'Owner user not found; sign up first then retry');
        }
    }
    return { ok: true };
});
//# sourceMappingURL=bootstrap.js.map