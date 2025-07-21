'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createChart, IChartApi, ISeriesApi, LineData, CandlestickData, ColorType, CrosshairMode, Time } from 'lightweight-charts'
import { 
  CogIcon, 
  ChartBarIcon, 
  BookmarkIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface Indicator {
  id: string
  name: string
  displayName: string
  category: string
  type: 'BUILT_IN' | 'JS_SCRIPT' | 'CUSTOM'
  isActive: boolean
  parameters?: any
  jsCode?: string
  data?: any[]
}

interface LightweightChartProps {
  symbol?: string
  theme?: 'light' | 'dark'
  height?: number | string
  showControls?: boolean
  showIndicatorNames?: boolean
  indicators: Indicator[]
  onIndicatorChange: (indicators: Indicator[]) => void
  templateId?: string
  interval?: string
  realtime?: boolean
}

interface TwelveDataResponse {
  status: string
  values: Array<{
    datetime: string
    open: string
    high: string
    low: string
    close: string
    volume: string
  }>
}

const LightweightChart: React.FC<LightweightChartProps> = ({
  symbol = 'EUR/USD',
  theme = 'dark',
  height = '100%',
  showControls = true,
  showIndicatorNames = true,
  indicators,
  onIndicatorChange,
  templateId,
  interval = '1D',
  realtime = true
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<any>(null)
  const indicatorSeriesRef = useRef<Map<string, any>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [isRealtime, setIsRealtime] = useState(realtime)
  const [showIndicatorPanel, setShowIndicatorPanel] = useState(false)
  const [availableIndicators, setAvailableIndicators] = useState<Indicator[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    // Ensure container has dimensions
    const container = chartContainerRef.current
    if (container.clientWidth === 0 || container.clientHeight === 0) {
      // Wait for container to have dimensions
      const resizeObserver = new ResizeObserver(() => {
        if (container.clientWidth > 0 && container.clientHeight > 0) {
          resizeObserver.disconnect()
          initializeChart()
        }
      })
      resizeObserver.observe(container)
      return
    }

    initializeChart()

    function initializeChart() {
      try {
        // Create chart with minimal configuration first
        const chart = createChart(container, {
          layout: {
            background: { type: ColorType.Solid, color: theme === 'dark' ? '#0F0F0F' : '#FFFFFF' },
            textColor: theme === 'dark' ? '#FFFFFF' : '#000000',
          },
          grid: {
            vertLines: { color: theme === 'dark' ? '#2B2B43' : '#E1E3EF' },
            horzLines: { color: theme === 'dark' ? '#2B2B43' : '#E1E3EF' },
          },
          crosshair: {
            mode: CrosshairMode.Normal,
          },
          rightPriceScale: {
            borderColor: theme === 'dark' ? '#2B2B43' : '#E1E3EF',
          },
          timeScale: {
            borderColor: theme === 'dark' ? '#2B2B43' : '#E1E3EF',
            timeVisible: true,
            secondsVisible: false,
          },
          width: container.clientWidth,
          height: typeof height === 'number' ? height : container.clientHeight,
        })

        chartRef.current = chart

        // Handle resize
        const handleResize = () => {
          if (container && chartRef.current) {
            chartRef.current.applyOptions({
              width: container.clientWidth,
              height: typeof height === 'number' ? height : container.clientHeight,
            })
          }
        }

        window.addEventListener('resize', handleResize)

        return () => {
          window.removeEventListener('resize', handleResize)
          if (chartRef.current) {
            chartRef.current.remove()
          }
        }
      } catch (error) {
        console.error('Failed to initialize chart:', error)
      }
    }
  }, [theme, height])

  // Add candlestick series after chart is initialized
  useEffect(() => {
    if (!chartRef.current || candlestickSeriesRef.current) return

    const addCandlestickSeries = () => {
      try {
        const candlestickSeries = (chartRef.current as any).addSeries('candlestick', {
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        })
        candlestickSeriesRef.current = candlestickSeries
      } catch (error) {
        console.error('Failed to create candlestick series:', error)
      }
    }

    // Try to add series immediately, if it fails, retry after a delay
    addCandlestickSeries()
    
    if (!candlestickSeriesRef.current) {
      const timer = setTimeout(addCandlestickSeries, 500)
      return () => clearTimeout(timer)
    }
  }, [chartRef.current])

  // Load available indicators
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

  // Load market data
  const loadMarketData = useCallback(async () => {
    if (!chartRef.current || !candlestickSeriesRef.current) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/forex/historical?symbol=${symbol}&interval=${interval}`)
      if (response.ok) {
        const data: TwelveDataResponse = await response.json()
        
        const candlestickData: CandlestickData[] = data.values.map(item => ({
          time: (new Date(item.datetime).getTime() / 1000) as Time,
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
        }))

        candlestickSeriesRef.current.setData(candlestickData)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Failed to load market data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [symbol, interval])

  // Load initial data
  useEffect(() => {
    loadMarketData()
  }, [loadMarketData])

  // Real-time updates
  useEffect(() => {
    if (!isRealtime) return

    const interval = setInterval(() => {
      loadMarketData()
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [isRealtime, loadMarketData])

  // Add indicator
  const addIndicator = useCallback(async (indicatorId: string) => {
    const indicator = availableIndicators.find(ind => ind.id === indicatorId)
    if (!indicator || !chartRef.current) return

    let indicatorSeries: any = null

    try {
      if (indicator.type === 'BUILT_IN') {
        // Calculate built-in indicators
        const indicatorData = await calculateBuiltInIndicator(indicator, symbol, interval)
        
        switch (indicator.name.toLowerCase()) {
          case 'rsi':
            indicatorSeries = (chartRef.current as any).addSeries('line', {
              color: '#FF6B6B',
              lineWidth: 2,
              title: showIndicatorNames ? 'RSI' : '',
            })
            break
          case 'macd':
            indicatorSeries = (chartRef.current as any).addSeries('histogram', {
              color: '#4ECDC4',
              title: showIndicatorNames ? 'MACD' : '',
            })
            break
          case 'bb':
            indicatorSeries = (chartRef.current as any).addSeries('area', {
              topColor: 'rgba(76, 175, 80, 0.3)',
              bottomColor: 'rgba(76, 175, 80, 0.0)',
              lineColor: 'rgba(76, 175, 80, 1)',
              lineWidth: 2,
              title: showIndicatorNames ? 'Bollinger Bands' : '',
            })
            break
          default:
            indicatorSeries = (chartRef.current as any).addSeries('line', {
              color: '#FFD93D',
              lineWidth: 2,
              title: showIndicatorNames ? indicator.displayName : '',
            })
        }

        if (indicatorSeries && indicatorData) {
          indicatorSeries.setData(indicatorData)
          indicatorSeriesRef.current.set(indicatorId, indicatorSeries)
        }
      } else if (indicator.type === 'JS_SCRIPT') {
        // Execute JS Script
        const jsData = await executeJsScript(indicator.jsCode || '', symbol, interval)
        if (jsData) {
          indicatorSeries = (chartRef.current as any).addSeries('line', {
            color: '#9C27B0',
            lineWidth: 2,
            title: showIndicatorNames ? indicator.displayName : '',
          })
          if (indicatorSeries) {
            indicatorSeries.setData(jsData)
            indicatorSeriesRef.current.set(indicatorId, indicatorSeries)
          }
        }
      }

      if (indicatorSeries) {
        const newIndicator = { ...indicator, isActive: true }
        onIndicatorChange([...indicators, newIndicator])
      }
    } catch (error) {
      console.error('Failed to add indicator:', error)
    }
  }, [availableIndicators, chartRef, indicators, onIndicatorChange, symbol, interval, showIndicatorNames])

  // Remove indicator
  const removeIndicator = useCallback((indicatorId: string) => {
    const series = indicatorSeriesRef.current.get(indicatorId)
    if (series && chartRef.current) {
      chartRef.current.removeSeries(series)
      indicatorSeriesRef.current.delete(indicatorId)
    }

    const newIndicators = indicators.filter(ind => ind.id !== indicatorId)
    onIndicatorChange(newIndicators)
  }, [indicators, onIndicatorChange])

  // Calculate built-in indicators
  const calculateBuiltInIndicator = async (indicator: Indicator, symbol: string, interval: string) => {
    try {
      const response = await fetch(`/api/indicators/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          indicator: indicator.name,
          symbol,
          interval,
          parameters: indicator.parameters || {}
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.values.map((item: any) => ({
          time: (new Date(item.datetime).getTime() / 1000) as Time,
          value: parseFloat(item.value)
        }))
      }
    } catch (error) {
      console.error('Failed to calculate indicator:', error)
    }
    return null
  }

  // Define executeJsScript before use
  const executeJsScript = async (jsCode: string, symbol: string, interval: string) => {
    try {
      const response = await fetch(`/api/indicators/js-script`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsCode,
          symbol,
          interval
        })
      });
      if (response.ok) {
        const data = await response.json();
        return data.values.map((item: any) => ({
          time: (new Date(item.datetime).getTime() / 1000) as Time,
          value: parseFloat(item.value)
        }));
      }
    } catch (error) {
      console.error('Failed to execute JS Script:', error);
    }
    return null;
  };

  // Save template
  const saveTemplate = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const templateData = {
        name: `custom_template_${Date.now()}`,
        displayName: `Custom Template ${new Date().toLocaleDateString()}`,
        layout: JSON.stringify({ symbol, theme, interval }),
        indicators: JSON.stringify(indicators),
        symbols: JSON.stringify([symbol]),
        timeframe: interval,
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
          <button
            onClick={() => setIsRealtime(!isRealtime)}
            className={`p-2 rounded-lg transition-colors ${
              isRealtime 
                ? 'bg-green-800 hover:bg-green-700 text-green-300' 
                : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
            title={isRealtime ? 'Pause Real-time' : 'Start Real-time'}
          >
            {isRealtime ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
          </button>
          <button
            onClick={loadMarketData}
            disabled={isLoading}
            className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {/* Status Bar */}
      <div className="absolute bottom-2 left-2 z-10 flex items-center space-x-4 text-xs text-gray-400">
        <span>Symbol: {symbol}</span>
        <span>Interval: {interval}</span>
        {lastUpdate && (
          <span>Last Update: {lastUpdate.toLocaleTimeString()}</span>
        )}
        <span className={`flex items-center ${isRealtime ? 'text-green-400' : 'text-gray-500'}`}>
          <div className={`w-2 h-2 rounded-full mr-1 ${isRealtime ? 'bg-green-400' : 'bg-gray-500'}`} />
          {isRealtime ? 'Live' : 'Paused'}
        </span>
      </div>

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
                {indicators.map(indicator => (
                  <div key={indicator.id} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                    <div>
                      <span className="text-white text-sm">{indicator.displayName}</span>
                      <div className="text-xs text-gray-400">{indicator.type}</div>
                    </div>
                    <button
                      onClick={() => removeIndicator(indicator.id)}
                      className="text-red-400 hover:text-red-300"
                      title="Remove Indicator"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Indicators */}
          <div>
            <h4 className="text-sm text-gray-300 mb-2">Available Indicators</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {availableIndicators
                .filter(indicator => !indicators.find(ind => ind.id === indicator.id))
                .map(indicator => (
                  <div key={indicator.id} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded">
                    <div>
                      <span className="text-white text-sm">{indicator.displayName}</span>
                      <div className="text-xs text-gray-400">{indicator.category} • {indicator.type}</div>
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

      {/* Chart Container */}
      <div 
        ref={chartContainerRef} 
        className="w-full h-full"
        style={{ height: typeof height === 'string' ? height : `${height}px` }}
      />
    </div>
  )
}

export default LightweightChart 