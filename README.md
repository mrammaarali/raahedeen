# RaaheDeen Monorepo

Production-ready Islamic lifestyle + gemstone system.

- Mobile: Flutter app (Android first)
- Admin: Next.js web admin panel
- Backend: Firebase (Auth, Firestore, Cloud Functions, Storage, FCM)

## Structure

- mobile/ — Flutter app
- admin/ — Next.js admin panel
- backend/ — Firebase config and Cloud Functions
- shared/ — Shared types/constants (optional)

## Prerequisites

- Node.js 18+
- PNPM or NPM
- Firebase CLI (`npm i -g firebase-tools`)
- Flutter 3.x SDK
- Android Studio (for Android build)

## Firebase Setup

1. Create a Firebase project (e.g., `raahedeen-prod`).
2. Enable: Authentication (Email/Password), Firestore, Storage, Cloud Functions, Cloud Messaging.
3. Copy `backend/.env.sample` to `backend/functions/.env` and fill values.
4. Update `backend/.firebaserc` (will be generated after `firebase init`) with your project id.
5. Deploy:
   - `cd backend`
   - `npm i` in `functions` (or `pnpm i`)
   - `firebase deploy` (or `firebase deploy --only functions,firestore:rules,storage`)

## Mobile (Flutter)

- Install Flutter SDK and Android tooling.
- Configure Firebase for Android using FlutterFire:
  - `cd mobile`
  - `flutter pub get`
  - `dart run flutterfire_cli configure` (select your Firebase project)
- Run:
  - `flutter run -d android`

## Admin (Next.js)

- `cd admin`
- `npm i` (or `pnpm i`)
- Copy `.env.local.example` to `.env.local` and fill Firebase web config.
- Run dev: `npm run dev`
- Build: `npm run build` then `npm start`

## Collections (Firestore)

- app_settings
- users
- user_settings
- chapters
- playback_progress
- products
- product_faqs
- finder_rules
- finder_requests
- duas
- notifications_log (optional)

See inline comments in code for field details.

## Functions Overview

- `computeFinder` (callable): calculates nameNumber/dobNumber (1–9), fetches matching `finder_rules`, writes `finder_requests`, returns recommendation and WhatsApp message.
- `sendBroadcast` (HTTP): admin-only; sends FCM broadcast honoring `user_settings` toggles and optional language filter.
- `onAuthCreate` (trigger): creates initial user document.

## Theming & i18n

- Dark navy/charcoal theme with gold accents.
- Languages: EN / HI / UR / AR. RTL for AR/UR.

## Notes

- Some values (e.g., WhatsApp number, radio stream URL, donation details) are stored in `app_settings/default`.
- Admin role: set custom claim `role=admin` via function or Firebase console. Admin UI requires the claim.
