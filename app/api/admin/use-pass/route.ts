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

    // --- Playground capacity check ---
    if (pass.type === 'playground') {
      const serviceClient = getServiceClient()

      // Get capacity settings
      const { data: capacityRow } = await serviceClient
        .from('venue_settings')
        .select('value')
        .eq('key', 'playground_capacity')
        .single()

      const maxConcurrent = (capacityRow?.value as any)?.max_concurrent || 25
      const showBufferBefore = (capacityRow?.value as any)?.show_buffer_before_minutes || 30
      const showBlockDuration = (capacityRow?.value as any)?.show_block_duration_minutes || 120

      const now = new Date()

      // Check if blocked by a show
      const twoHoursFromNow = new Date(now.getTime() + showBlockDuration * 60 * 1000)
      const { data: activeShows } = await serviceClient
        .from('events')
        .select('id, title, start_at')
        .eq('type', 'show')
        .eq('status', 'active')
        .lte('start_at', twoHoursFromNow.toISOString())
        .gte('start_at', new Date(now.getTime() - showBlockDuration * 60 * 1000).toISOString())

      for (const show of activeShows || []) {
        const showStart = new Date(show.start_at)
        const blockFrom = new Date(showStart.getTime() - showBufferBefore * 60 * 1000)
        const blockUntil = new Date(showStart.getTime() + showBlockDuration * 60 * 1000)
        if (now >= blockFrom && now <= blockUntil) {
          return NextResponse.json({
            error: `הג׳ימבורי סגור לכניסות - הצגה "${show.title}"`,
            blocked: true,
            showTitle: show.title
          }, { status: 409 })
        }
      }

      // Count current occupancy (entries in last 2 hours)
      const twoHoursAgo = new Date(now.getTime() - PLAYGROUND_ENTRY_DURATION_MINUTES * 60 * 1000)
      const { data: currentUsages } = await serviceClient
        .from('pass_usages')
        .select('used_at')
        .gte('used_at', twoHoursAgo.toISOString())

      const currentOccupancy = currentUsages?.length || 0
      if (currentOccupancy >= maxConcurrent) {
        return NextResponse.json({
          error: `הג׳ימבורי מלא (${currentOccupancy}/${maxConcurrent}). נסו שוב מאוחר יותר.`,
          full: true,
          occupancy: currentOccupancy,
          max: maxConcurrent
        }, { status: 409 })
      }

      // Check if there's a show coming soon - warn about limited time
      let maxMinutesAvailable = PLAYGROUND_ENTRY_DURATION_MINUTES
      let warning: string | null = null

      for (const show of activeShows || []) {
        const showStart = new Date(show.start_at)
        const blockFrom = new Date(showStart.getTime() - showBufferBefore * 60 * 1000)
        if (blockFrom > now) {
          const minutesUntilBlock = Math.floor((blockFrom.getTime() - now.getTime()) / 60000)
          if (minutesUntilBlock < PLAYGROUND_ENTRY_DURATION_MINUTES) {
            maxMinutesAvailable = Math.min(maxMinutesAvailable, minutesUntilBlock)
            warning = `שים לב: הצגה "${show.title}" מתחילה בעוד ${minutesUntilBlock + showBufferBefore} דקות. זמן כניסה מוגבל ל-${minutesUntilBlock} דקות.`
          }
        }
      }

      // Store warning for response
      ;(request as any).__capacityWarning = warning
      ;(request as any).__maxMinutes = maxMinutesAvailable
      ;(request as any).__occupancy = currentOccupancy + 1
      ;(request as any).__maxConcurrent = maxConcurrent
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
      capacityWarning: (request as any).__capacityWarning || null,
      maxMinutesAvailable: (request as any).__maxMinutes || PLAYGROUND_ENTRY_DURATION_MINUTES,
      occupancy: (request as any).__occupancy || null,
      maxConcurrent: (request as any).__maxConcurrent || null,
    })
  } catch (error: any) {
    console.error('Use pass error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

