'use client'

import React, { useEffect, useRef, useState } from 'react'
import { 
  ArrowTopRightOnSquareIcon,
  CogIcon,
  StarIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface TradingViewChartEmbedProps {
  symbol?: string
  interval?: string
  theme?: 'light' | 'dark'
  height?: number | string
  showIndicators?: boolean
  customIndicators?: string[]
  customStudies?: string[]
  showControls?: boolean
}

const TradingViewChartEmbed: React.FC<TradingViewChartEmbedProps> = ({
  symbol = 'FX:EURUSD',
  interval = '1D',
  theme = 'dark',
  height = 600,
  showIndicators = true,
  customIndicators = [],
  customStudies = [],
  showControls = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    // Load TradingView widget script
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      setIsLoaded(true)
      createWidget()
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const createWidget = () => {
    if (!containerRef.current || !(window as any).TradingView) return

    // Clear container
    containerRef.current.innerHTML = ''

    // Create widget
    new (window as any).TradingView.widget({
      autosize: true,
      symbol: symbol,
      interval: interval,
      timezone: 'Etc/UTC',
      theme: theme,
      style: '1',
      locale: 'en',
      toolbar_bg: theme === 'dark' ? '#0F0F0F' : '#FFFFFF',
      enable_publishing: false,
      allow_symbol_change: true,
      container_id: containerRef.current.id,
      studies: [...customIndicators, ...customStudies],
      show_popup_button: true,
      popup_width: '1000',
      popup_height: '650',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      backgroundColor: theme === 'dark' ? '#0F0F0F' : '#FFFFFF',
      gridColor: theme === 'dark' ? '#2B2B43' : '#E1E3EF',
      width: '100%',
      height: typeof height === 'number' ? height : '100%',
      // Enable drawing tools and chart features
      drawings_access: { type: 'all', tools: [{ name: 'Regression Trend' }] },
      overrides: {
        'paneProperties.background': theme === 'dark' ? '#0F0F0F' : '#FFFFFF',
        'paneProperties.vertGridProperties.color': theme === 'dark' ? '#2B2B43' : '#E1E3EF',
        'paneProperties.horzGridProperties.color': theme === 'dark' ? '#2B2B43' : '#E1E3EF',
        'symbolWatermarkProperties.transparency': 90,
        'scalesProperties.textColor': theme === 'dark' ? '#FFFFFF' : '#000000',
        'scalesProperties.backgroundColor': theme === 'dark' ? '#0F0F0F' : '#FFFFFF',
      },
      // Enable all TradingView features including drawing tools
      disabled_features: [
        'use_localstorage_for_settings',
        'volume_force_overlay',
        'create_volume_indicator_by_default'
      ],
      enabled_features: [
        'study_templates',
        'side_toolbar_in_fullscreen_mode',
        'header_symbol_search',
        'header_compare',
        'header_settings',
        'header_indicators',
        'header_fullscreen_button',
        'header_screenshot',
        'timeframes_toolbar',
        'show_interval_dialog_on_key_press',
        'symbol_info',
        'chart_property_page_background',
        'chart_property_page_scales',
        'chart_property_page_timezone_sessions',
        'chart_property_page_trading',
        'chart_property_page_style',
        'chart_property_page_legend_widget',
        'chart_property_page_compare',
        'drawing_templates',
        'side_toolbar',
        'left_toolbar',
        'header_chart_type',
        'header_undo_redo',
        'header_saveload'
      ],
      loading_screen: { backgroundColor: theme === 'dark' ? '#0F0F0F' : '#FFFFFF' },
      favorites: {
        intervals: ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M']
      }
    })
  }

  // Recreate widget when props change
  useEffect(() => {
    if (isLoaded) {
      createWidget()
    }
  }, [symbol, interval, theme, height, customIndicators, customStudies, isLoaded])

  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-3">
          <StarIcon className="w-6 h-6 text-yellow-500" />
          <div>
            <h3 className="text-lg font-semibold text-white">TradingView Pro Chart</h3>
            <p className="text-sm text-gray-400">
              {symbol} • {interval} • Premium Indicators Enabled
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors"
          >
            <CogIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>
          
          <a
            href={`https://www.tradingview.com/chart/?symbol=${symbol}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors"
          >
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            <span>Open in TradingView</span>
          </a>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg">
          <h4 className="text-sm font-semibold text-white mb-3">Chart Settings</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-gray-400">Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => {/* Handle symbol change */}}
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="FX:EURUSD"
              />
            </div>
            <div>
              <label className="text-gray-400">Interval</label>
              <select
                value={interval}
                onChange={(e) => {/* Handle interval change */}}
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="1">1m</option>
                <option value="5">5m</option>
                <option value="15">15m</option>
                <option value="30">30m</option>
                <option value="60">1h</option>
                <option value="240">4h</option>
                <option value="1D">1D</option>
                <option value="1W">1W</option>
                <option value="1M">1M</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="text-gray-400">Premium Indicators</label>
            <div className="mt-2 space-y-2">
              {customIndicators.length > 0 ? (
                customIndicators.map((indicator, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <span className="text-white text-sm">{indicator}</span>
                    <div className="flex items-center space-x-2">
                      <EyeIcon className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-400">Active</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  No premium indicators loaded. Add them in your TradingView account.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div className="relative">
        <div
          ref={containerRef}
          id="tradingview-widget"
          className="w-full"
          style={{ height: typeof height === 'number' ? `${height}px` : height }}
        />
        
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading TradingView Chart...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TradingViewChartEmbed 