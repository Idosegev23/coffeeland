import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { loyaltyCardId } = await request.json()

    if (!loyaltyCardId) {
      return NextResponse.json({ error: 'Loyalty card ID is required' }, { status: 400 })
    }

    // Verify admin
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminData } = await supabase
      .from('admins')
      .select('is_active')
      .eq('user_id', authUser.id)
      .maybeSingle()

    if (!adminData?.is_active) {
      return NextResponse.json({ error: 'Not an admin' }, { status: 403 })
    }

    // Get loyalty card
    const { data: loyaltyCard, error: cardError } = await supabase
      .from('loyalty_cards')
      .select('*')
      .eq('id', loyaltyCardId)
      .single()

    if (cardError || !loyaltyCard) {
      return NextResponse.json({ error: 'כרטיסיית נאמנות לא נמצאה' }, { status: 404 })
    }

    const currentStamps = loyaltyCard.total_stamps % 10
    if (currentStamps !== 0 || loyaltyCard.total_stamps === 0) {
      return NextResponse.json({ error: 'לא מספיק חותמות למימוש' }, { status: 400 })
    }

    // Get last 10 unredeemed stamps
    const { data: stamps } = await supabase
      .from('loyalty_stamps')
      .select('id')
      .eq('loyalty_card_id', loyaltyCardId)
      .eq('is_redeemed', false)
      .order('stamped_at', { ascending: false })
      .limit(10)

    if (!stamps || stamps.length < 10) {
      return NextResponse.json({ error: 'לא נמצאו מספיק חותמות' }, { status: 400 })
    }

    // Mark stamps as redeemed
    const stampIds = stamps.map(s => s.id)
    const { error: redeemError } = await supabase
      .from('loyalty_stamps')
      .update({ is_redeemed: true })
      .in('id', stampIds)

    if (redeemError) throw redeemError

    // Update loyalty card - reset stamps to 0 and increment redeemed count
    const { error: updateError } = await supabase
      .from('loyalty_cards')
      .update({
        total_stamps: 0,
        redeemed_coffees: loyaltyCard.redeemed_coffees + 1,
      })
      .eq('id', loyaltyCardId)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      redeemedCoffees: loyaltyCard.redeemed_coffees + 1,
    })
  } catch (error: any) {
    console.error('Redeem coffee error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

