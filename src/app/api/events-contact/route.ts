import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const eventContactSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  childAge: z.string(),
  preferredDate: z.string(),
  alternativeDate: z.string().optional(),
  guestCount: z.string(),
  packageType: z.enum(['basic', 'premium', 'deluxe']),
  additionalServices: z.array(z.string()).optional(),
  specialRequests: z.string().optional(),
  marketingConsent: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = eventContactSchema.parse(body);

    // Generate lead ID
    const leadId = 'EV-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();

    // Store the lead in audit_log for now (could be a separate leads table)
    await supabaseAdmin
      .from('audit_log')
      .insert({
        action: 'event_lead_submitted',
        entity: 'event_lead',
        entity_id: leadId,
        diff: {
          lead_id: leadId,
          contact_details: {
            name: validatedData.name,
            phone: validatedData.phone,
            email: validatedData.email,
          },
          event_details: {
            child_age: validatedData.childAge,
            preferred_date: validatedData.preferredDate,
            alternative_date: validatedData.alternativeDate,
            guest_count: validatedData.guestCount,
            package_type: validatedData.packageType,
            additional_services: validatedData.additionalServices || [],
            special_requests: validatedData.specialRequests,
          },
          marketing_consent: validatedData.marketingConsent || false,
          submitted_at: new Date().toISOString(),
        },
      });

    // Store marketing consent if provided
    if (validatedData.marketingConsent) {
      await supabaseAdmin
        .from('consents')
        .insert({
          email: validatedData.email,
          channel: 'website_form',
          purpose: 'marketing_communications',
          source: 'events_contact_form',
        });
    }

    return NextResponse.json({
      success: true,
      leadId,
      message: 'בקשתכם נשלחה בהצלחה! נחזור אליכם בהקדם',
    });

  } catch (error) {
    console.error('Error in events-contact API:', error);
    
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
