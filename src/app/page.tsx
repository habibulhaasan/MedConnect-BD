import Link from 'next/link';
import { getLocale } from 'next-intl/server';

export default async function Page() {
  // Determine locale; default to Bangla if detection fails
  let locale: string;
  try {
    locale = await getLocale();
  } catch {
    locale = 'bn';
  }

  // Render a simple landing page with navigation to login and register
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <h1 className="mb-6 text-4xl font-bold text-primary-900">MedConnect BD</h1>
      <div className="flex gap-4">
        <Link href={`/${locale}/login`} className="rounded bg-primary-600 px-6 py-2 text-white hover:bg-primary-700">
          Login
        </Link>
        <Link href={`/${locale}/register`} className="rounded bg-primary-600 px-6 py-2 text-white hover:bg-primary-700">
          Register
        </Link>
      </div>
    </section>
  );
}
