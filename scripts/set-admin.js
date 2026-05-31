#!/usr/bin/env node
'use strict'
/**
 * MedConnect BD — Set Admin Custom Claim
 * Run: node scripts/set-admin.js <FIREBASE_UID>
 */

const path = require('path')
const fs   = require('fs')

// ── Load .env.local ───────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    const k = t.slice(0, i).trim()
    const v = t.slice(i + 1).trim()
    if (!process.env[k]) process.env[k] = v
  }
} else {
  console.error('❌ .env.local not found at:', envPath)
  process.exit(1)
}

// ── Validate credentials ──────────────────────────────────────────────────────
const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
const privateKey  = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n')

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Missing Firebase Admin credentials in .env.local')
  process.exit(1)
}

// ── Args ──────────────────────────────────────────────────────────────────────
const uid      = process.argv[2]
const revoke   = process.argv.includes('--revoke')

if (!uid) {
  console.error('❌ Usage:  node scripts/set-admin.js <UID>')
  console.error('   Revoke: node scripts/set-admin.js <UID> --revoke')
  process.exit(1)
}

// ── Firebase Admin ────────────────────────────────────────────────────────────
const { initializeApp, getApps, cert } = require('firebase-admin/app')
const { getAuth }                       = require('firebase-admin/auth')

const existing = getApps().find(a => a.name === 'set-admin')
const app      = existing || initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }, 'set-admin')
const auth     = getAuth(app)

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔐 MedConnect BD — Admin Claim Manager')
  console.log('   Project:', projectId)

  let user
  try {
    user = await auth.getUser(uid)
  } catch {
    console.error(`\n❌ User not found: "${uid}"`)
    console.error('   Go to Firebase Console → Authentication → Users to get the correct UID\n')
    process.exit(1)
  }

  console.log(`\n${revoke ? '🔴 REVOKING' : '🟢 GRANTING'} admin claim`)
  console.log('   UID:  ', uid)
  console.log('   Email:', user.email || '(none)')

  await auth.setCustomUserClaims(uid, { admin: !revoke })

  const check   = await auth.getUser(uid)
  const claims  = check.customClaims || {}
  const ok      = revoke ? !claims.admin : claims.admin === true

  if (!ok) {
    console.error('\n❌ Verification failed — try again\n')
    process.exit(1)
  }

  console.log(`\n✅ Admin claim ${revoke ? 'revoked' : 'granted'} successfully!`)
  console.log('⚠️  Sign out and sign back in for the change to take effect.\n')
}

main().catch(err => {
  console.error('\n❌ Error:', err.message || err)
  process.exit(1)
})