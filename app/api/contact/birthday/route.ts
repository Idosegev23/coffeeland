import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, date, kids_count, message } = body

    if (!name || !phone || !date || !kids_count) {
      return NextResponse.json(
        { error: 'שם, טלפון, תאריך ומספר ילדים הם שדות חובה' },
        { status: 400 }
      )
    }

    const supabase = getServiceClient()

    const { error } = await supabase
      .from('birthday_inquiries')
      .insert({
        name,
        phone,
        email: email || null,
        requested_date: date,
        kids_count: parseInt(kids_count) || 0,
        message: message || null,
        status: 'new',
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Error inserting birthday inquiry:', error)
      return NextResponse.json(
        { error: 'שגיאה בשמירת הפנייה' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Birthday contact error:', err)
    return NextResponse.json(
      { error: 'שגיאה בשרת' },
      { status: 500 }
    )
  }
}
