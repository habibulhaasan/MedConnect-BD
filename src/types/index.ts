// ─── Enums / Union Types ───────────────────────────────────────────────────

export type Designation =
  | 'mt_laboratory'
  | 'mt_dental'
  | 'mt_radiology'
  | 'mt_radiotherapy'
  | 'mt_physiotherapy'
  | 'pharmacist'

export const MT_DESIGNATIONS: Designation[] = [
  'mt_laboratory',
  'mt_dental',
  'mt_radiology',
  'mt_radiotherapy',
  'mt_physiotherapy',
]

export const ALL_DESIGNATIONS: Designation[] = [
  ...MT_DESIGNATIONS,
  'pharmacist',
]

export type MemberStatus =
  | 'pending_payment'
  | 'pending_approval'
  | 'active'
  | 'suspended'

export type PaymentStatus = 'submitted' | 'verified' | 'rejected'

export type BloodGroup =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-'

export type Division =
  | 'dhaka'
  | 'chattogram'
  | 'rajshahi'
  | 'khulna'
  | 'barishal'
  | 'sylhet'
  | 'rangpur'
  | 'mymensingh'

export const ALL_DIVISIONS: Division[] = [
  'dhaka',
  'chattogram',
  'rajshahi',
  'khulna',
  'barishal',
  'sylhet',
  'rangpur',
  'mymensingh',
]

export const ALL_BLOOD_GROUPS: BloodGroup[] = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
]

// ─── Core Interfaces ───────────────────────────────────────────────────────

export interface Member {
  uid: string
  fullName: string
  fullNameBn: string
  designation: Designation
  regNumber: string
  institution: string
  officeAddress: string
  division: Division
  district: string
  upazila: string
  mobile: string
  whatsapp?: string
  email?: string
  bloodGroup: BloodGroup
  lastDonateDate?: string        // ISO date string
  profilePhotoBase64?: string    // compressed base64, max ~80KB
  status: MemberStatus
  isVerified: boolean
  joinedAt: string               // ISO timestamp
  updatedAt: string
  favorites: string[]            // array of member UIDs
}

export interface PaymentSubmission {
  id: string
  uid: string
  memberName: string
  mobile: string
  amount: number
  bkashTrxId: string            // user-entered bKash Transaction ID e.g. "AB12345678"
  bkashSenderNumber: string     // number they sent FROM
  screenshotBase64?: string     // optional payment screenshot, compressed
  status: PaymentStatus
  adminNote?: string
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
}

export interface AppConfig {
  registrationFee: number
  adminBkashNumber: string       // the bKash number members send money TO
  adminBkashAccountName: string
  announcementEnabled: boolean
  announcementTextEn: string
  announcementTextBn: string
}

// ─── Filter / Pagination Types ─────────────────────────────────────────────

export interface MemberFilters {
  designation?: Designation | 'group_mt' | 'all'
  division?: Division | 'all'
  district?: string
  bloodGroup?: BloodGroup | 'all'
  searchQuery?: string
}

export interface PaginationCursor {
  lastDoc: unknown | null
  hasMore: boolean
  pageSize: number
}

export interface PaginatedResult<T> {
  data: T[]
  cursor: PaginationCursor
}

// ─── API Response Types ────────────────────────────────────────────────────

export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ─── Auth Types ────────────────────────────────────────────────────────────

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  isAdmin: boolean
}

// ─── UI Types ─────────────────────────────────────────────────────────────

export type Locale = 'en' | 'bn'

export interface SelectOption {
  value: string
  label: string
}

// ─── Form Data Types ───────────────────────────────────────────────────────

export interface RegistrationFormData {
  // Step 1 — Account
  email: string
  password: string
  confirmPassword: string
  // Step 2 — Personal Info
  fullName: string
  fullNameBn: string
  designation: Designation
  regNumber: string
  bloodGroup: BloodGroup
  // Step 3 — Location & Contact
  mobile: string
  whatsapp?: string
  division: Division
  district: string
  upazila: string
  institution: string
  officeAddress: string
  // Step 4 — Photo (optional at registration)
  profilePhotoBase64?: string
}

export interface PaymentFormData {
  bkashTrxId: string
  bkashSenderNumber: string
  amount: number
  screenshotBase64?: string
}

export interface ProfileEditFormData {
  fullName: string
  fullNameBn: string
  institution: string
  officeAddress: string
  division: Division
  district: string
  upazila: string
  mobile: string
  whatsapp?: string
  email?: string
  bloodGroup: BloodGroup
  lastDonateDate?: string
  profilePhotoBase64?: string
}