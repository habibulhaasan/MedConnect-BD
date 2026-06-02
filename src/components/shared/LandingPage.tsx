'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import {
  Users,
  MapPin,
  Phone,
  Shield,
  Heart,
  ArrowRight,
  Stethoscope,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function LandingPage() {
  const locale = useLocale()
  const t = useTranslations()

  const features = [
    {
      icon: Users,
      titleKey: 'landing.feature1Title',
      descKey: 'landing.feature1Desc',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: MapPin,
      titleKey: 'landing.feature2Title',
      descKey: 'landing.feature2Desc',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: Phone,
      titleKey: 'landing.feature3Title',
      descKey: 'landing.feature3Desc',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      icon: Heart,
      titleKey: 'landing.feature4Title',
      descKey: 'landing.feature4Desc',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Stethoscope size={24} />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {locale === 'bn' ? 'স্বাগতম MedConnect BD এ' : 'Welcome to MedConnect BD'}
            </h1>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              {locale === 'bn'
                ? 'বাংলাদেশের চিকিৎসা পেশাদারদের একটি সংযুক্ত সম্প্রদায়। সহকর্মী খুঁজুন, নেটওয়ার্ক তৈরি করুন এবং পেশাদার সংযোগ গড়ুন।'
                : 'A connected community of medical professionals in Bangladesh. Find colleagues, build networks, and foster professional connections.'}
            </p>
            <div className="flex gap-4 flex-wrap">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary-600 hover:bg-white/90"
              >
                <Link href={`/${locale}/login`}>
                  {t('nav.login')}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Link href={`/${locale}/register`}>
                  {t('nav.register')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
              {locale === 'bn' ? 'আমাদের বৈশিষ্ট্য' : 'Our Features'}
            </h2>
            <p className="text-lg text-zinc-600">
              {locale === 'bn'
                ? 'MedConnect BD আপনাকে সেরা পেশাদার নেটওয়ার্কিং অভিজ্ঞতা প্রদান করে'
                : 'MedConnect BD provides the best professional networking experience'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.titleKey} className="border-zinc-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                      <Icon size={24} className={feature.color} />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                      {t(feature.titleKey as Parameters<typeof t>[0])}
                    </h3>
                    <p className="text-sm text-zinc-600">
                      {t(feature.descKey as Parameters<typeof t>[0])}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-16 text-center">
            {locale === 'bn' ? 'কীভাবে শুরু করবেন' : 'How to Get Started'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                titleKey: 'landing.step1Title',
                descKey: 'landing.step1Desc',
              },
              {
                step: '02',
                titleKey: 'landing.step2Title',
                descKey: 'landing.step2Desc',
              },
              {
                step: '03',
                titleKey: 'landing.step3Title',
                descKey: 'landing.step3Desc',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex flex-col">
                  <div className="text-5xl font-bold text-primary-200 mb-2">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-3">
                    {t(item.titleKey as Parameters<typeof t>[0])}
                  </h3>
                  <p className="text-zinc-600">
                    {t(item.descKey as Parameters<typeof t>[0])}
                  </p>
                </div>
                {item.step !== '03' && (
                  <ArrowRight className="hidden md:block absolute top-4 right-0 text-primary-300 transform translate-x-12" size={24} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-50 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">
            {locale === 'bn'
              ? 'আজই যোগ দিন এবং পেশাদার নেটওয়ার্ক তৈরি করুন'
              : 'Join Today and Build Your Professional Network'}
          </h2>
          <p className="text-lg text-zinc-600 mb-8">
            {locale === 'bn'
              ? 'হাজার হাজার চিকিৎসা পেশাদারের সাথে সংযুক্ত হোন এবং আপনার ক্যারিয়ারকে পরবর্তী স্তরে নিয়ে যান।'
              : 'Connect with thousands of medical professionals and take your career to the next level.'}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary-600 hover:bg-primary-700"
          >
            <Link href={`/${locale}/register`}>
              {t('nav.register')} {t('common.now')}
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-zinc-400">
            © 2024 MedConnect BD. {locale === 'bn' ? 'সর্বাধিকার সংরক্ষিত।' : 'All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  )
}
