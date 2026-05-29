import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Designation, BloodGroup, Division } from '@/types'

export interface Step1Data {
  fullName: string
  fullNameBn: string
  designation: Designation | ''
  regNumber: string
  mobile: string
  email: string
  password: string
  confirmPassword: string
}

export interface Step2Data {
  division: Division | ''
  district: string
  upazila: string
  institution: string
  officeAddress: string
  whatsapp: string
  sameAsMobile: boolean
}

export interface Step3Data {
  bloodGroup: BloodGroup | ''
  lastDonateDate: string
  profilePhotoBase64: string
  photoSizeKb: number
}

export interface Step4Data {
  bkashTrxId: string
  bkashSenderNumber: string
  screenshotBase64: string
}

interface RegistrationState {
  currentStep: number
  step1: Step1Data
  step2: Step2Data
  step3: Step3Data
  step4: Step4Data
  // Actions
  setCurrentStep: (step: number) => void
  setStep1: (data: Partial<Step1Data>) => void
  setStep2: (data: Partial<Step2Data>) => void
  setStep3: (data: Partial<Step3Data>) => void
  setStep4: (data: Partial<Step4Data>) => void
  reset: () => void
}

const defaultStep1: Step1Data = {
  fullName: '',
  fullNameBn: '',
  designation: '',
  regNumber: '',
  mobile: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const defaultStep2: Step2Data = {
  division: '',
  district: '',
  upazila: '',
  institution: '',
  officeAddress: '',
  whatsapp: '',
  sameAsMobile: false,
}

const defaultStep3: Step3Data = {
  bloodGroup: '',
  lastDonateDate: '',
  profilePhotoBase64: '',
  photoSizeKb: 0,
}

const defaultStep4: Step4Data = {
  bkashTrxId: '',
  bkashSenderNumber: '',
  screenshotBase64: '',
}

export const useRegistrationStore = create<RegistrationState>()(
  devtools(
    persist(
      (set) => ({
        currentStep: 1,
        step1: defaultStep1,
        step2: defaultStep2,
        step3: defaultStep3,
        step4: defaultStep4,

        setCurrentStep: (step) =>
          set({ currentStep: step }, false, 'registration/setStep'),

        setStep1: (data) =>
          set(
            (state) => ({ step1: { ...state.step1, ...data } }),
            false,
            'registration/setStep1'
          ),

        setStep2: (data) =>
          set(
            (state) => ({ step2: { ...state.step2, ...data } }),
            false,
            'registration/setStep2'
          ),

        setStep3: (data) =>
          set(
            (state) => ({ step3: { ...state.step3, ...data } }),
            false,
            'registration/setStep3'
          ),

        setStep4: (data) =>
          set(
            (state) => ({ step4: { ...state.step4, ...data } }),
            false,
            'registration/setStep4'
          ),

        reset: () =>
          set(
            {
              currentStep: 1,
              step1: defaultStep1,
              step2: defaultStep2,
              step3: defaultStep3,
              step4: defaultStep4,
            },
            false,
            'registration/reset'
          ),
      }),
      {
        name: 'medconnect-registration',
        // Don't persist passwords
        partialize: (state) => ({
          currentStep: state.currentStep,
          step1: { ...state.step1, password: '', confirmPassword: '' },
          step2: state.step2,
          step3: { ...state.step3, profilePhotoBase64: '' },
          step4: { ...state.step4, screenshotBase64: '' },
        }),
      }
    ),
    { name: 'RegistrationStore' }
  )
)