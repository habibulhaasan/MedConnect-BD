import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware({
  locales: ['en', 'bn'],
  defaultLocale: 'bn',
  localePrefix: 'always',
})

export default function middleware(request: NextRequest): NextResponse {
  return intlMiddleware(request) as NextResponse
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)' ,
  ],
}