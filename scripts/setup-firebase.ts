#!/usr/bin/env ts-node
/**
 * MedConnect BD — Firebase Setup Script
 *
 * Deploys Firestore rules, indexes, and seeds initial config.
 *
 * Usage:
 *   npx ts-node --project tsconfig.scripts.json scripts/setup-firebase.ts
 *
 * Prerequisites:
 *   1. Firebase CLI installed: npm install -g firebase-tools
 *   2. Logged in: firebase login
 *   3. .env.local filled with Firebase Admin credentials
 *   4. .firebaserc updated with your project ID
 */

import { execSync } from 'child_process'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

if (!projectId || !clientEmail || !privateKey) {
  console.error('\n❌ Missing Firebase Admin credentials in .env.local')
  console.error('   Required: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY\n')
  process.exit(1)
}

// ─── Initialize Admin SDK ──────────────────────────────────────────────────

const app =
  getApps().find((a) => a.name === 'setup') ??
  initializeApp(
    { credential: cert({ projectId, clientEmail, privateKey }), projectId },
    'setup'
  )

const db = getFirestore(app)

// ─── Helper ────────────────────────────────────────────────────────────────

function run(cmd: string, label: string): void {
  console.log(`\n🔧 ${label}...`)
  try {
    execSync(cmd, { stdio: 'inherit', cwd: path.resolve(__dirname, '..') })
    console.log(`   ✅ Done`)
  } catch {
    console.error(`   ❌ Failed: ${cmd}`)
    process.exit(1)
  }
}

// ─── Deploy Rules ──────────────────────────────────────────────────────────

async function deployRules(): Promise<void> {
  run(
    'npx firebase deploy --only firestore:rules --project ' + projectId,
    'Deploying Firestore security rules'
  )
}

// ─── Deploy Indexes ────────────────────────────────────────────────────────

async function deployIndexes(): Promise<void> {
  run(
    'npx firebase deploy --only firestore:indexes --project ' + projectId,
    'Deploying Firestore composite indexes'
  )
}

// ─── Seed App Config ───────────────────────────────────────────────────────

async function seedAppConfig(): Promise<void> {
  console.log('\n🔧 Seeding /config/app document...')

  const ref = db.collection('app_config').doc('config')
  const existing = await ref.get()

  if (existing.exists) {
    console.log('   ℹ️  /config/app already exists. Skipping seed.')
    console.log('   Current config:', JSON.stringify(existing.data(), null, 2))
    return
  }

  const initialConfig = {
    registrationFee: 200,
    adminBkashNumber: '',
    adminBkashAccountName: '',
    announcementEnabled: false,
    announcementTextEn: '',
    announcementTextBn: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await ref.set(initialConfig)

  console.log('   ✅ /config/app seeded with defaults:')
  console.log(JSON.stringify(initialConfig, null, 4))
  console.log('\n   ⚠️  IMPORTANT: Update these values in Admin Settings before going live:')
  console.log('      - registrationFee: Set your actual fee (currently ৳200)')
  console.log('      - adminBkashNumber: Your bKash number for receiving payments')
  console.log('      - adminBkashAccountName: Your bKash account name')
}

// ─── Print Next Steps ──────────────────────────────────────────────────────

function printNextSteps(): void {
  console.log('\n' + '═'.repeat(60))
  console.log('✨ Firebase setup complete!')
  console.log('═'.repeat(60))
  console.log('\n📋 NEXT STEPS:\n')
  console.log('1. Set your first admin user:')
  console.log('   npx ts-node --project tsconfig.scripts.json scripts/set-admin.ts <FIREBASE_UID>')
  console.log('\n2. Update Admin Settings in the app:')
  console.log('   - Go to /admin/settings after logging in as admin')
  console.log('   - Set registration fee, bKash number, and account name')
  console.log('\n3. Deploy to Vercel:')
  console.log('   - Push to main branch (CI/CD handles deployment)')
  console.log('   - Or: vercel --prod')
  console.log('\n4. Test the full flow:')
  console.log('   - Register a test account')
  console.log('   - Submit a payment with test TrxID')
  console.log('   - Approve as admin')
  console.log('   - Verify active member can browse directory\n')
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('\n🚀 MedConnect BD — Firebase Setup')
  console.log('   Project:', projectId)
  console.log('═'.repeat(60))

  await deployRules()
  await deployIndexes()
  await seedAppConfig()
  printNextSteps()

  process.exit(0)
}

main().catch((err) => {
  console.error('\n❌ Setup failed:', err)
  process.exit(1)
})