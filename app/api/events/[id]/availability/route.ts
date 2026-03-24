import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

/**
 * GET /api/events/[id]/availability
 * Returns accurate seat count (bypasses RLS)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServiceClient();
  const eventId = params.id;

  const { data: event } = await supabase
    .from('events')
    .select('id, capacity')
    .eq('id', eventId)
    .single();

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (!event.capacity) {
    return NextResponse.json({ available: null, capacity: null });
  }

  // Count confirmed registrations
  const { count: confirmedCount } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('is_paid', true)
    .neq('status', 'cancelled');

  // Count pending payments (15 min window)
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data: pendingPayments } = await supabase
    .from('payments')
    .select('metadata')
    .eq('status', 'pending')
    .gte('created_at', fifteenMinutesAgo)
    .contains('metadata', { event_id: eventId });

  const pendingCount = (pendingPayments || []).reduce(
    (sum: number, p: any) => sum + (p.metadata?.quantity || 1),
    0
  );

  const totalReserved = (confirmedCount || 0) + pendingCount;
  const available = Math.max(0, event.capacity - totalReserved);

  return NextResponse.json({
    available,
    capacity: event.capacity,
    confirmed: confirmedCount || 0,
    pending: pendingCount,
  });
}
