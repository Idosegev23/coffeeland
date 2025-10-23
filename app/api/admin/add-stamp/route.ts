import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Service Role client for admin operations (bypasses RLS)
const getServiceClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const serviceClient = getServiceClient()
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Verify admin
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminData } = await supabase
      .from('admins')
      .select('id, is_active')
      .eq('user_id', authUser.id)
      .maybeSingle()

    if (!adminData?.is_active) {
      return NextResponse.json({ error: 'Not an admin' }, { status: 403 })
    }

    // Get or create loyalty card
    let { data: loyaltyCard } = await supabase
      .from('loyalty_cards')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (!loyaltyCard) {
      // Create loyalty card if doesn't exist
      const { data: newCard, error: createError } = await supabase
        .from('loyalty_cards')
        .insert({
          user_id: userId,
          total_stamps: 0,
          redeemed_coffees: 0,
        })
        .select()
        .single()

      if (createError) throw createError
      loyaltyCard = newCard
    }

    // Add stamp (use service client)
    const { error: stampError } = await serviceClient
      .from('loyalty_stamps')
      .insert({
        loyalty_card_id: loyaltyCard.id,
        stamped_by_admin: adminData.id,
      })

    if (stampError) throw stampError

    // Update total stamps (use service client)
    const newTotal = loyaltyCard.total_stamps + 1
    const { error: updateError } = await serviceClient
      .from('loyalty_cards')
      .update({ total_stamps: newTotal })
      .eq('id', loyaltyCard.id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      totalStamps: newTotal,
    })
  } catch (error: any) {
    console.error('Add stamp error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

