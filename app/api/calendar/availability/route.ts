import { NextResponse } from 'next/server'
import { fetchAvailabilityEvents } from '@/lib/gcal'

export const revalidate = 300 // Revalidate every 5 minutes

export async function GET() {
  try {
    const events = await fetchAvailabilityEvents()
    
    return NextResponse.json(events, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Failed to fetch availability events:', error)
    
    return NextResponse.json(
      { error: 'Failed to load availability' },
      { status: 500 }
    )
  }
}

