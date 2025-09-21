import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { z } from 'zod';

const dataRequestSchema = z.object({
  requesterEmail: z.string().email(),
  requestType: z.enum(['access', 'rectification', 'erasure', 'restriction', 'portability', 'objection']),
  fullName: z.string().min(2),
  idNumber: z.string().min(8).max(9),
  phone: z.string().optional(),
  details: z.string().min(10),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
  preferredResponse: z.enum(['email', 'phone', 'mail']).default('email'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = dataRequestSchema.parse(body);

    // Generate request ID
    const requestId = 'DR-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();

    // Insert data request
    const { data, error } = await supabaseAdmin
      .from('data_requests')
      .insert({
        requester_email: validatedData.requesterEmail,
        type: validatedData.requestType,
        details: JSON.stringify({
          fullName: validatedData.fullName,
          idNumber: validatedData.idNumber,
          phone: validatedData.phone,
          details: validatedData.details,
          urgency: validatedData.urgency,
          preferredResponse: validatedData.preferredResponse,
        }),
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating data request:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to submit request' },
        { status: 500 }
      );
    }

    // Log the request for admin notification
    await supabaseAdmin
      .from('audit_log')
      .insert({
        action: 'data_request_submitted',
        entity: 'data_request',
        entity_id: data.id,
        diff: {
          request_id: requestId,
          type: validatedData.requestType,
          email: validatedData.requesterEmail,
        },
      });

    return NextResponse.json({
      success: true,
      requestId,
      message: 'בקשתכם נשלחה בהצלחה ותטופל בהקדם',
    });

  } catch (error) {
    console.error('Error in data-requests API:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid form data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
