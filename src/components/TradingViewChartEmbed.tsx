'use client'

import React, { useEffect, useRef, useState } from 'react'
import { 
  ArrowTopRightOnSquareIcon,
  CogIcon,
  StarIcon,
  EyeIcon,
  EyeSlashIcon,
  Bars3Icon,
  XMarkIcon
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
  features?: {
    timeframes: boolean
    indicators: boolean
    drawingTools: boolean
    alerts: boolean
    news: boolean
    volume: boolean
    fullscreen: boolean
  }
  chartType?: 'FREE' | 'ADVANCED_LIBRARY' | 'ADVANCED_CHART'
  selectedIndicators?: string[]
}

const TradingViewChartEmbed: React.FC<TradingViewChartEmbedProps> = ({
  symbol = 'FX:EURUSD',
  interval = '1D',
  theme = 'dark',
  height = 600,
  showIndicators = true,
  customIndicators = [],
  customStudies = [],
  showControls = true,
  features,
  chartType = 'FREE',
  selectedIndicators = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const isMountedRef = useRef(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [widgetError, setWidgetError] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [widgetInstance, setWidgetInstance] = useState<any>(null)

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
      // Mark component as unmounted
      isMountedRef.current = false
      
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
      // Reset states on unmount
      if (isMountedRef.current) {
        setIsLoaded(false)
        setWidgetError(null)
        setShowSidebar(false)
        setWidgetInstance(null)
      }
    }
  }, [])

  const createWidget = () => {
    if (!containerRef.current || !(window as any).TradingView) return

    // Clear container
    containerRef.current.innerHTML = ''

    // Ensure container has a unique ID
    const containerId = `tradingview-widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    containerRef.current.id = containerId

    // Reset sidebar state when recreating widget
    setShowSidebar(false)
    setWidgetInstance(null)

    // Determine enabled and disabled features based on chart type and features
    const enabledFeatures = []
    const disabledFeatures = [
      'use_localstorage_for_settings',
      'volume_force_overlay',
      'create_volume_indicator_by_default'
    ]

    // Add features based on chart type and features configuration
    if (features) {
      // Apply user-configured features
      if (features.timeframes) enabledFeatures.push('timeframes_toolbar')
      if (features.indicators) enabledFeatures.push('header_indicators')
      if (features.drawingTools) {
        enabledFeatures.push(
          'side_toolbar',
          'left_toolbar', 
          'drawing_templates',
          'chart_property_page_style',
          'chart_property_page_legend_widget'
        )
        
        // Force sidebar to be visible if showSidebar is true
        if (showSidebar) {
          enabledFeatures.push('side_toolbar_in_fullscreen_mode')
          // Remove any disabled features that might hide the sidebar
          const sidebarIndex = disabledFeatures.indexOf('side_toolbar')
          if (sidebarIndex > -1) {
            disabledFeatures.splice(sidebarIndex, 1)
          }
        }
      }
      if (features.alerts) enabledFeatures.push('header_compare')
      if (features.news) enabledFeatures.push('symbol_info')
      if (features.volume) enabledFeatures.push('volume_force_overlay')
      if (features.fullscreen) enabledFeatures.push('header_fullscreen_button')
      
      // Disable features that are not enabled
      if (!features.timeframes) disabledFeatures.push('timeframes_toolbar')
      if (!features.indicators) disabledFeatures.push('header_indicators')
      if (!features.drawingTools) {
        disabledFeatures.push(
          'side_toolbar',
          'left_toolbar',
          'drawing_templates',
          'chart_property_page_style',
          'chart_property_page_legend_widget'
        )
      }
      if (!features.alerts) disabledFeatures.push('header_compare')
      if (!features.news) disabledFeatures.push('symbol_info')
      if (!features.volume) disabledFeatures.push('volume_force_overlay')
      if (!features.fullscreen) disabledFeatures.push('header_fullscreen_button')
    } else {
      // Default features based on chart type
      switch (chartType) {
        case 'FREE':
          enabledFeatures.push('timeframes_toolbar', 'header_indicators')
          disabledFeatures.push('side_toolbar', 'left_toolbar', 'drawing_templates', 'header_compare', 'symbol_info', 'header_fullscreen_button')
          break
        case 'ADVANCED_LIBRARY':
          enabledFeatures.push(
            'timeframes_toolbar',
            'header_indicators',
            'side_toolbar',
            'left_toolbar',
            'drawing_templates',
            'header_fullscreen_button',
            'chart_property_page_style',
            'chart_property_page_legend_widget'
          )
          break
        case 'ADVANCED_CHART':
          enabledFeatures.push(
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
          )
          break
      }
    }

    // Debug: Log the features being applied
    console.log('Chart Features Configuration:', {
      chartType,
      features,
      enabledFeatures,
      disabledFeatures
    })

    // Create widget
    try {
      const widget = new (window as any).TradingView.widget({
        autosize: true,
        symbol: symbol,
        interval: interval,
        timezone: 'Etc/UTC',
        theme: theme,
        style: '1',
        locale: 'en',
        toolbar_bg: theme === 'dark' ? '#0F0F0F' : '#FFFFFF',
        enable_publishing: false,
        allow_symbol_change: chartType !== 'FREE',
        container_id: containerId,
        studies: [...customIndicators, ...customStudies],
        show_popup_button: true,
        popup_width: '1000',
        popup_height: '650',
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: true,
        show_popup_button: true,
        popup_width: '1000',
        popup_height: '650',
        backgroundColor: theme === 'dark' ? '#0F0F0F' : '#FFFFFF',
        gridColor: theme === 'dark' ? '#2B2B43' : '#E1E3EF',
        width: '100%',
        height: typeof height === 'number' ? height : '100%',
        // Enable drawing tools and chart features
        drawings_access: features?.drawingTools ? { 
          type: 'all', 
          tools: [
            { name: 'Regression Trend' },
            { name: 'Trend Line' },
            { name: 'Horizontal Line' },
            { name: 'Vertical Line' },
            { name: 'Cross Line' },
            { name: 'Parallel Channel' },
            { name: 'Fibonacci Retracement' },
            { name: 'Fibonacci Fan' },
            { name: 'Fibonacci Arc' },
            { name: 'Pitchfork' },
            { name: 'Rectangle' },
            { name: 'Ellipse' },
            { name: 'Triangle' },
            { name: 'Text' },
            { name: 'Brush' },
            { name: 'Ray' },
            { name: 'Arrow' },
            { name: 'Head and Shoulders' },
            { name: 'Double Top' },
            { name: 'Double Bottom' },
            { name: 'Triple Top' },
            { name: 'Triple Bottom' },
            { name: 'Flag' },
            { name: 'Pennant' },
            { name: 'Wedge' },
            { name: 'Channel' },
            { name: 'Callout' },
            { name: 'Measure' }
          ]
        } : { type: 'none' },
        overrides: {
          'paneProperties.background': theme === 'dark' ? '#0F0F0F' : '#FFFFFF',
          'paneProperties.vertGridProperties.color': theme === 'dark' ? '#2B2B43' : '#E1E3EF',
          'paneProperties.horzGridProperties.color': theme === 'dark' ? '#2B2B43' : '#E1E3EF',
          'symbolWatermarkProperties.transparency': 90,
          'scalesProperties.textColor': theme === 'dark' ? '#FFFFFF' : '#000000',
          'scalesProperties.backgroundColor': theme === 'dark' ? '#0F0F0F' : '#FFFFFF',
        },
        disabled_features: disabledFeatures,
        enabled_features: enabledFeatures,
        loading_screen: { backgroundColor: theme === 'dark' ? '#0F0F0F' : '#FFFFFF' },
        favorites: {
          intervals: ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M']
        }
      })
      
      // Store widget instance for sidebar control
      if (isMountedRef.current) {
        setWidgetInstance(widget)
        
        // Auto-show sidebar if drawing tools are enabled
        if (features?.drawingTools) {
          setTimeout(() => {
            if (isMountedRef.current) {
              setShowSidebar(true)
            }
          }, 2000) // Wait for widget to fully load
        }
      }
    } catch (error) {
      console.error('Failed to create TradingView widget:', error)
      if (isMountedRef.current) {
        setWidgetError('Failed to load TradingView chart. Please check your internet connection.')
      }
    }
  }

  // Recreate widget when props change
  useEffect(() => {
    if (isLoaded) {
      createWidget()
    }
  }, [symbol, interval, theme, height, customIndicators, customStudies, chartType, isLoaded])

  // Handle features changes separately to avoid infinite loops
  useEffect(() => {
    if (isLoaded && features) {
      // Only recreate if we have a significant change in features
      const timeoutId = setTimeout(() => {
        createWidget()
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [JSON.stringify(features), isLoaded])

  // Recreate widget when sidebar state changes
  useEffect(() => {
    if (isLoaded && features?.drawingTools) {
      const timeoutId = setTimeout(() => {
        createWidget()
      }, 200)
      
      return () => clearTimeout(timeoutId)
    }
  }, [showSidebar, isLoaded])

  // Function to toggle sidebar
  const toggleSidebar = () => {
    if (features?.drawingTools) {
      try {
        // Method 1: Try to trigger the drawing tools via TradingView's internal methods
        if (widgetInstance && widgetInstance.chart) {
          // Try to access the chart's drawing tools
          const chart = widgetInstance.chart()
          if (chart && chart.toolbar) {
            const toolbar = chart.toolbar()
            if (toolbar && toolbar.sidebar) {
              toolbar.sidebar.toggle()
              setShowSidebar(!showSidebar)
              return
            }
          }
        }
        
        // Method 2: Try to simulate clicking the drawing tools button
        const drawingToolsButton = document.querySelector('[data-name="drawing-tools"]') || 
                                  document.querySelector('[title*="Drawing"]') ||
                                  document.querySelector('[title*="Tools"]')
        
        if (drawingToolsButton) {
          (drawingToolsButton as HTMLElement).click()
          setShowSidebar(!showSidebar)
          return
        }
        
        // Method 3: Try to trigger keyboard shortcut for drawing tools
        const event = new KeyboardEvent('keydown', {
          key: 'd',
          code: 'KeyD',
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
          cancelable: true
        })
        
        if (containerRef.current) {
          containerRef.current.dispatchEvent(event)
          setShowSidebar(!showSidebar)
          return
        }
        
        // Method 4: Try to inject CSS to show/hide the sidebar
        const sidebarElement = document.querySelector('.tv-drawing-toolbar') || 
                              document.querySelector('[class*="drawing"]') ||
                              document.querySelector('[class*="toolbar"]')
        
        if (sidebarElement) {
          const isVisible = (sidebarElement as HTMLElement).style.display !== 'none'
          ;(sidebarElement as HTMLElement).style.display = isVisible ? 'none' : 'block'
          setShowSidebar(!isVisible)
          return
        }
        
        // Method 5: Force recreate widget with different sidebar settings
        console.log('Attempting to recreate widget with sidebar toggle')
        setShowSidebar(!showSidebar)
        setTimeout(() => {
          createWidget()
        }, 100)
        
      } catch (error) {
        console.log('All sidebar toggle methods failed:', error)
        setShowSidebar(!showSidebar)
      }
    }
  }

  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-3">
          <StarIcon className="w-6 h-6 text-yellow-500" />
          <div>
            <h3 className="text-lg font-semibold text-white">
              {chartType === 'FREE' ? 'TradingView Chart' : 
               chartType === 'ADVANCED_LIBRARY' ? 'TradingView Advanced Library' : 
               'TradingView Pro Chart'}
            </h3>
            <p className="text-sm text-gray-400">
              {symbol} • {interval} • {chartType === 'FREE' ? 'Basic Features' : 
              chartType === 'ADVANCED_LIBRARY' ? 'Advanced Features' : 'Premium Features'}
            </p>
            {features && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(features).map(([key, enabled]) => (
                  <span
                    key={key}
                    className={`px-2 py-1 text-xs rounded ${
                      enabled 
                        ? 'bg-green-400/10 text-green-400' 
                        : 'bg-red-400/10 text-red-400'
                    }`}
                  >
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {enabled ? 'ON' : 'OFF'}
                  </span>
                ))}
              </div>
            )}
            {features?.drawingTools && (
              <div className="mt-2 text-xs text-blue-400">
                💡 Drawing tools are available in the left sidebar. 
                {showSidebar ? ' Sidebar is currently visible.' : ' Click "Show Tools" to access drawing tools.'}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {features?.drawingTools && (
            <button
              onClick={toggleSidebar}
              className={`flex items-center space-x-2 px-3 py-2 rounded text-sm transition-colors ${
                showSidebar 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title={showSidebar ? 'Hide Drawing Tools' : 'Show Drawing Tools'}
            >
              {showSidebar ? <XMarkIcon className="w-4 h-4" /> : <Bars3Icon className="w-4 h-4" />}
              <span>{showSidebar ? 'Hide Tools' : 'Show Tools'}</span>
            </button>
          )}
          
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
          className="w-full"
          style={{ height: typeof height === 'number' ? `${height}px` : height }}
        />
        
        {!isLoaded && !widgetError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading TradingView Chart...</p>
            </div>
          </div>
        )}
        
        {widgetError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <div className="text-red-400 mb-2 text-lg">⚠️</div>
              <p className="text-red-400 mb-2">{widgetError}</p>
              <button 
                onClick={() => {
                  setWidgetError(null)
                  createWidget()
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {/* Sidebar Status Indicator */}
        {features?.drawingTools && showSidebar && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
              <Bars3Icon className="w-3 h-3" />
              <span>Drawing Tools Active</span>
            </div>
          </div>
        )}
        
        {/* Custom CSS to force sidebar visibility */}
        {features?.drawingTools && showSidebar && (
          <style jsx>{`
            .tv-drawing-toolbar,
            [class*="drawing"],
            [class*="toolbar"],
            .tv-chart-container [class*="sidebar"],
            .tv-chart-container [class*="toolbar"] {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
            }
          `}</style>
        )}
        
        {/* Manual Drawing Tools Panel */}
        {features?.drawingTools && showSidebar && (
          <div className="absolute left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700 z-20 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Drawing Tools</h3>
              <button
                onClick={toggleSidebar}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-300 mb-3">Click a tool to activate it:</div>
              
              <button className="w-full text-left p-2 hover:bg-gray-700 rounded text-white text-sm">
                ✏️ Trend Line
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-700 rounded text-white text-sm">
                📏 Horizontal Line
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-700 rounded text-white text-sm">
                📐 Vertical Line
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-700 rounded text-white text-sm">
                ➕ Cross Line
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-700 rounded text-white text-sm">
                📦 Rectangle
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-700 rounded text-white text-sm">
                ⭕ Ellipse
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-700 rounded text-white text-sm">
                🔺 Triangle
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-700 rounded text-white text-sm">
                📝 Text
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-700 rounded text-white text-sm">
                🎨 Brush
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-700 rounded text-white text-sm">
                📊 Fibonacci Retracement
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-700 rounded text-white text-sm">
                📈 Fibonacci Fan
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-700 rounded text-white text-sm">
                🎯 Head and Shoulders
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-700 rounded text-white text-sm">
                📏 Measure
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
              <p className="text-xs text-blue-300">
                💡 Tip: Click on the chart after selecting a tool to start drawing
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TradingViewChartEmbed 