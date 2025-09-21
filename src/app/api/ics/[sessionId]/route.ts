import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { buildWorkshopIcs, generateIcsFilename } from '@/lib/ics';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Fetch workshop session with workshop details
    const { data: session, error } = await supabaseAdmin
      .from('workshop_sessions')
      .select(`
        id,
        start_at,
        end_at,
        location,
        status,
        workshops!inner (
          id,
          title,
          description_md,
          is_active
        )
      `)
      .eq('id', sessionId)
      .eq('status', 'scheduled')
      .eq('workshops.is_active', true)
      .single();

    if (error || !session) {
      return NextResponse.json(
        { error: 'Workshop session not found' },
        { status: 404 }
      );
    }

    // Generate ICS content
    const icsContent = buildWorkshopIcs(session as any);
    
    // Generate filename
    const filename = generateIcsFilename((session as any).workshops.title, session.start_at);

    // Return ICS file
    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error generating ICS file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
