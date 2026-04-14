import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  await supabase.auth.signOut()

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin
  return NextResponse.redirect(new URL('/', baseUrl), { status: 303 })
}

export async function GET(request: NextRequest) {
  return POST(request)
}
