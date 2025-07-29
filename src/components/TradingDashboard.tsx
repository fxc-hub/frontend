'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  ChartBarIcon,
  ClockIcon,
  HeartIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlayIcon,
  PauseIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { api } from '../lib/api'

interface WatchlistPair {
  id: string
  symbol: string
  exchange: string
  alertPrice?: number
  notes?: string
  addedAt: string
}

interface Watchlist {
  id: string
  name: string
  description?: string
  isDefault: boolean
  pairs: WatchlistPair[]
  _count: { pairs: number }
}

interface FavoritePair {
  id: string
  symbol: string
  exchange: string
  category: string
  addedAt: string
}

interface PairData {
  symbol: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  volume?: number
}

interface TradingStats {
  totalTrades: number
  winRate: number
  netProfit: number
  profitFactor: number
  maxDrawdown: number
}

export default function TradingDashboard() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([])
  const [favorites, setFavorites] = useState<FavoritePair[]>([])
  const [pairData, setPairData] = useState<Record<string, PairData>>({})
  const [tradingStats, setTradingStats] = useState<TradingStats | null>(null)
  const [activeWatchlist, setActiveWatchlist] = useState<string>('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5000) // 5 seconds
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)
  const [showAddPairModal, setShowAddPairModal] = useState(false)
  const [newPair, setNewPair] = useState({ symbol: '', exchange: 'FOREX' })
  const [dataSource, setDataSource] = useState<string>('loading')
  const [apiMessage, setApiMessage] = useState<string>('')

  // Real market data fetching
  const fetchMarketData = useCallback(async (symbols: string[]): Promise<Record<string, PairData>> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setDataSource('mock_data')
        setApiMessage('Using demo data - No authentication token')
        return generateMockPairData(symbols)
      }

      const symbolsParam = symbols.join(',')
      
      try {
        const response = await api(`/forex/dashboard?symbols=${symbolsParam}`, 'GET', undefined, token)
        
        if (response.data) {
          const pairDataMap: Record<string, PairData> = {}
          
          // Update data source information
          setDataSource(response.data.source || 'api')
          setApiMessage(response.data.message || 'Live market data')
          
          if (response.data.data) {
            response.data.data.forEach((item: any) => {
              pairDataMap[item.symbol] = {
                symbol: item.symbol,
                price: item.price,
                change: item.change || 0,
                changePercent: item.changePercent || 0,
                high: item.price * 1.01, // Approximate high
                low: item.price * 0.99,  // Approximate low
                volume: Math.floor(Math.random() * 1000000) // Mock volume
              }
            })
          }
          
          return pairDataMap
        }
      } catch (apiError) {
        console.error('Failed to fetch market data from API:', apiError)
      }
      
      // Fallback to mock data
      setDataSource('mock_data')
      setApiMessage('Using demo data - API request failed')
      return generateMockPairData(symbols)
    } catch (error) {
      console.error('Error fetching market data:', error)
      setDataSource('mock_data')
      setApiMessage('Using demo data - Unable to connect to market data API')
      return generateMockPairData(symbols)
    }
  }, [])

  // Fallback mock data for when API fails
  const generateMockPairData = useCallback((symbols: string[]): Record<string, PairData> => {
    const mockData: Record<string, PairData> = {}
    symbols.forEach(symbol => {
      const basePrice = 1.0500 + Math.random() * 0.5
      const change = (Math.random() - 0.5) * 0.02
      mockData[symbol] = {
        symbol,
        price: basePrice + change,
        change: change,
        changePercent: (change / basePrice) * 100,
        high: basePrice + Math.abs(change) + Math.random() * 0.01,
        low: basePrice - Math.abs(change) - Math.random() * 0.01,
        volume: Math.floor(Math.random() * 1000000)
      }
    })
    return mockData
  }, [])

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        // Set mock data if no token
        setTradingStats({
          totalTrades: 127,
          winRate: 64.2,
          netProfit: 12847.50,
          profitFactor: 1.68,
          maxDrawdown: -892.30
        })
        setLoading(false)
        return
      }

      // Try to fetch watchlists and favorites from API
      try {
        const [watchlistsRes, favoritesRes] = await Promise.all([
          api('/user/watchlists', 'GET', undefined, token),
          api('/user/favorites', 'GET', undefined, token)
        ])

        if (watchlistsRes.data && watchlistsRes.data.watchlists) {
          setWatchlists(watchlistsRes.data.watchlists)
          if (watchlistsRes.data.watchlists.length > 0 && !activeWatchlist) {
            const defaultWatchlist = watchlistsRes.data.watchlists.find((wl: Watchlist) => wl.isDefault) || watchlistsRes.data.watchlists[0]
            setActiveWatchlist(defaultWatchlist.id)
          }
        }

        if (favoritesRes.data && favoritesRes.data.favorites) {
          setFavorites(favoritesRes.data.favorites)
        }
      } catch (apiError) {
        console.error('Error fetching dashboard data from API:', apiError)
      }

      // Generate mock trading stats
      setTradingStats({
        totalTrades: 127,
        winRate: 64.2,
        netProfit: 12847.50,
        profitFactor: 1.68,
        maxDrawdown: -892.30
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [activeWatchlist])

  const updatePairPrices = useCallback(async () => {
    const allSymbols = new Set<string>()
    
    // Collect all symbols from watchlists and favorites
    watchlists.forEach(wl => wl.pairs.forEach(pair => allSymbols.add(pair.symbol)))
    favorites.forEach(fav => allSymbols.add(fav.symbol))

    if (allSymbols.size === 0) return

    // Fetch real market data for all symbols
    const symbolsArray = Array.from(allSymbols)
    const newPairData = await fetchMarketData(symbolsArray)

    setPairData(newPairData)
    setLastUpdate(new Date())
  }, [watchlists, favorites, fetchMarketData])

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (autoRefresh) {
      interval = setInterval(() => {
        updatePairPrices()
      }, refreshInterval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, updatePairPrices])

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Update prices when watchlists or favorites change
  useEffect(() => {
    if (watchlists.length > 0 || favorites.length > 0) {
      updatePairPrices()
    }
  }, [watchlists, favorites, updatePairPrices])

  const toggleFavorite = async (symbol: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await api('/user/favorites', 'POST', { symbol, exchange: 'FOREX' }, token)

      if (response.data && response.data.isFavorited !== undefined) {
        if (response.data.isFavorited) {
          setFavorites(prev => [...prev, { 
            id: Date.now().toString(), 
            symbol, 
            exchange: 'FOREX', 
            category: 'MAJOR',
            addedAt: new Date().toISOString()
          }])
        } else {
          setFavorites(prev => prev.filter(f => f.symbol !== symbol))
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const addPairToWatchlist = async () => {
    if (!newPair.symbol.trim() || !activeWatchlist) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await api(`/user/watchlists/${activeWatchlist}/pairs`, 'POST', {
        symbol: newPair.symbol.toUpperCase(),
        exchange: newPair.exchange
      }, token)

      if (response.data) {
        fetchDashboardData()
        setShowAddPairModal(false)
        setNewPair({ symbol: '', exchange: 'FOREX' })
      }
    } catch (error) {
      console.error('Error adding pair:', error)
    }
  }

  const formatPrice = (price: number) => price.toFixed(5)
  const formatChange = (change: number) => (change >= 0 ? '+' : '') + change.toFixed(5)
  const formatPercent = (percent: number) => (percent >= 0 ? '+' : '') + percent.toFixed(2) + '%'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const activeWatchlistData = watchlists.find(wl => wl.id === activeWatchlist)

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Trading Dashboard</h2>
          <div className="flex items-center space-x-4">
            <p className="text-gray-400">Real-time market data and portfolio overview</p>
            {/* Data Source Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                dataSource === 'mock_data' ? 'bg-yellow-400' : 
                dataSource === 'loading' ? 'bg-gray-400' :
                'bg-green-400'
              }`}></div>
              <span className={`text-xs ${
                dataSource === 'mock_data' ? 'text-yellow-400' : 
                dataSource === 'loading' ? 'text-gray-400' :
                'text-green-400'
              }`} title={apiMessage}>
                {dataSource === 'mock_data' ? 'Demo Data' : 
                 dataSource === 'loading' ? 'Loading...' :
                 'Live Data'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Auto-refresh Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <ClockIcon className="w-4 h-4" />
            <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                autoRefresh 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {autoRefresh ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              <span>{autoRefresh ? 'Pause' : 'Resume'}</span>
            </button>
            
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              <option value={1000}>1s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trading Stats Overview */}
      {tradingStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Total Trades</div>
            <div className="text-2xl font-bold text-white">{tradingStats.totalTrades}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Win Rate</div>
            <div className="text-2xl font-bold text-green-400">{tradingStats.winRate}%</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Net P&L</div>
            <div className={`text-2xl font-bold ${tradingStats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${tradingStats.netProfit.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Profit Factor</div>
                            <div className="text-2xl font-bold text-yellow-400">{tradingStats.profitFactor}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Max Drawdown</div>
            <div className="text-2xl font-bold text-red-400">${tradingStats.maxDrawdown}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlists */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Watchlists</h3>
            <div className="flex items-center space-x-3">
              {watchlists.length > 0 && (
                <select
                  value={activeWatchlist}
                  onChange={(e) => setActiveWatchlist(e.target.value)}
                  className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                >
                  {watchlists.map(wl => (
                    <option key={wl.id} value={wl.id}>
                      {wl.name} ({wl._count.pairs})
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={() => setShowAddPairModal(true)}
                className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Pair</span>
              </button>
            </div>
          </div>

          {activeWatchlistData && activeWatchlistData.pairs.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-6 gap-4 text-xs font-medium text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-700">
                <div>Symbol</div>
                <div>Price</div>
                <div>Change</div>
                <div>Change %</div>
                <div>High</div>
                <div>Low</div>
              </div>
              {activeWatchlistData.pairs.map(pair => {
                const data = pairData[pair.symbol]
                return (
                  <div key={pair.id} className="grid grid-cols-6 gap-4 items-center py-3 hover:bg-gray-800 rounded-lg px-2 transition-colors">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white">{pair.symbol}</span>
                      <button 
                        onClick={() => toggleFavorite(pair.symbol)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        {favorites.some(f => f.symbol === pair.symbol) ? (
                          <HeartIconSolid className="w-4 h-4 text-red-400" />
                        ) : (
                          <HeartIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="text-white font-mono">{data ? formatPrice(data.price) : '---'}</div>
                    <div className={`font-mono ${data?.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {data ? formatChange(data.change) : '---'}
                    </div>
                    <div className={`font-mono ${data?.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {data ? formatPercent(data.changePercent) : '---'}
                    </div>
                    <div className="text-gray-300 font-mono">{data ? formatPrice(data.high) : '---'}</div>
                    <div className="text-gray-300 font-mono">{data ? formatPrice(data.low) : '---'}</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <EyeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No pairs in watchlist</p>
              <button
                onClick={() => setShowAddPairModal(true)}
                className="mt-4 text-yellow-400 hover:text-yellow-300"
              >
                Add your first pair
              </button>
            </div>
          )}
        </div>

        {/* Favorites & Performance */}
        <div className="space-y-6">
          {/* Favorite Pairs */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Favorite Pairs</h3>
            {favorites.length > 0 ? (
              <div className="space-y-3">
                {favorites.slice(0, 5).map(fav => {
                  const data = pairData[fav.symbol]
                  return (
                    <div key={fav.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{fav.symbol}</div>
                        <div className="text-xs text-gray-400">{fav.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-white text-sm">
                          {data ? formatPrice(data.price) : '---'}
                        </div>
                        <div className={`text-xs font-mono ${data?.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {data ? formatPercent(data.changePercent) : '---'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <StarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No favorite pairs yet</p>
              </div>
            )}
          </div>

          {/* Quick Performance Snapshot */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Performance Snapshot</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Today's P&L</span>
                <span className="text-green-400 font-bold">+$247.80</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Open Positions</span>
                <span className="text-white">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Account Balance</span>
                <span className="text-white font-bold">$15,247.80</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Available Margin</span>
                <span className="text-yellow-400">$12,856.20</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Pair Modal */}
      {showAddPairModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Add Trading Pair</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label>
                <input
                  type="text"
                  value={newPair.symbol}
                  onChange={(e) => setNewPair(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                  placeholder="EURUSD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Exchange</label>
                <select
                  value={newPair.exchange}
                  onChange={(e) => setNewPair(prev => ({ ...prev, exchange: e.target.value }))}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                >
                  <option value="FOREX">Forex</option>
                  <option value="CRYPTO">Crypto</option>
                  <option value="STOCKS">Stocks</option>
                </select>
              </div>
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={addPairToWatchlist}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Pair
                </button>
                <button
                  onClick={() => setShowAddPairModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 