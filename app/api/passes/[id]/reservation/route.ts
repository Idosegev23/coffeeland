import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const HHMM = /^\d{2}:\d{2}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * POST /api/passes/[id]/reservation
 * body: { date: 'YYYY-MM-DD', slot: 'HH:MM' }
 *
 * Reserves a slot on an existing pass that still has entries left.
 * Overwrites any prior reservation on the same pass.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabaseAuth = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: passId } = await params;
    const { date, slot } = await req.json();

    if (!ISO_DATE.test(date || '')) {
      return NextResponse.json({ error: 'תאריך לא תקין' }, { status: 400 });
    }
    if (!HHMM.test(slot || '')) {
      return NextResponse.json({ error: 'משבצת זמן לא תקינה' }, { status: 400 });
    }

    // Reservation date must be today or future (Israel local).
    const todayIsrael = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jerusalem' });
    if (date < todayIsrael) {
      return NextResponse.json({ error: 'אי אפשר לשריין בתאריך שעבר' }, { status: 400 });
    }
    // Limit to 7 days ahead
    const sevenAhead = new Date();
    sevenAhead.setDate(sevenAhead.getDate() + 7);
    const sevenAheadStr = sevenAhead.toLocaleDateString('sv-SE', { timeZone: 'Asia/Jerusalem' });
    if (date > sevenAheadStr) {
      return NextResponse.json({ error: 'ניתן לשריין עד 7 ימים קדימה' }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Load the pass
    const { data: pass, error: passError } = await supabase
      .from('passes')
      .select('*')
      .eq('id', passId)
      .eq('user_id', user.id)
      .single();

    if (passError || !pass) {
      return NextResponse.json({ error: 'כרטיסייה לא נמצאה' }, { status: 404 });
    }

    if (pass.status !== 'active') {
      return NextResponse.json({ error: 'הכרטיסייה אינה פעילה' }, { status: 400 });
    }
    if (pass.remaining_entries <= 0) {
      return NextResponse.json({ error: 'לא נותרו כניסות בכרטיסייה' }, { status: 400 });
    }
    if (pass.type !== 'playground') {
      return NextResponse.json({ error: 'ניתן לשריין רק כרטיסיות משחקייה' }, { status: 400 });
    }

    // Check the slot is valid and not blocked.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get('origin') || '';
    const availRes = await fetch(`${baseUrl}/api/playground/availability?date=${date}`, {
      cache: 'no-store',
    });
    if (!availRes.ok) {
      return NextResponse.json({ error: 'לא ניתן לבדוק זמינות כרגע' }, { status: 503 });
    }
    const avail = await availRes.json();

    if (avail.closed) {
      return NextResponse.json({ error: avail.message || 'סגור בתאריך זה' }, { status: 409 });
    }
    const targetSlot = (avail.slots || []).find((s: any) => s.start === slot);
    if (!targetSlot) {
      return NextResponse.json({ error: 'משבצת זמן לא קיימת' }, { status: 400 });
    }
    if (targetSlot.blocked) {
      return NextResponse.json({
        error: targetSlot.showTitle || targetSlot.blockReason || 'משבצת חסומה',
      }, { status: 409 });
    }
    if (targetSlot.active >= targetSlot.max) {
      return NextResponse.json({ error: 'אין מקומות פנויים במשבצת זו' }, { status: 409 });
    }

    // Save reservation on the pass.
    const { data: updated, error: updateError } = await supabase
      .from('passes')
      .update({
        reserved_date: date,
        reserved_slot: slot,
      })
      .eq('id', passId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('reservation update error:', updateError);
      return NextResponse.json({ error: 'שגיאה בשמירת שריון' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      pass: updated,
      reservation: { date, slot, slot_end: targetSlot.end },
    });
  } catch (e: any) {
    console.error('POST reservation error:', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/passes/[id]/reservation
 * Cancels the upcoming reservation on a pass.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabaseAuth = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: passId } = await params;
    const supabase = getServiceClient();

    const { data: pass } = await supabase
      .from('passes')
      .select('id, user_id, reserved_date')
      .eq('id', passId)
      .eq('user_id', user.id)
      .single();

    if (!pass) return NextResponse.json({ error: 'כרטיסייה לא נמצאה' }, { status: 404 });
    if (!pass.reserved_date) return NextResponse.json({ success: true, message: 'אין שריון פעיל' });

    const { error: updateError } = await supabase
      .from('passes')
      .update({ reserved_date: null, reserved_slot: null })
      .eq('id', passId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('reservation delete error:', updateError);
      return NextResponse.json({ error: 'שגיאה בביטול שריון' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('DELETE reservation error:', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
