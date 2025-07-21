import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const interval = searchParams.get('interval')
    
    if (!symbol || !interval) {
      return NextResponse.json(
        { error: 'Symbol and interval are required' },
        { status: 400 }
      )
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/forex/historical?symbol=${symbol}&interval=${interval}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching historical data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    )
  }
} 