#!/usr/bin/env ts-node
/**
 * MedConnect BD — Set Admin Custom Claim
 *
 * Grants or revokes Firebase admin custom claim for a user.
 *
 * Usage:
 *   Grant admin:  npx ts-node --project tsconfig.scripts.json scripts/set-admin.ts <UID>
 *   Revoke admin: npx ts-node --project tsconfig.scripts.json scripts/set-admin.ts <UID> --revoke
 *
 * The user must sign out and sign back in for the claim to take effect.
 */

import * as path from 'path'
import * as dotenv from 'dotenv'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

if (!projectId || !clientEmail || !privateKey) {
  console.error('\n❌ Missing Firebase Admin credentials in .env.local')
  process.exit(1)
}

const targetUid = process.argv[2]
const shouldRevoke = process.argv.includes('--revoke')

if (!targetUid) {
  console.error('\n❌ Usage: npx ts-node scripts/set-admin.ts <FIREBASE_UID> [--revoke]')
  console.error('   Example: npx ts-node scripts/set-admin.ts abc123xyz789')
  console.error('   Revoke:  npx ts-node scripts/set-admin.ts abc123xyz789 --revoke\n')
  process.exit(1)
}

const app =
  getApps().find((a) => a.name === 'set-admin') ??
  initializeApp(
    { credential: cert({ projectId, clientEmail, privateKey }), projectId },
    'set-admin'
  )

const auth = getAuth(app)

async function main(): Promise<void> {
  console.log(`\n🔐 MedConnect BD — Admin Claim Manager`)
  console.log('   Project:', projectId)
  console.log('═'.repeat(50))

  // Verify user exists
  let userRecord
  try {
    userRecord = await auth.getUser(targetUid)
  } catch {
    console.error(`\n❌ User not found: ${targetUid}`)
    console.error('   Check the UID in Firebase Console → Authentication → Users\n')
    process.exit(1)
  }

  const action = shouldRevoke ? 'REVOKING' : 'GRANTING'
  const newClaim = shouldRevoke ? { admin: false } : { admin: true }

  console.log(`\n${shouldRevoke ? '🔴' : '🟢'} ${action} admin claim...`)
  console.log('   UID:', targetUid)
  console.log('   Email:', userRecord.email ?? '(no email)')
  console.log('   Display Name:', userRecord.displayName ?? '(none)')

  await auth.setCustomUserClaims(targetUid, newClaim)

  // Verify the claim was set
  const updated = await auth.getUser(targetUid)
  const claims = updated.customClaims ?? {}
  const verified = shouldRevoke
    ? !claims['admin']
    : claims['admin'] === true

  if (!verified) {
    console.error('\n❌ Claim verification failed. Please try again.\n')
    process.exit(1)
  }

  console.log(`\n✅ Admin claim ${shouldRevoke ? 'revoked' : 'granted'} successfully!`)
  console.log('\n⚠️  IMPORTANT:')
  console.log('   The user must sign out and sign back in for changes to take effect.')

  if (!shouldRevoke) {
    console.log('\n📋 What the admin can do:')
    console.log('   - Access /admin/dashboard, /admin/payments, /admin/members, /admin/settings')
    console.log('   - Verify/reject bKash payments')
    console.log('   - Approve, suspend, edit, or delete members')
    console.log('   - Configure registration fee and bKash number')
    console.log('   - Set announcements')
  }

  console.log('')
  process.exit(0)
}

main().catch((err) => {
  console.error('\n❌ Error:', err)
  process.exit(1)
})