# MedConnect BD

MedConnect BD is a comprehensive professional directory and networking platform for Medical Technologists and Pharmacists in Bangladesh. It features a secure registration flow, manual bKash payment verification, and a robust member search directory.

## Features

- **Multilingual Support**: Fully localized in Bangla (বাংলা) and English.
- **Secure Registration**: 4-step onboarding with professional verification.
- **Manual bKash Payment**: Streamlined payment submission and admin verification workflow.
- **Member Directory**: Search and filter by designation, division, and district.
- **Profile Management**: Base64-optimized profile photos (no external storage needed).
- **Admin Panel**: Real-time stats, payment verification, and member management.
- **PWA Ready**: Installable on Android and iOS devices.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS v4, shadcn/ui, motion/react.
- **Backend/Database**: Firebase (Authentication, Firestore).
- **State Management**: Zustand (Auth & Registration).
- **Internationalization**: next-intl.
- **Validation**: Zod + React Hook Form.

## Getting Started

### 1. Firebase Setup
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication** (Email/Password & Google).
3. Enable **Cloud Firestore**.
4. Register a Web App and copy the configuration to `.env.local`.

### 2. Environment Variables
Create a `.env.local` file with the following:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Installation
```bash
npm install
npm run dev
```

### 4. Deployment
The app is optimized for Vercel. Deploy with one click or via Vercel CLI.

## Admin Setup
To make a user an admin, find their UID in the Firebase Console and run:
```bash
npx ts-node scripts/set-admin.ts [USER_UID]
```

## Android Conversion
Refer to `docs/ANDROID_MIGRATION.md` for the blueprint to convert this web app into a native Android application using Expo.

## License
MIT
