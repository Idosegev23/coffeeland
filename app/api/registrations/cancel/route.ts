import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const serviceClient = getServiceClient();
    
    // Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { registration_id } = await req.json();

    // Get registration with event details
    const { data: registration, error } = await serviceClient
      .from('registrations')
      .select(`
        *,
        event:events!inner(
          id,
          title,
          start_at,
          cancellation_deadline_hours
        )
      `)
      .eq('id', registration_id)
      .eq('user_id', user.id)
      .single();

    if (error || !registration) {
      console.error('Registration not found:', error);
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Check if already cancelled
    if (registration.status === 'cancelled') {
      return NextResponse.json({ error: 'Already cancelled' }, { status: 400 });
    }

    // Check cancellation deadline
    const event = Array.isArray(registration.event) ? registration.event[0] : registration.event;
    const showTime = new Date(event.start_at);
    const now = new Date();
    const hoursUntilShow = (showTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    const deadline = event.cancellation_deadline_hours || 24;

    if (hoursUntilShow < deadline) {
      return NextResponse.json({ 
        error: `Cannot cancel - deadline passed (must cancel at least ${deadline} hours before)` 
      }, { status: 400 });
    }

    // Cancel registration
    await serviceClient
      .from('registrations')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', registration_id);

    // Find and mark payment as refunded
    const { data: payment } = await serviceClient
      .from('payments')
      .select('*')
      .eq('metadata->registration_id', registration_id)
      .single();

    if (payment) {
      await serviceClient
        .from('payments')
        .update({ 
          status: 'refunded',
          refunded_at: new Date().toISOString(),
          notes: 'Ticket cancelled by user - refund pending'
        })
        .eq('id', payment.id);
    }

    // TODO: Integrate with PayPlus refund API if available
    // For now, this marks for manual refund processing

    console.log(`✅ Ticket cancelled: registration ${registration_id}, payment ${payment?.id || 'none'}`);

    return NextResponse.json({ 
      success: true,
      message: 'הכרטיס בוטל בהצלחה. ההחזר הכספי יעובד תוך 3-5 ימי עסקים.'
    });

  } catch (error) {
    console.error('Error cancelling ticket:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
