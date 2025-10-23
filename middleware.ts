import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('🔒 Middleware check:', {
    path: req.nextUrl.pathname,
    hasSession: !!session,
    userId: session?.user?.id,
  })

  // Protect /admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      console.log('❌ No session, redirecting to /login')
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user is admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('is_active')
      .eq('user_id', session.user.id)
      .maybeSingle()

    console.log('👤 Admin check result:', adminData)

    if (!adminData?.is_active) {
      console.log('❌ Not an admin, redirecting to /my-account')
      return NextResponse.redirect(new URL('/my-account', req.url))
    }

    console.log('✅ Admin verified, allowing access')
  }

  // Protect /my-account route
  if (req.nextUrl.pathname.startsWith('/my-account')) {
    if (!session) {
      console.log('❌ No session for /my-account, redirecting to /login')
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectTo', '/my-account')
      return NextResponse.redirect(redirectUrl)
    }
    console.log('✅ Session exists for /my-account, allowing access')
  }

  return res
}

export const config = {
  // Temporarily disable to debug login issues
  matcher: [],
  // matcher: ['/admin/:path*', '/my-account/:path*'],
}

