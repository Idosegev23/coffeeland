import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as 'magiclink' | 'email' | 'signup' | 'recovery' | null
  const next = requestUrl.searchParams.get('next') || '/'

  const supabase = createRouteHandlerClient({ cookies })
  let user = null

  if (code) {
    // PKCE flow - same browser context
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    user = data?.user ?? null
  } else if (token_hash && type) {
    // Token hash flow - fallback for mobile in-app browsers
    // where code_verifier from original browser is unavailable
    const { data } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    })
    user = data?.user ?? null
  }

  // For new magic link signups - ensure user record exists
  if (user) {
    const serviceClient = getServiceClient()
    const { data: existingUser } = await serviceClient
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingUser) {
      const meta = user.user_metadata || {}
      const qrCode = `USR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      await serviceClient.from('users').insert({
        id: user.id,
        email: user.email,
        full_name: meta.full_name || user.email?.split('@')[0] || '',
        phone: meta.phone || null,
        qr_code: qrCode,
      })

      // Create loyalty card
      await serviceClient.from('loyalty_cards').insert({
        user_id: user.id,
        total_stamps: 0,
        redeemed_coffees: 0,
      })
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || requestUrl.origin
  return NextResponse.redirect(new URL(next, baseUrl))
}
