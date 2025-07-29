'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChartBarIcon,
  CogIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import ForexScanner from '../../components/ForexScanner'
import TradingViewChartEmbed from '../../components/TradingViewChartEmbed'
import SimpleChart from '../../components/SimpleChart'
import { api } from '../../lib/api'

interface FeaturedScanner {
  id: number
  name: string
  description: string
  indicator_ids: number[]
  study_ids: string[]
  gradient: string
  is_active: boolean
  indicator_name?: string
  category?: string
  indicator_details?: Array<{
    id: number
    name: string
    display_name: string
    type: string
    category: string
    study_id: string
    js_code?: string
    is_premium: boolean
  }>
}

interface Chart {
  id: string
  name: string
  displayName: string
  description: string
  type: 'FREE' | 'ADVANCED_LIBRARY' | 'ADVANCED_CHART'
  symbol: string
  interval: string
  theme: 'light' | 'dark'
  isActive: boolean
  features: {
    timeframes: boolean
    indicators: boolean
    drawingTools: boolean
    alerts: boolean
    news: boolean
    volume: boolean
    fullscreen: boolean
  }
  dataSource: {
    type: 'tradingview' | 'custom'
    apiKey?: string
    endpoint?: string
  }
  selectedIndicators?: string[]
  createdAt: string
  updatedAt: string
}

const ScannersPage = () => {
  const [showForexScanner, setShowForexScanner] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState('FX:EURUSD')
  const [showEmbeddedChart, setShowEmbeddedChart] = useState(true) // Default to show
  const [useSimpleChart, setUseSimpleChart] = useState(false)
  const [featuredScanners, setFeaturedScanners] = useState<FeaturedScanner[]>([])
  const [selectedIndicators, setSelectedIndicators] = useState<number[]>([])
  const [selectedStudyIds, setSelectedStudyIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState('')
  const [charts, setCharts] = useState<Chart[]>([])
  const [selectedChart, setSelectedChart] = useState<Chart | null>(null)
  const router = useRouter()

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString())
    }
    
    // Set initial time
    updateTime()
    
    // Update every second
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Load featured scanners and charts from admin panel
  useEffect(() => {
    const loadFeaturedScanners = async () => {
      try {
        // Always try to fetch from backend API first
        const response = await fetch('/api/featured-scanners')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.scanners && data.scanners.length > 0) {
            setFeaturedScanners(data.scanners)
            setIsLoading(false)
            return
          }
        }
        
        // Fallback to default scanners if API fails or returns empty
        console.log('Using fallback featured scanners')
        setFeaturedScanners([
          {
            id: 1,
            name: '🔍 Forex Market Scanner',
            description: 'Real-time currency pair analysis with technical indicators',
            indicator_ids: [1, 2, 3], // RSI, MACD, Bollinger Bands
            study_ids: [],
            gradient: 'from-blue-600 to-purple-700',
            is_active: true
          },
          {
            id: 2,
            name: 'Golden Era Scanner',
            description: 'Advanced trend analysis with golden ratio patterns',
            indicator_ids: [4, 5], // EMA, SMA
            study_ids: [],
            gradient: 'from-yellow-500 to-orange-600',
            is_active: true
          },
          {
            id: 3,
            name: 'Quantum Scanner',
            description: 'AI-powered market analysis and predictions',
            indicator_ids: [1, 6], // RSI, Stochastic
            study_ids: [],
            gradient: 'from-cyan-500 to-blue-600',
            is_active: true
          }
        ])
      } catch (error) {
        console.error('Failed to load featured scanners:', error)
        // Final fallback to default scanners
        setFeaturedScanners([
          {
            id: 1,
            name: '🔍 Forex Market Scanner',
            description: 'Real-time currency pair analysis with technical indicators',
            indicator_ids: [1, 2, 3], // RSI, MACD, Bollinger Bands
            study_ids: [],
            gradient: 'from-blue-600 to-purple-700',
            is_active: true
          },
          {
            id: 2,
            name: 'Golden Era Scanner',
            description: 'Advanced trend analysis with golden ratio patterns',
            indicator_ids: [4, 5], // EMA, SMA
            study_ids: [],
            gradient: 'from-yellow-500 to-orange-600',
            is_active: true
          },
          {
            id: 3,
            name: 'Quantum Scanner',
            description: 'AI-powered market analysis and predictions',
            indicator_ids: [1, 6], // RSI, Stochastic
            study_ids: [],
            gradient: 'from-cyan-500 to-blue-600',
            is_active: true
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    const loadCharts = async () => {
      try {
        const chartsResponse = await fetch('/api/charts/active')
        if (chartsResponse.ok) {
          const chartsData = await chartsResponse.json()
          if (chartsData.success && chartsData.charts) {
            setCharts(chartsData.charts)
            // Set the first active chart as selected
            if (chartsData.charts.length > 0) {
              setSelectedChart(chartsData.charts[0])
              setSelectedSymbol(chartsData.charts[0].symbol)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load charts:', error)
      }
    }

    loadFeaturedScanners()
    loadCharts()
  }, [])

  const handlePairSelection = (symbol: string) => {
    setSelectedSymbol(symbol)
  }

  const handleScannerClick = (scanner: FeaturedScanner) => {
    setSelectedIndicators(scanner.indicator_ids)
    setSelectedStudyIds(scanner.study_ids)
    
    // Log detailed information about the selected scanner
    console.log('Selected scanner:', {
      name: scanner.name,
      description: scanner.description,
      category: scanner.category,
      indicatorCount: scanner.indicator_ids.length,
      indicators: scanner.indicator_details?.map(ind => ({
        name: ind.display_name,
        type: ind.type,
        category: ind.category,
        isPremium: ind.is_premium
      }))
    })
    
    // You can add additional logic here like saving to user preferences
  }

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-white">Forex Scanner Dashboard</h1>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowForexScanner(!showForexScanner)}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {showForexScanner ? 'Hide' : 'Show'} Forex Scanner
                </button>
                <button
                  onClick={() => setShowEmbeddedChart(!showEmbeddedChart)}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {showEmbeddedChart ? 'Hide' : 'Show'} TradingView Chart
                </button>
                <button
                  onClick={() => handleNavigation('/economic-news')}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Economic News
                </button>
                <button
                  onClick={() => handleNavigation('/technical-analysis')}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Technical Analysis
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {currentTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Chart and Featured Scanners Row */}
        <div className="grid grid-cols-5 gap-6 mb-8">
          {/* Chart - 80% width */}
          <div className="col-span-4">
            {showEmbeddedChart && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold text-white">Trading Chart</h2>
                    {charts.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Chart:</span>
                        <select
                          value={selectedChart?.id || ''}
                          onChange={(e) => {
                            const chart = charts.find(c => c.id === e.target.value)
                            if (chart) {
                              setSelectedChart(chart)
                              setSelectedSymbol(chart.symbol)
                            }
                          }}
                          className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
                        >
                          {charts.map((chart) => (
                            <option key={chart.id} value={chart.id}>
                              {chart.displayName} ({chart.type})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Symbol:</span>
                      <select
                        value={selectedSymbol}
                        onChange={(e) => setSelectedSymbol(e.target.value)}
                        className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
                      >
                        <option value="FX:EURUSD">EUR/USD</option>
                        <option value="FX:GBPUSD">GBP/USD</option>
                        <option value="FX:USDJPY">USD/JPY</option>
                        <option value="FX:USDCHF">USD/CHF</option>
                        <option value="FX:AUDUSD">AUD/USD</option>
                        <option value="FX:USDCAD">USD/CAD</option>
                      </select>
                    </div>
                    <button
                      onClick={() => setUseSimpleChart(!useSimpleChart)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                    >
                      {useSimpleChart ? 'Use TradingView Chart' : 'Use Simple Chart'}
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      Active Indicators: {selectedIndicators.length}
                    </span>
                    {selectedStudyIds.length > 0 && (
                      <span className="text-sm text-yellow-400">
                        • Custom Studies: {selectedStudyIds.length}
                      </span>
                    )}
                  </div>
                </div>
                
                {useSimpleChart ? (
                  <SimpleChart
                    symbol={selectedSymbol.replace('FX:', '')}
                    theme={selectedChart?.theme || "dark"}
                    height={600}
                  />
                ) : (
                  <TradingViewChartEmbed
                    symbol={selectedSymbol}
                    interval={selectedChart?.interval || "1D"}
                    theme={selectedChart?.theme || "dark"}
                    height={600}
                    customIndicators={selectedIndicators.map(id => `indicator_${id}`)}
                    customStudies={selectedStudyIds}
                    features={selectedChart?.features}
                    chartType={selectedChart?.type}
                    selectedIndicators={selectedChart?.selectedIndicators || []}
                  />
                )}
              </div>
            )}
          </div>

          {/* Featured Scanners - 20% width */}
          <div className="col-span-1">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 h-[600px] overflow-y-auto">
              <h2 className="text-lg font-bold mb-4 text-white">Featured Scanners</h2>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-700 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {featuredScanners.filter(scanner => scanner.is_active).map(scanner => (
                    <div 
                      key={scanner.id} 
                      className={`p-3 rounded-lg bg-gradient-to-r ${scanner.gradient} cursor-pointer transition-transform hover:scale-105`}
                      onClick={() => handleScannerClick(scanner)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-sm text-white">{scanner.name}</h3>
                          <p className="text-xs text-white/80 mt-1">{scanner.description}</p>
                        </div>
                        {scanner.category && scanner.category !== 'combination' && (
                          <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                            {scanner.category}
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs text-white/60">
                          {scanner.indicator_ids.length} indicator{scanner.indicator_ids.length !== 1 ? 's' : ''}
                        </div>
                        {scanner.indicator_details && scanner.indicator_details.length > 0 && (
                          <div className="flex items-center space-x-1">
                            {scanner.indicator_details.slice(0, 2).map((indicator, idx) => (
                              <span 
                                key={idx}
                                className={`text-xs px-1.5 py-0.5 rounded ${
                                  indicator.is_premium 
                                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                                    : 'bg-white/20 text-white/80'
                                }`}
                                title={`${indicator.display_name}${indicator.is_premium ? ' (Premium)' : ''}`}
                              >
                                {indicator.display_name.length > 8 ? indicator.display_name.substring(0, 8) + '...' : indicator.display_name}
                              </span>
                            ))}
                            {scanner.indicator_details.length > 2 && (
                              <span className="text-xs text-white/60">
                                +{scanner.indicator_details.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Content Area */}
        <div className="grid grid-cols-1 gap-8">
          {showForexScanner && (
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <ForexScanner onPairSelect={handlePairSelection} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScannersPage 