import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    
    const response = await fetch(`${backendUrl}/api/indicators/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error calculating indicator:', error)
    return NextResponse.json(
      { error: 'Failed to calculate indicator' },
      { status: 500 }
    )
  }
} 