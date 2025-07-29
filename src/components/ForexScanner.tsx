'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MinusIcon,
  FunnelIcon,
  ClockIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { api } from '../lib/api'

interface CurrencyPair {
  symbol: string
  name: string
  category: 'Major' | 'Minor' | 'Exotic'
  price: number
  change: number
  changePercent: number
  rsi: number
  macd: number
  ema20: number
  ema50: number
  stochastic: number
  bollingerUpper: number
  bollingerLower: number
  signal: 'BUY' | 'SELL' | 'NEUTRAL'
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS'
  volume: number
  lastUpdate: string
}

interface ScannerFilters {
  category: string
  timeframe: string
  rsiMin: number
  rsiMax: number
  signalType: string
  trend: string
  minVolume: number
}

interface ForexScannerProps {
  onPairSelect: (symbol: string) => void;
}

const ForexScanner: React.FC<ForexScannerProps> = ({ onPairSelect }) => {
  const [pairs, setPairs] = useState<CurrencyPair[]>([])
  const [filteredPairs, setFilteredPairs] = useState<CurrencyPair[]>([])
  const [filters, setFilters] = useState<ScannerFilters>({
    category: 'ALL',
    timeframe: 'H1',
    rsiMin: 0,
    rsiMax: 100,
    signalType: 'ALL',
    trend: 'ALL',
    minVolume: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Fetch real or mock forex data
  const fetchForexData = async (): Promise<CurrencyPair[]> => {
    try {
      // Try to fetch from backend API first
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await api('/forex/dashboard', 'GET', undefined, token)
          if (response.data && response.data.pairs) {
            return response.data.pairs
          }
        } catch (apiError) {
          console.error('Error fetching forex data from API:', apiError)
        }
      }
      
      // Fallback to mock data if API fails or no token
      return generateMockData()
    } catch (error) {
      console.error('Error fetching forex data:', error)
      return generateMockData()
    }
  }

  // Generate mock forex data with realistic values (fallback)
  const generateMockData = (): CurrencyPair[] => {
    const majorPairs = [
      { symbol: 'EURUSD', name: 'Euro / US Dollar' },
      { symbol: 'GBPUSD', name: 'British Pound / US Dollar' },
      { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen' },
      { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc' },
      { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar' },
      { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar' },
      { symbol: 'NZDUSD', name: 'New Zealand Dollar / US Dollar' }
    ]

    const minorPairs = [
      { symbol: 'EURGBP', name: 'Euro / British Pound' },
      { symbol: 'EURJPY', name: 'Euro / Japanese Yen' },
      { symbol: 'GBPJPY', name: 'British Pound / Japanese Yen' },
      { symbol: 'EURCHF', name: 'Euro / Swiss Franc' },
      { symbol: 'GBPCHF', name: 'British Pound / Swiss Franc' },
      { symbol: 'AUDJPY', name: 'Australian Dollar / Japanese Yen' }
    ]

    const exoticPairs = [
      { symbol: 'USDTRY', name: 'US Dollar / Turkish Lira' },
      { symbol: 'USDZAR', name: 'US Dollar / South African Rand' },
      { symbol: 'USDMXN', name: 'US Dollar / Mexican Peso' },
      { symbol: 'EURPLN', name: 'Euro / Polish Zloty' },
      { symbol: 'GBPTRY', name: 'British Pound / Turkish Lira' }
    ]

    const allPairs = [
      ...majorPairs.map(p => ({ ...p, category: 'Major' as const })),
      ...minorPairs.map(p => ({ ...p, category: 'Minor' as const })),
      ...exoticPairs.map(p => ({ ...p, category: 'Exotic' as const }))
    ]

    return allPairs.map(pair => {
      const price = Math.random() * 2 + 0.5
      const change = (Math.random() - 0.5) * 0.02
      const changePercent = (change / price) * 100
      const rsi = Math.random() * 100
      const macd = (Math.random() - 0.5) * 0.01
      const ema20 = price + (Math.random() - 0.5) * 0.05
      const ema50 = price + (Math.random() - 0.5) * 0.1
      const stochastic = Math.random() * 100
      const bollingerUpper = price + Math.random() * 0.05
      const bollingerLower = price - Math.random() * 0.05

      // Generate signals based on technical indicators
      let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL'
      let trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS' = 'SIDEWAYS'

      // RSI-based signals
      if (rsi < 30 && ema20 > ema50) signal = 'BUY'
      else if (rsi > 70 && ema20 < ema50) signal = 'SELL'
      else if (price < bollingerLower) signal = 'BUY'
      else if (price > bollingerUpper) signal = 'SELL'

      // Trend determination
      if (ema20 > ema50 && macd > 0) trend = 'BULLISH'
      else if (ema20 < ema50 && macd < 0) trend = 'BEARISH'

      return {
        ...pair,
        price: parseFloat(price.toFixed(5)),
        change: parseFloat(change.toFixed(5)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        rsi: parseFloat(rsi.toFixed(1)),
        macd: parseFloat(macd.toFixed(5)),
        ema20: parseFloat(ema20.toFixed(5)),
        ema50: parseFloat(ema50.toFixed(5)),
        stochastic: parseFloat(stochastic.toFixed(1)),
        bollingerUpper: parseFloat(bollingerUpper.toFixed(5)),
        bollingerLower: parseFloat(bollingerLower.toFixed(5)),
        signal,
        trend,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        lastUpdate: new Date().toLocaleTimeString()
      }
    })
  }

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Initialize data and set up real-time updates
  useEffect(() => {
    if (!isMounted) return

    const loadInitialData = async () => {
      const initialData = await fetchForexData()
      setPairs(initialData)
      setFilteredPairs(initialData)
      setIsLoading(false)
    }

    loadInitialData()

    // Simulate real-time updates every 30 seconds
    const interval = setInterval(async () => {
      const updatedData = await fetchForexData()
      setPairs(updatedData)
    }, 30000)

    return () => clearInterval(interval)
  }, [isMounted])

  // Apply filters whenever filters or pairs change
  useEffect(() => {
    let filtered = pairs

    if (filters.category !== 'ALL') {
      filtered = filtered.filter(pair => pair.category === filters.category)
    }

    if (filters.signalType !== 'ALL') {
      filtered = filtered.filter(pair => pair.signal === filters.signalType)
    }

    if (filters.trend !== 'ALL') {
      filtered = filtered.filter(pair => pair.trend === filters.trend)
    }

    filtered = filtered.filter(pair => 
      pair.rsi >= filters.rsiMin && 
      pair.rsi <= filters.rsiMax &&
      pair.volume >= filters.minVolume
    )

    setFilteredPairs(filtered)
  }, [filters, pairs])

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'text-green-400 bg-green-400/10'
      case 'SELL': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'BULLISH': return 'text-green-400'
      case 'BEARISH': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpIcon className="w-4 h-4 text-green-400" />
    if (change < 0) return <ArrowDownIcon className="w-4 h-4 text-red-400" />
    return <MinusIcon className="w-4 h-4 text-gray-400" />
  }

  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading Forex Scanner...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <CurrencyDollarIcon className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Forex Market Scanner</h2>
            <p className="text-gray-400">Real-time currency pair analysis with technical indicators</p>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FunnelIcon className="w-5 h-5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
              >
                <option value="ALL">All Pairs</option>
                <option value="Major">Major Pairs</option>
                <option value="Minor">Minor Pairs</option>
                <option value="Exotic">Exotic Pairs</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe</label>
              <select
                value={filters.timeframe}
                onChange={(e) => setFilters({ ...filters, timeframe: e.target.value })}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
              >
                <option value="M1">1 Minute</option>
                <option value="M5">5 Minutes</option>
                <option value="M15">15 Minutes</option>
                <option value="M30">30 Minutes</option>
                <option value="H1">1 Hour</option>
                <option value="H4">4 Hours</option>
                <option value="D1">Daily</option>
                <option value="W1">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Signal Type</label>
              <select
                value={filters.signalType}
                onChange={(e) => setFilters({ ...filters, signalType: e.target.value })}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
              >
                <option value="ALL">All Signals</option>
                <option value="BUY">Buy Signals</option>
                <option value="SELL">Sell Signals</option>
                <option value="NEUTRAL">Neutral</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">RSI Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.rsiMin}
                  onChange={(e) => setFilters({ ...filters, rsiMin: parseInt(e.target.value) })}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                  placeholder="Min"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.rsiMax}
                  onChange={(e) => setFilters({ ...filters, rsiMax: parseInt(e.target.value) })}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{filteredPairs.length}</div>
          <div className="text-gray-400">Total Pairs</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">
            {filteredPairs.filter(p => p.signal === 'BUY').length}
          </div>
          <div className="text-gray-400">Buy Signals</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">
            {filteredPairs.filter(p => p.signal === 'SELL').length}
          </div>
          <div className="text-gray-400">Sell Signals</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-400">
            {filteredPairs.filter(p => p.signal === 'NEUTRAL').length}
          </div>
          <div className="text-gray-400">Neutral</div>
        </div>
      </div>

      {/* Currency Pairs Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Pair
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Change
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                RSI
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                MACD
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Stochastic
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Signal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Trend
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Volume
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {filteredPairs.map((pair) => (
              <tr 
                key={pair.symbol} 
                className="hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => onPairSelect(pair.symbol)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-white">{pair.symbol}</div>
                    <div className="text-xs text-gray-400">{pair.category}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white font-mono">{pair.price}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    {getChangeIcon(pair.change)}
                    <span className={`text-sm ${pair.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pair.changePercent}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    <span className={pair.rsi < 30 ? 'text-green-400' : pair.rsi > 70 ? 'text-red-400' : 'text-white'}>
                      {pair.rsi}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${pair.macd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pair.macd}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">{pair.stochastic}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSignalColor(pair.signal)}`}>
                    {pair.signal}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${getTrendColor(pair.trend)}`}>
                    {pair.trend}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-400">
                    {pair.volume.toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Last Update Info */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-4 h-4" />
          <span>Last updated: {pairs[0]?.lastUpdate || 'Loading...'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="w-4 h-4" />
          <span>Timeframe: {filters.timeframe}</span>
        </div>
      </div>

      {/* No Results */}
      {filteredPairs.length === 0 && (
        <div className="text-center py-12">
          <CurrencyDollarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No pairs found</h3>
          <p className="text-gray-400">
            Try adjusting your filters to see more results
          </p>
        </div>
      )}
    </div>
  )
}

export default ForexScanner 