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
exports.setAdminRole = exports.makeAdmin = exports.listUsers = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("./lib/firebase");
exports.listUsers = functions
    .region('asia-south1')
    .https.onCall(async (data, context) => {
    if (context.auth?.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Admin only');
    }
    const users = await firebase_1.auth.listUsers();
    return users.users.map(u => ({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        creationTime: u.metadata.creationTime
    }));
});
exports.makeAdmin = functions
    .region('asia-south1')
    .https.onCall(async (data) => {
    try {
        const user = await firebase_1.auth.getUserByEmail(data.email);
        await firebase_1.auth.setCustomUserClaims(user.uid, { role: 'admin' });
        return { message: `Success! ${data.email} is now an admin.` };
    }
    catch (error) {
        console.error(error);
        throw new functions.https.HttpsError('internal', 'An error occurred');
    }
});
exports.setAdminRole = functions
    .region('asia-south1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }
    if (context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Admin only');
    }
    const { uid, makeAdmin } = data || {};
    if (!uid) {
        throw new functions.https.HttpsError('invalid-argument', 'uid is required');
    }
    await firebase_1.auth.setCustomUserClaims(uid, { role: makeAdmin ? 'admin' : 'user' });
    return { uid, role: makeAdmin ? 'admin' : 'user' };
});
//# sourceMappingURL=admin.js.map