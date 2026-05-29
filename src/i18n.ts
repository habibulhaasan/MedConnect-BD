import { getRequestConfig } from 'next-intl/server';
const locales = ['en', 'bn'] as const;
type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'bn'
  }

  return {
    locale,
    messages: (await import(`./i18n/${locale}.json`)).default,
  };
});