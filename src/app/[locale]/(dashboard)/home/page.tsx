import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HomePage } from '@/components/member/HomePage';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  return { title: t('home') };
}

// Render the actual HomePage component for the dashboard
export default function DashboardHome() {
  return <HomePage />;
}
