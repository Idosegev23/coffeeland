import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    // For new magic link signups - ensure user record exists
    if (data?.user) {
      const serviceClient = getServiceClient()
      const { data: existingUser } = await serviceClient
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingUser) {
        const meta = data.user.user_metadata || {}
        const qrCode = `USR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

        await serviceClient.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: meta.full_name || data.user.email?.split('@')[0] || '',
          phone: meta.phone || null,
          qr_code: qrCode,
        })

        // Create loyalty card
        await serviceClient.from('loyalty_cards').insert({
          user_id: data.user.id,
          total_stamps: 0,
          redeemed_coffees: 0,
        })
      }
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || requestUrl.origin
  return NextResponse.redirect(new URL(next, baseUrl))
}
