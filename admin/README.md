# RaaheDeen Admin Panel Guide

This guide provides basic instructions for using the RaaheDeen Admin Panel.

## 1. How to Log In

1.  Navigate to the admin panel URL.
2.  You will be presented with a login screen.
3.  Enter the email and password for an account that has been granted `admin` privileges.
4.  Upon successful login, you will be redirected to the admin dashboard.

**Note:** To grant a user admin privileges, you must set a custom claim on their Firebase Authentication user object. This can be done via the Firebase Admin SDK in a secure backend environment (e.g., a Cloud Function).

Example (for backend setup):
```javascript
// In a secure environment (like a Cloud Function)
const admin = require('firebase-admin');

admin.auth().setCustomUserClaims(uid, { admin: true });
```

## 2. How to Add Audiobook Chapters

1.  From the sidebar, navigate to the **Chapters** page.
2.  Click the **Add New Chapter** button.
3.  A form will appear. Fill in the following details:
    *   **Title:** The name of the chapter.
    *   **Description:** A short summary.
    *   **Order:** A number to determine the chapter's position in the list (lower numbers appear first).
    *   **Audio URL:** The direct URL to the MP3 file.
    *   **Free:** Check this box if the chapter is free for all users.
    *   **Active:** Check this box to make the chapter visible in the app.
4.  Click **Save**.

To edit or delete a chapter, use the **Edit** and **Delete** buttons next to each item in the table.

## 3. How to Add Products & FAQs

### Adding a Product

1.  From the sidebar, navigate to the **Products** page.
2.  Click the **Add New Product** button.
3.  Fill in the product details in the form:
    *   **Name, Category, Description, etc.**
    *   **Images:** Provide up to 6 direct URLs for the product images.
    *   **WhatsApp Message Template:** Create a pre-filled message. Use `{productName}` and `{productId}` as placeholders.
4.  Click **Save Product**.

### Managing FAQs for a Product

1.  On the **Products** page, find the product in the list.
2.  Click the **FAQs** button for that product.
3.  A new section will appear below the product table for managing its FAQs.
4.  Click **Add FAQ** to create a new question and answer.
5.  Use the **Edit** and **Delete** buttons to manage existing FAQs for that specific product.

## 4. How to Edit Gemstone Rules

1.  From the sidebar, navigate to the **Finder Rules** page.
2.  The table displays all the rules based on `nameNumber` and `dobNumber`.
3.  Click the **Edit** button next to the rule you want to modify.
4.  Update the details in the form that appears.
5.  Click **Save Rule**.

## 5. How to Send Push Notifications

1.  From the sidebar, navigate to the **Users** page.
2.  At the bottom of the page, you will find the **Send Push Notification** form.
3.  Fill in the details:
    *   **Title:** The notification title.
    *   **Body:** The main message of the notification.
    *   **Target:** Choose to send to `All Users` or target users by their selected language (`EN`, `HI`, `UR`, `AR`).
4.  Click **Send Notification**.

## Important: Required Firebase Cloud Functions

For the **Users & Notifications** section to work, you must deploy the following Firebase Cloud Functions to your project:

1.  `listUsers`: A callable function that uses the Firebase Admin SDK to list all authenticated users. This is required to populate the users table.
2.  `setUserAdmin`: A callable function that takes a `uid` and uses the Admin SDK to set a custom claim (`{ admin: true }`) for that user.
3.  `sendPushNotification`: A callable function that takes a `title`, `body`, and `target`, and uses the Admin SDK to send a message via Firebase Cloud Messaging (FCM).

Without these backend functions, the corresponding features in the admin panel will fail.
