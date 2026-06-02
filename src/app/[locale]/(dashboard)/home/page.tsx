'use client'

import { useAuth } from '@/hooks/useAuth'
import { useTranslations, useLocale } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Star, Zap, Users, Gift, CreditCard, LayoutGrid, Globe, Phone, MessageCircle } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

export default function DashboardHomePage() {
  const { user, isLoading } = useAuth()
  const locale = useLocale()
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()

  // ----- Loading state -----------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="h-12 w-48 bg-primary-200 rounded animate-pulse" />
      </div>
    )
  }

  // ----- Helper components -------------------------------------------------
  const Section = ({ children }: { children: React.ReactNode }) => (
    <section className="my-12 w-full max-w-5xl mx-auto px-4 md:px-0">
      {children}
    </section>
  )

  const FeatureItem = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
    <div className="flex items-start space-x-4">
      <Icon className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )

  const PricingPlan = ({ name, price, features }: { name: string; price: string; features: string[] }) => (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-center">{name}</h3>
        <p className="text-3xl font-bold text-center mb-4">{price}</p>
        <ul className="space-y-2 mb-6">
          {features.map((f) => (
            <li key={f} className="flex items-center">
              <Check className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm text-gray-700">{f}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full" variant="primary">
          {locale === 'bn' ? 'শুরু করুন' : 'Get Started'}
        </Button>
      </CardContent>
    </Card>
  )

  const ReviewItem = ({ name, rating, comment }: { name: string; rating: number; comment: string }) => (
    <Card className="bg-white/90 border">
      <CardContent className="p-4">
        <div className="flex items-center mb-2">
          <div className="flex space-x-1 mr-2">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 text-yellow-400" />
            ))}
          </div>
          <span className="font-medium text-gray-800">{name}</span>
        </div>
        <p className="text-sm text-gray-600">{comment}</p>
      </CardContent>
    </Card>
  )

  // ----- Render -----------------------------------------------------------
  return (
    <div className="relative bg-gradient-to-br from-primary-50 to-primary-100 min-h-screen py-8">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => {
              const newLocale = locale === 'bn' ? 'en' : 'bn'
              router.replace(`/${newLocale}${pathname.replace(`/${locale}`, '')}`)
            }}
            className="flex items-center space-x-1 rounded-md bg-white/80 px-3 py-1 text-sm font-medium text-gray-800 shadow-sm transition-colors duration-300 ease-in-out hover:bg-white"
          >
            <Globe className="h-4 w-4" />
            <span>{locale === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>
        </div>
      {/* Hero ----------------------------------------------------------- */}
      <Section>
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-4">
            {locale === 'bn' ? 'মেডকানেক্ট BD' : 'MedConnect BD'}
          </h1>
          <p className="text-lg md:text-xl text-primary-700 mb-6 max-w-xl mx-auto">
            {locale === 'bn'
              ? 'বাংলাদেশের স্বাস্থ্য পেশাজীবীদের সহজে সংযুক্ত করতে একটি সম্পূর্ণ সমাধান।'
              : 'A complete solution to connect health professionals across Bangladesh.'}
          </p>
          <Button asChild variant="primary" className="inline-flex items-center px-6 py-3 mr-4">
            <a href={`/${locale}/register`}> {locale === 'bn' ? 'শুরু করুন' : 'Get Started'} </a>
          </Button>
          <Button asChild variant="secondary" className="inline-flex items-center px-6 py-3">
            <a href={`/${locale}/login`}> {locale === 'bn' ? 'লগইন' : 'Login'} </a>
          </Button>
        </div>
      </Section>

      {/* Features -------------------------------------------------------- */}
      <Section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          {locale === 'bn' ? 'বৈশিষ্ট্যগুলো' : 'Features'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureItem
            icon={Users}
            title={locale === 'bn' ? 'সদস্য ব্যবস্থাপনা' : 'Member Management'}
            description={locale === 'bn' ? 'সদস্যদের রেজিস্ট্রেশন, প্রোফাইল ও স্ট্যাটাস সহজে পরিচালনা করুন।' : 'Easily manage registration, profiles, and statuses of members.'}
          />
          <FeatureItem
            icon={Zap}
            title={locale === 'bn' ? 'রিয়েল‑টাইম আপডেট' : 'Real‑time Updates'}
            description={locale === 'bn' ? 'ডেটা রিয়েল‑টাইমে সিঙ্ক করে ত্বরান্বিত যোগাযোগ।' : 'Sync data in real‑time for faster communication.'}
          />
          <FeatureItem
            icon={Gift}
            title={locale === 'bn' ? 'ইভেন্ট ও রিওয়ার্ড' : 'Events & Rewards'}
            description={locale === 'bn' ? 'ইভেন্ট ও স্বীকৃতির মাধ্যমে সক্রিয়তা বাড়ান।' : 'Boost engagement with events and recognitions.'}
          />
        </div>
      </Section>

      {/* Pricing ---------------------------------------------------------- */}
      <Section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          {locale === 'bn' ? 'মূল্য পরিকল্পনা' : 'Pricing Plans'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PricingPlan
            name={locale === 'bn' ? 'বেসিক' : 'Basic'}
            price="৳ ০/বছর"
            features={[
              locale === 'bn' ? 'সীমাহীন সদস্য' : 'Unlimited members',
              locale === 'bn' ? 'ইমেইল সাপোর্ট' : 'Email support',
              locale === 'bn' ? 'কমিউনিটি ফোরাম' : 'Community forum',
            ]}
          />
          <PricingPlan
            name={locale === 'bn' ? 'প্রো' : 'Pro'}
            price="৳ ১,৯৯৯/বছর"
            features={[
              locale === 'bn' ? 'বেসিকের সব +' : 'All Basic features +',
              locale === 'bn' ? 'প্রায়োরিটি সাপোর্ট' : 'Priority support',
              locale === 'bn' ? 'অ্যাডভান্সড বিশ্লেষণ' : 'Advanced analytics',
            ]}
          />
          <PricingPlan
            name={locale === 'bn' ? 'এন্টারপ্রাইজ' : 'Enterprise'}
            price={locale === 'bn' ? 'কাস্টম' : 'Custom'}
            features={[
              locale === 'bn' ? 'কাস্টম ইন্টিগ্রেশন' : 'Custom integrations',
              locale === 'bn' ? 'স্ল্যাক/ইমেইল নোটিফিকেশন' : 'Slack/email notifications',
              locale === 'bn' ? 'স্লাইড ডেডিকেটেড একাউন্ট ম্যানেজার' : 'Dedicated account manager',
            ]}
          />
        </div>
      </Section>

      {/* Reviews ---------------------------------------------------------- */}
      <Section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          {locale === 'bn' ? 'হোমে কী বলছেন?' : 'What Our Users Say'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReviewItem
            name="Dr. Ahmed Rahman"
            rating={5}
            comment={locale === 'bn' ? 'মেডকানেক্ট আমাদের ক্লিনিকের রোগী ব্যবস্থাপনাকে সরল করেছে।' : 'MedConnect simplified patient management for our clinic.'}
          />
          <ReviewItem
            name="Nusrat Jahan"
            rating={4}
            comment={locale === 'bn' ? 'দ্রুত ও নির্ভরযোগ্য, তবে মোবাইল অ্যাপ আরও ভালো হতে পারে।' : 'Fast and reliable, but the mobile app could be better.'}
          />
        </div>
      </Section>

      {/* Call‑to‑Action --------------------------------------------------- */}
      <Section>
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-primary-900 mb-4">
            {locale === 'bn' ? 'আপনার স্বাস্থ্য নেটওয়ার্ক গড়ুন' : 'Build Your Health Network'}
          </h2>
          <p className="text-lg text-primary-700 mb-6 max-w-lg mx-auto">
            {locale === 'bn'
              ? 'অধিকাংশ স্বাস্থ্য পেশাজীবীর সঙ্গে সংযুক্ত হয়ে রোগী সেবা উন্নত করুন।'
              : 'Connect with health professionals and improve patient care.'}
          </p>
          <Button asChild variant="primary" className="inline-flex items-center px-8 py-3">
            <a href={`/${locale}/register`}> {locale === 'bn' ? 'এখনই যোগ দিন' : 'Join Now'} </a>
          </Button>
        </div>
      </Section>
    </div>
  )
}

