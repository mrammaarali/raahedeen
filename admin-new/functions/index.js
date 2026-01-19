const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Callable function to set/unset a user as an admin.
 * - Expects `email` and `makeAdmin` (boolean) in the data payload.
 * - Checks if the caller is already an admin before proceeding.
 */
exports.setAdmin = functions.https.onCall(async (data, context) => {
  // 1. Check if the request is made by an authenticated user.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  // 2. Check if the authenticated user is an admin.
  if (context.auth.token.admin !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admins can modify user roles."
    );
  }

  const { email, makeAdmin } = data;

  try {
    const user = await admin.auth().getUserByEmail(email);
    // 3. Set the custom claim.
    await admin.auth().setCustomUserClaims(user.uid, { admin: makeAdmin });

    // 4. Update the role in Firestore for easier client-side checks.
    await admin.firestore().collection("users").doc(user.uid).set(
      {
        role: makeAdmin ? "admin" : "user",
      },
      { merge: true }
    );

    return {
      message: `Success! ${email} has been ${makeAdmin ? 'made an' : 'removed as an'} admin.`,
    };
  } catch (error) {
    console.error("Error setting custom claim:", error);
    throw new functions.https.HttpsError("internal", "An internal error occurred while setting the user role.");
  }
});

/**
 * Trigger to create a user document in Firestore upon new user signup.
 * This ensures every user has a profile and a default role.
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    try {
        await admin.firestore().collection("users").doc(user.uid).set({
            email: user.email,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            role: 'user' // Default role
        }, { merge: true });
        console.log(`User document created for ${user.email} with role 'user'`);
    } catch (error) {
        console.error(`Error creating user document for ${user.uid}:`, error);
    }
});
