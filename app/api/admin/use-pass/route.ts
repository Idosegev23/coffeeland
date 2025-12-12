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

const PLAYGROUND_ENTRY_DURATION_MINUTES = 120;

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

    console.log('🔄 Updating pass:', {
      passId,
      oldRemaining: pass.remaining_entries,
      newRemaining,
      newStatus
    })

    // Use service role client for update (bypasses RLS)
    const serviceClient = getServiceClient()
    
    const { data: updatedPass, error: updateError } = await serviceClient
      .from('passes')
      .update({
        remaining_entries: newRemaining,
        status: newStatus,
      })
      .eq('id', passId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Update error:', updateError)
      throw updateError
    }

    console.log('✅ Pass updated:', updatedPass)

    // Create usage record (also with service client)
    const { data: usage, error: usageError } = await serviceClient
      .from('pass_usages')
      .insert({
        pass_id: passId,
        used_by_admin: adminData.id,
      })
      .select('id, used_at')
      .single()

    if (usageError) console.error('Usage record error:', usageError)

    const usedAt = usage?.used_at || new Date().toISOString();
    const validUntil =
      pass.type === 'playground'
        ? new Date(new Date(usedAt).getTime() + PLAYGROUND_ENTRY_DURATION_MINUTES * 60 * 1000).toISOString()
        : null;

    return NextResponse.json({
      success: true,
      remainingEntries: newRemaining,
      status: newStatus,
      usedAt,
      validUntil,
    })
  } catch (error: any) {
    console.error('Use pass error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

