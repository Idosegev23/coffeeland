import { NextResponse } from 'next/server'
import { fetchClassesEvents } from '@/lib/gcal'

export const revalidate = 300 // Revalidate every 5 minutes

export async function GET() {
  try {
    const events = await fetchClassesEvents()
    
    return NextResponse.json(events, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Failed to fetch classes events:', error)
    
    return NextResponse.json(
      { error: 'Failed to load classes' },
      { status: 500 }
    )
  }
}

