/**
 * API: Admin Customers
 * שליפת לקוחות + כרטיסיות + נאמנות (אדמין בלבד)
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Service Role client for admin operations (bypasses RLS)
const getServiceClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // בדיקת הרשאות אדמין
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: admin } = await supabase
      .from('admins')
      .select('id, is_active')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!admin?.is_active) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const serviceClient = getServiceClient()

    const { data, error } = await serviceClient
      .from('users')
      .select(
        `
        id,
        full_name,
        phone,
        email,
        qr_code,
        created_at,
        loyalty_cards(
          total_stamps,
          redeemed_coffees
        ),
        passes(
          id,
          type,
          total_entries,
          remaining_entries,
          status,
          expiry_date,
          purchase_date,
          card_types(name)
        )
      `
      )
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ customers: data || [] })
  } catch (error: any) {
    console.error('Error fetching customers (admin):', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers', details: error.message },
      { status: 500 }
    )
  }
}




