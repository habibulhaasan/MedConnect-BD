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

## Firestore Emulator Setup

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize emulators in project root
firebase init emulators
# Select: Firestore, Authentication
# Use default ports: Firestore=8080, Auth=9099

# Create firebase.json if not present (firebase init creates it)
# Verify: emulators.firestore.port = 8080, emulators.auth.port = 9099

# Start emulators
npm run emulator
# or:
firebase emulators:start --only firestore,auth

# Emulator UI: http://localhost:4000
```

### Connecting to emulator in development

Add to `src/lib/firebase/config.ts`:

```typescript
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
  const { connectFirestoreEmulator } = await import('firebase/firestore')
  const { connectAuthEmulator } = await import('firebase/auth')
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectAuthEmulator(auth, 'http://localhost:9099')
}
```

Add to `.env.local`:
```
NEXT_PUBLIC_USE_EMULATOR=true
```

<div align="center">
  <img src="public/icons/icon-192x192.png" width="80" alt="MedConnect BD Logo" />
  <h1>MedConnect BD</h1>
  <p>Professional contact management platform for Medical Technologists and Pharmacists in Bangladesh</p>
  <p>
    <a href="#features">Features</a> ·
    <a href="#tech-stack">Tech Stack</a> ·
    <a href="#local-development">Local Development</a> ·
    <a href="#deployment">Deployment</a> ·
    <a href="#admin-setup">Admin Setup</a>
  </p>
</div>

---

## Overview

MedConnect BD is a bilingual (Bangla/English) professional directory for Medical Technologists and Pharmacists across all 8 divisions of Bangladesh. Members register, pay a small fee via bKash, and get verified access to browse and contact fellow professionals.

**Live:** `https://your-project.vercel.app`

---

## Screenshots

| Home | Members | Profile | Admin |
|------|---------|---------|-------|
| ![Home](docs/screenshots/home.png) | ![Members](docs/screenshots/members.png) | ![Profile](docs/screenshots/profile.png) | ![Admin](docs/screenshots/admin.png) |

---

## Features {#features}

### For Members
- 📋 **4-step registration** with professional info, BD location cascade (Division → District → Upazila), profile photo
- 💳 **Manual bKash payment** — send ৳200 to admin, submit Transaction ID, admin verifies
- 👥 **Member directory** with search, filters (designation, division, district, blood group), pagination
- 📞 **One-tap contact** — call, WhatsApp (pre-filled Bangla greeting), email
- ⭐ **Favorites** — save and quickly access preferred contacts
- 🩸 **Blood donation tracking** — blood group, last donation date, reminder card
- 👤 **Profile management** — edit all fields, upload/change photo (compressed base64)
- 🌐 **Bilingual** — Bangla (default) + English, switchable in-app
- 📱 **PWA** — install to home screen, offline page

### For Admins
- 🔐 **Admin panel** protected by Firebase custom claims
- ✅ **Payment verification** — real-time queue, view TrxID + screenshot, approve/reject
- 📊 **Dashboard** — live stats (members, revenue, pending), designation breakdown
- 🗂️ **Member management** — sortable table, bulk actions, CSV export, edit/suspend/delete
- ⚙️ **App settings** — registration fee, bKash number, announcement banner
- 🔔 **Real-time updates** — `onSnapshot` for instant dashboard refresh

---

## Tech Stack {#tech-stack}

| Category | Technology |
|----------|-----------|
| Framework | Next.js 14+ (App Router, TypeScript strict) |
| Auth | Firebase Authentication (email/password) |
| Database | Firebase Firestore (free Spark plan) |
| Styling | Tailwind CSS + shadcn/ui |
| i18n | next-intl (Bangla + English) |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Notifications | Sonner (toasts) + shadcn Dialog (modals) |
| Images | browser-image-compression → base64 → Firestore |
| Payments | Manual bKash Send Money (NO API) |
| PWA | next-pwa (Workbox) |
| Hosting | Vercel (free tier) |
| CI/CD | GitHub Actions → Vercel CLI |

**Free tier constraints respected:**
- ❌ No Firebase Storage — photos stored as compressed base64 in Firestore
- ❌ No bKash PGW API — fully manual TrxID verification
- ❌ No paid external APIs

---

## Local Development {#local-development}

### 5-minute quick start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/medconnect-bd.git
cd medconnect-bd

# 2. Install dependencies
npm install

# 3. Copy and fill environment variables
cp .env.local.example .env.local
# Edit .env.local — see docs/ENV_SETUP.md for where to get each value

# 4. Start Firebase emulators (optional but recommended)
npm install -g firebase-tools
firebase login
firebase emulators:start --only firestore,auth
# Emulator UI: http://localhost:4000

# 5. Start development server
npm run dev
# App: http://localhost:3000
# Default redirect: http://localhost:3000/bn/home
```

### Available Scripts

```bash
npm run dev           # Start development server
npm run build         # Production build
npm run start         # Start production server locally
npm run lint          # ESLint check
npm run type-check    # TypeScript type check (no emit)
npm run test          # Run Jest tests
npm run test:watch    # Tests in watch mode
npm run test:coverage # Tests with coverage report
npm run analyze       # Bundle analyzer (ANALYZE=true build)
npm run generate-icons # Generate PWA icons from SVG source
npm run emulator      # Start Firebase emulators
```

---

## Firebase Project Setup

See the complete guide: **[docs/ENV_SETUP.md](docs/ENV_SETUP.md)**

Quick steps:
1. Create Firebase project (Spark plan — free)
2. Enable Firestore + Email/Password Auth
3. Get credentials → fill `.env.local`
4. Deploy rules & indexes: `npx ts-node scripts/setup-firebase.ts`
5. Set admin: `npx ts-node scripts/set-admin.ts YOUR_UID`

---

## Admin Setup {#admin-setup}

### Setting the first admin

```bash
# 1. Register through the app normally at /bn/register
# 2. Get your Firebase UID from Firebase Console → Authentication → Users
# 3. Run:
npx ts-node --project tsconfig.scripts.json scripts/set-admin.ts YOUR_UID_HERE

# 4. Manually activate your account in Firestore:
#    members/{your-uid} → status: "active", isVerified: true
# 5. Sign out and sign back in
# 6. You now have access to /admin/dashboard
```

### Adding more admins

In the Admin panel → Settings → Admin Users section, or via CLI:

```bash
npx ts-node --project tsconfig.scripts.json scripts/set-admin.ts NEW_ADMIN_UID
```

---

## Manual bKash Payment Flow {#bkash-flow}

MedConnect BD uses **manual bKash Send Money** — there is no API integration with bKash.

**How it works:**

1. **Member registers** → account created with `status: pending_payment`
2. **Step 4 shows instructions** — admin's bKash number and amount displayed prominently
3. **Member sends money** via bKash app → "Send Money" → admin's number
4. **Member submits TrxID** — enters Transaction ID from bKash SMS/app
5. **Admin verifies** — opens Admin Panel → Payments → clicks "Verify" on the payment row
6. **Admin checks** bKash app history to confirm the TrxID exists and amount is correct
7. **Admin approves** → `payment.status: verified`, `member.status: active`
8. **Member can now log in** and access the full directory

**Why manual?**
- bKash PGW (Payment Gateway) requires a registered business and monthly fees
- The manual flow works perfectly for small communities
- Admin verification takes < 24 hours

**Upgrading to bKash PGW (future):**
When revenue justifies the bKash business account:
1. Replace Step 4 with `bkash-checkout.js` SDK integration
2. Remove manual TrxID form
3. Keep admin approval step for member verification
4. `PaymentSubmission` schema remains compatible

---

## Deployment {#deployment}

### Vercel (Recommended)

```bash
# Option 1: Via Vercel dashboard
# Push to GitHub → import to Vercel → add env vars → deploy

# Option 2: Via CLI
npm install -g vercel
vercel login
vercel --prod
```

### Environment Variables for Vercel

Add all variables from `.env.local` to Vercel Dashboard → Project → Settings → Environment Variables.

**Critical:** `FIREBASE_ADMIN_PRIVATE_KEY` must be added with literal `\n` characters (not actual newlines) in the Vercel dashboard.

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
- **On any push/PR:** type check + lint + build + test
- **On push to `main`:** deploy to Vercel production

Required GitHub Secrets: see [docs/ENV_SETUP.md](docs/ENV_SETUP.md#step-13-set-up-cicd-optional-but-recommended)

---

## Project Structure

```
medconnect-bd/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (auth)/           # login, register, register/pending
│   │   │   ├── (dashboard)/      # home, members, favorites, profile, settings
│   │   │   ├── (admin)/          # admin/dashboard, payments, members, settings
│   │   │   ├── layout.tsx        # locale layout with SEO metadata
│   │   │   ├── error.tsx         # global error boundary
│   │   │   ├── not-found.tsx     # 404 page
│   │   │   └── loading.tsx       # full-page skeleton
│   │   ├── api/admin/            # approve-member, reject-payment, set-admin-claim
│   │   └── offline/              # PWA offline fallback page
│   ├── components/
│   │   ├── auth/                 # LoginForm, RegisterForm, steps, PendingPage
│   │   ├── member/               # MemberCard, MemberDetailModal, FilterBar, pages
│   │   ├── admin/                # AdminDashboard, PaymentRow, MemberTable, modals
│   │   ├── layout/               # DashboardLayout, Sidebar, BottomNav, TopBar
│   │   └── shared/               # ProfileAvatar, Badges, CopyButton, ErrorBoundary
│   ├── hooks/                    # useAuth, useMember, useMembers, useFavorites, useAppConfig
│   ├── lib/
│   │   ├── firebase/             # config, auth, firestore, admin, admin-api, persistence
│   │   ├── image/                # compress.ts (base64 pipeline)
│   │   ├── validations/          # auth.ts, member.ts, payment.ts (Zod schemas)
│   │   └── utils/                # cn, format, contact, sanitize, errorLogger, bd-data
│   ├── stores/                   # authStore, uiStore, registrationStore (Zustand)
│   ├── types/                    # index.ts (all TypeScript interfaces)
│   └── i18n/                     # en.json, bn.json
├── scripts/
│   ├── setup-firebase.ts         # Deploy rules, indexes, seed config
│   ├── set-admin.ts              # Grant/revoke admin custom claim
│   └── generate-icons.js         # Generate PWA icons from SVG
├── docs/
│   ├── ENV_SETUP.md              # Firebase + Vercel setup guide
│   ├── LAUNCH_CHECKLIST.md       # Pre-launch verification checklist
│   └── ANDROID_MIGRATION.md      # React Native conversion guide
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── icons/                    # Generated PWA icons (72–512px)
│   └── robots.txt                # SEO robots
├── firestore.rules               # Production security rules
├── firestore.indexes.json        # Composite indexes
├── firebase.json                 # Firebase CLI config
├── vercel.json                   # Vercel deployment config
└── .github/workflows/deploy.yml  # CI/CD pipeline
```

---

## Firestore Data Model

```
/members/{uid}
  uid: string
  fullName: string
  fullNameBn: string
  designation: 'mt_laboratory' | 'mt_dental' | 'mt_radiology' | 'mt_radiotherapy' | 'mt_physiotherapy' | 'pharmacist'
  regNumber: string
  mobile: string
  whatsapp?: string
  email?: string
  division: string
  district: string
  upazila: string
  institution: string
  officeAddress: string
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
  lastDonateDate?: string (ISO)
  profilePhotoBase64?: string (max ~80KB base64 JPEG)
  status: 'pending_payment' | 'pending_approval' | 'active' | 'suspended'
  isVerified: boolean
  favorites: string[] (array of member UIDs)
  joinedAt: Timestamp
  updatedAt: Timestamp

/payments/{auto-id}
  uid: string
  memberName: string
  mobile: string
  amount: number
  bkashTrxId: string
  bkashSenderNumber: string
  screenshotBase64?: string
  status: 'submitted' | 'verified' | 'rejected'
  adminNote?: string
  submittedAt: Timestamp
  reviewedAt?: Timestamp
  reviewedBy?: string (admin UID)

/app_config/config
  registrationFee: number
  adminBkashNumber: string
  adminBkashAccountName: string
  announcementEnabled: boolean
  announcementTextEn: string
  announcementTextBn: string

/deletion_requests/{uid}
  uid: string
  memberName: string
  mobile: string
  email: string
  requestedAt: Timestamp
  status: 'pending'
```

---

## Future Upgrade Paths

### bKash PGW Integration (when revenue justifies it)
1. Apply for bKash merchant account (requires trade license)
2. Install `bkash-checkout.js` SDK
3. Replace `Step4Payment.tsx` TrxID form with bKash checkout button
4. Add webhook handler at `/api/bkash/callback` to auto-verify payments
5. Keep admin approval for member activation (separate from payment)

### Firebase Storage (when on Blaze plan)
1. Remove `profilePhotoBase64` field from Firestore member docs
2. Upload to Firebase Storage → get download URL
3. Store `profilePhotoUrl: string` instead
4. Update `ProfileAvatar` to use Next.js `<Image>` with Firebase Storage domain
5. Add Firebase Storage security rules

### Full-Text Search
- Option A (free): Algolia free tier (10k records) — sync Firestore → Algolia
- Option B (free): Typesense self-hosted on Railway free tier
- Index: `fullName`, `fullNameBn`, `institution`, `regNumber`

### Android App
See complete migration guide: **[docs/ANDROID_MIGRATION.md](docs/ANDROID_MIGRATION.md)**

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes
4. Type check: `npx tsc --noEmit`
5. Lint: `npx next lint`
6. Test: `npm test`
7. Commit: `git commit -m 'feat: your feature description'`
8. Push: `git push origin feature/your-feature`
9. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ for Bangladesh's medical community</p>
  <p>বাংলাদেশের মেডিকেল পেশাদারদের জন্য তৈরি</p>
</div>