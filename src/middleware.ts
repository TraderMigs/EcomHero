import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const { pathname } = request.nextUrl

  // Never auth-check these
  const alwaysPublic = [
    '/admin/login',
    '/admin/onboarding',
    '/api/',
    '/order/',
    '/_next/',
    '/favicon',
  ]
  const isAlwaysPublic = alwaysPublic.some(p => pathname.startsWith(p)) || pathname === '/'
  if (isAlwaysPublic) return supabaseResponse

  // Only run auth check for admin and account routes
  const needsAuth = pathname.startsWith('/admin') || pathname.startsWith('/account')
  if (!needsAuth) return supabaseResponse

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name, value,
              options as Parameters<typeof supabaseResponse.cookies.set>[2]
            )
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    if (pathname.startsWith('/account')) {
      return NextResponse.redirect(new URL('/?auth=login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
