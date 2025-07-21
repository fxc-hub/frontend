'use client'

import React, { useEffect, useRef, memo, useState } from 'react'
import { 
  CogIcon, 
  ChartBarIcon, 
  BookmarkIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface TradingViewIndicator {
  id: string
  name: string
  displayName: string
  category: string
  type: 'BUILT_IN' | 'PINE_SCRIPT'
  isActive: boolean
  parameters?: any
}

interface TradingViewConfig {
  symbol: string
  theme: 'light' | 'dark'
  interval: string
  indicators: string[]
  template?: string
  autosize: boolean
  toolbar: boolean
  studies: string[]
}

interface EnhancedTradingViewWidgetProps {
  symbol?: string
  theme?: 'light' | 'dark'
  height?: number | string
  showControls?: boolean
  indicators: string[]
  onIndicatorChange: (indicators: string[]) => void
  templateId?: string
}

const EnhancedTradingViewWidget: React.FC<EnhancedTradingViewWidgetProps> = ({
  symbol = 'FX:EURUSD',
  theme = 'dark',
  height = '100%',
  showControls = true,
  indicators,
  onIndicatorChange,
  templateId
}) => {
  const container = useRef<HTMLDivElement>(null)
  const [availableIndicators, setAvailableIndicators] = useState<TradingViewIndicator[]>([])
  const [showIndicatorPanel, setShowIndicatorPanel] = useState(false)

  // Load available indicators from API
  useEffect(() => {
    const loadIndicators = async () => {
      try {
        const response = await fetch('/api/indicators/public')
        if (response.ok) {
          const data = await response.json()
          setAvailableIndicators(data.indicators || [])
        }
      } catch (error) {
        console.error('Failed to load indicators:', error)
        // Use default built-in indicators as fallback
        setAvailableIndicators([
          { id: 'rsi', name: 'RSI', displayName: 'Relative Strength Index', category: 'MOMENTUM', type: 'BUILT_IN', isActive: true },
          { id: 'macd', name: 'MACD', displayName: 'MACD', category: 'MOMENTUM', type: 'BUILT_IN', isActive: true },
          { id: 'bb', name: 'BB', displayName: 'Bollinger Bands', category: 'VOLATILITY', type: 'BUILT_IN', isActive: true },
          { id: 'ema', name: 'EMA', displayName: 'Exponential Moving Average', category: 'TREND', type: 'BUILT_IN', isActive: true },
          { id: 'sma', name: 'SMA', displayName: 'Simple Moving Average', category: 'TREND', type: 'BUILT_IN', isActive: true },
          { id: 'atr', name: 'ATR', displayName: 'Average True Range', category: 'VOLATILITY', type: 'BUILT_IN', isActive: true },
          { id: 'adx', name: 'ADX', displayName: 'Average Directional Index', category: 'TREND', type: 'BUILT_IN', isActive: true },
          { id: 'stochastic', name: 'Stochastic', displayName: 'Stochastic Oscillator', category: 'MOMENTUM', type: 'BUILT_IN', isActive: true }
        ])
      }
    }

    loadIndicators()
  }, [])

  // Initialize TradingView widget
  useEffect(() => {
    if (container.current) {
      // Clear previous widget
      container.current.innerHTML = ''

      const script = document.createElement("script")
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
      script.type = "text/javascript"
      script.async = true

      // Build studies array from active indicators
      const studies = indicators.map(indicatorId => {
        const indicator = availableIndicators.find(ind => ind.id === indicatorId)
        if (!indicator) return null

        switch (indicator.name.toLowerCase()) {
          case 'rsi':
            return 'STD;RSI'
          case 'macd':
            return 'STD;MACD'
          case 'bb':
            return 'STD;Bollinger Bands'
          case 'ema':
            return 'STD;EMA%1%2%3%4%5'
          case 'sma':
            return 'STD;SMA%1%2%3%4%5'
          case 'stochastic':
            return 'STD;Stochastic'
          case 'atr':
            return 'STD;ATR'
          case 'adx':
            return 'STD;ADX'
          default:
            // For Pine Script indicators, use custom format
            return indicator.type === 'PINE_SCRIPT' ? `PINE:${indicator.name}` : null
        }
      }).filter(Boolean)

      const widgetConfig = {
        allow_symbol_change: true,
        calendar: false,
        details: false,
        hide_side_toolbar: !showControls,
        hide_top_toolbar: true,
        hide_legend: false,
        hide_volume: false,
        hotlist: false,
        interval: 'D',
        locale: "en",
        save_image: true,
        style: "1",
        symbol: symbol,
        theme: theme,
        timezone: "Etc/UTC",
        backgroundColor: theme === 'dark' ? "#0F0F0F" : "#FFFFFF",
        gridColor: theme === 'dark' ? "rgba(242, 242, 242, 0.06)" : "rgba(0, 0, 0, 0.06)",
        watchlist: [],
        withdateranges: true,
        compareSymbols: [],
        show_popup_button: true,
        popup_height: "650",
        popup_width: "1000",
        studies: studies,
        autosize: true,
        height: typeof height === 'number' ? height : undefined
      }

      script.innerHTML = JSON.stringify(widgetConfig)
      container.current.appendChild(script)
    }
  }, [symbol, theme, indicators, availableIndicators, height, showControls])

  const addIndicator = (indicatorId: string) => {
    if (!indicators.includes(indicatorId)) {
      const newIndicators = [...indicators, indicatorId]
      onIndicatorChange(newIndicators)
    }
  }

  const removeIndicator = (indicatorId: string) => {
    const newIndicators = indicators.filter(id => id !== indicatorId)
    onIndicatorChange(newIndicators)
  }

  const saveTemplate = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const templateData = {
        name: `custom_template_${Date.now()}`,
        displayName: `Custom Template ${new Date().toLocaleDateString()}`,
        layout: JSON.stringify({ symbol, theme, interval: 'D' }),
        indicators: JSON.stringify(indicators),
        symbols: JSON.stringify([symbol]),
        timeframe: 'D',
        theme: theme
      }

      const response = await fetch('/api/trading-view/templates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      })

      if (response.ok) {
        console.log('Template saved successfully')
      }
    } catch (error) {
      console.error('Failed to save template:', error)
    }
  }

  // New: Remove all indicators at once
  const removeAllIndicators = () => {
    onIndicatorChange([])
  }

  return (
    <div className="relative w-full h-full">
      {/* Controls Panel */}
      {showControls && (
        <div className="absolute top-2 right-2 z-10 flex space-x-2">
          <button
            onClick={() => setShowIndicatorPanel(!showIndicatorPanel)}
            className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
            title="Manage Indicators"
          >
            <ChartBarIcon className="w-5 h-5" />
          </button>
          <button
            onClick={saveTemplate}
            className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
            title="Save Template"
          >
            <BookmarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Trash Icon on the Chart */}
      {showControls && indicators.length > 0 && (
        <button
          onClick={removeAllIndicators}
          className="absolute top-2 left-2 z-10 bg-gray-800 hover:bg-gray-700 text-red-400 hover:text-red-300 p-2 rounded-lg transition-colors"
          title="Remove All Indicators"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      )}

      {/* Indicator Management Panel */}
      {showIndicatorPanel && (
        <div className="absolute top-12 right-2 z-20 bg-gray-800 rounded-lg p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Indicators</h3>
            <button
              onClick={() => setShowIndicatorPanel(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* Active Indicators */}
          <div className="mb-4">
            <h4 className="text-sm text-gray-300 mb-2">Active Indicators</h4>
            {indicators.length === 0 ? (
              <p className="text-xs text-gray-500">No indicators active</p>
            ) : (
              <div className="space-y-2">
                {indicators.map(indicatorId => {
                  const indicator = availableIndicators.find(ind => ind.id === indicatorId)
                  return indicator ? (
                    <div key={indicatorId} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                      <span className="text-white text-sm">{indicator.displayName}</span>
                      {/* The delete button for removing an indicator is here: */}
                      <button
                        onClick={() => removeIndicator(indicatorId)}
                        className="text-red-400 hover:text-red-300"
                        title="Remove Indicator"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null
                })}
              </div>
            )}
          </div>

          {/* Available Indicators */}
          <div>
            <h4 className="text-sm text-gray-300 mb-2">Available Indicators</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {availableIndicators
                .filter(indicator => !indicators.includes(indicator.id))
                .map(indicator => (
                  <div key={indicator.id} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded">
                    <div>
                      <span className="text-white text-sm">{indicator.displayName}</span>
                      <div className="text-xs text-gray-400">{indicator.category}</div>
                    </div>
                    <button
                      onClick={() => addIndicator(indicator.id)}
                      className="text-green-400 hover:text-green-300"
                      title="Add Indicator"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TradingView Widget Container */}
      <div 
        className="tradingview-widget-container" 
        ref={container} 
        style={{ height: typeof height === 'string' ? height : `${height}px`, width: "100%" }}
      >
        <div 
          className="tradingview-widget-container__widget" 
          style={{ height: "calc(100% - 32px)", width: "100%" }}
        />
        <div className="tradingview-widget-copyright">
          <a 
            href="https://www.tradingview.com/" 
            rel="noopener nofollow" 
            target="_blank"
            className="text-blue-400 hover:text-blue-300 text-xs"
          >
            <span>Track all markets on TradingView</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default memo(EnhancedTradingViewWidget) 