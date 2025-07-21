'use client'

import React from 'react'

interface SimpleChartProps {
  symbol?: string
  theme?: 'light' | 'dark'
  height?: number | string
  showControls?: boolean
}

const SimpleChart: React.FC<SimpleChartProps> = ({
  symbol = 'EUR/USD',
  theme = 'dark',
  height = 500,
  showControls = true
}) => {
  return (
    <div className="relative w-full">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div>
            <h3 className="text-lg font-semibold text-white">Simple Chart</h3>
            <p className="text-sm text-gray-400">{symbol} • Live Data</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Use TradingView Chart for full features</span>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div 
        className="w-full bg-gray-900 rounded-lg border border-gray-700 flex items-center justify-center"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="text-white font-medium mb-2">Chart Loading...</h4>
          <p className="text-gray-400 text-sm mb-4">
            If this persists, try the TradingView Chart option below
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>Symbol: {symbol}</span>
            <span>Theme: {theme}</span>
            <span>Status: Initializing</span>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="mt-4 p-4 bg-gray-800 rounded-lg">
        <h4 className="text-sm font-semibold text-white mb-2">Chart Information</h4>
        <div className="text-sm text-gray-400 space-y-1">
          <p>• This is a fallback chart view</p>
          <p>• Use "Show TradingView Chart" for full functionality</p>
          <p>• Your premium indicators are available in TradingView</p>
          <p>• Real-time data and advanced features require TradingView</p>
        </div>
      </div>
    </div>
  )
}

export default SimpleChart 