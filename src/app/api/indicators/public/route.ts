import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/indicators/public`, {
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
    console.error('Error fetching indicators:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch indicators',
        indicators: [
          { id: 'rsi', name: 'RSI', displayName: 'Relative Strength Index', category: 'MOMENTUM', type: 'BUILT_IN', isActive: true },
          { id: 'macd', name: 'MACD', displayName: 'MACD', category: 'MOMENTUM', type: 'BUILT_IN', isActive: true },
          { id: 'bb', name: 'BB', displayName: 'Bollinger Bands', category: 'VOLATILITY', type: 'BUILT_IN', isActive: true },
          { id: 'ema', name: 'EMA', displayName: 'Exponential Moving Average', category: 'TREND', type: 'BUILT_IN', isActive: true },
          { id: 'sma', name: 'SMA', displayName: 'Simple Moving Average', category: 'TREND', type: 'BUILT_IN', isActive: true },
          { id: 'atr', name: 'ATR', displayName: 'Average True Range', category: 'VOLATILITY', type: 'BUILT_IN', isActive: true },
          { id: 'adx', name: 'ADX', displayName: 'Average Directional Index', category: 'TREND', type: 'BUILT_IN', isActive: true },
          { id: 'stochastic', name: 'Stochastic', displayName: 'Stochastic Oscillator', category: 'MOMENTUM', type: 'BUILT_IN', isActive: true }
        ]
      },
      { status: 500 }
    )
  }
} 