import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { passId } = await request.json()

    if (!passId) {
      return NextResponse.json({ error: 'Pass ID is required' }, { status: 400 })
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

    // Get current pass
    const { data: pass, error: passError } = await supabase
      .from('passes')
      .select('*')
      .eq('id', passId)
      .single()

    if (passError || !pass) {
      return NextResponse.json({ error: 'כרטיסייה לא נמצאה' }, { status: 404 })
    }

    if (pass.remaining_entries <= 0) {
      return NextResponse.json({ error: 'הכרטיסייה נגמרה' }, { status: 400 })
    }

    if (pass.status !== 'active') {
      return NextResponse.json({ error: 'הכרטיסייה לא פעילה' }, { status: 400 })
    }

    // Decrement remaining entries
    const newRemaining = pass.remaining_entries - 1
    const newStatus = newRemaining === 0 ? 'depleted' : 'active'

    const { error: updateError } = await supabase
      .from('passes')
      .update({
        remaining_entries: newRemaining,
        status: newStatus,
      })
      .eq('id', passId)

    if (updateError) throw updateError

    // Create usage record
    const { error: usageError } = await supabase
      .from('pass_usages')
      .insert({
        pass_id: passId,
        used_by_admin: adminData.id,
      })

    if (usageError) console.error('Usage record error:', usageError)

    return NextResponse.json({
      success: true,
      remainingEntries: newRemaining,
      status: newStatus,
    })
  } catch (error: any) {
    console.error('Use pass error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

