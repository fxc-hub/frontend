'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  HeartIcon,
  StarIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TagIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import UserNavigation from '@/components/UserNavigation'

interface Indicator {
  id: string
  name: string
  displayName: string
  description: string
  category: string
  subscriptionTier: string
  price: number
  currency: string
  rating: number
  reviewCount: number
  downloads: number
  tags: string[]
  demoVideo?: string
  screenshots: string[]
  features: string[]
  latestVersion: {
    version: string
    changelog: string
    downloads: number
  } | null
  recentReviews: Array<{
    id: string
    rating: number
    title: string
    comment: string
    createdAt: string
    user: {
      name: string
      plan: string
    }
  }>
  isFavorited: boolean
  isPurchased: boolean
  favoriteCount: number
  canAccess: boolean
  createdAt: string
}

interface MarketplaceResponse {
  indicators: Indicator[]
  pagination: {
    current: number
    total: number
    count: number
    hasNext: boolean
    hasPrev: boolean
  }
  userTier: string
}

export default function MarketplacePage() {
  const router = useRouter()
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<MarketplaceResponse['pagination']>({
    current: 1,
    total: 1,
    count: 0,
    hasNext: false,
    hasPrev: false
  })
  const [userTier, setUserTier] = useState('FREE')
  const [userInfo, setUserInfo] = useState<{
    firstName?: string
    lastName?: string
    email?: string
  } | undefined>(undefined)
  const [filters, setFilters] = useState({
    category: 'all',
    tier: 'all',
    sortBy: 'popular',
    search: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'TREND', label: 'Trend' },
    { value: 'MOMENTUM', label: 'Momentum' },
    { value: 'VOLATILITY', label: 'Volatility' },
    { value: 'VOLUME', label: 'Volume' },
    { value: 'OSCILLATOR', label: 'Oscillator' },
    { value: 'OVERLAY', label: 'Overlay' },
    { value: 'CUSTOM', label: 'Custom' }
  ]

  const tiers = [
    { value: 'all', label: 'All Tiers' },
    { value: 'FREE', label: 'Free', color: 'text-green-400' },
            { value: 'PRO', label: 'Pro', color: 'text-yellow-400' },
    { value: 'VIP', label: 'VIP', color: 'text-purple-400' }
  ]

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'downloads', label: 'Most Downloaded' }
  ]

  useEffect(() => {
    fetchUserData()
    fetchIndicators()
  }, [filters])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUserInfo({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const fetchIndicators = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        ...filters
      })

      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/marketplace/indicators?${params}`, { headers })
      const data: MarketplaceResponse = await response.json()

      if (response.ok) {
        setIndicators(data.indicators)
        setPagination(data.pagination)
        setUserTier(data.userTier)
      }
    } catch (error) {
      console.error('Error fetching indicators:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (indicatorId: string) => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    try {
      const response = await fetch(`/api/marketplace/indicators/${indicatorId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIndicators(prev => prev.map(indicator => 
          indicator.id === indicatorId 
            ? { ...indicator, isFavorited: data.isFavorited, favoriteCount: data.favoriteCount }
            : indicator
        ))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const getTierBadge = (tier: string) => {
    const config = {
      FREE: { color: 'bg-green-500/10 text-green-400 border-green-500/30', label: 'Free' },
              PRO: { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', label: 'Pro' },
      VIP: { color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', label: 'VIP' }
    }
    const { color, label } = config[tier as keyof typeof config] || config.FREE
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
        {label}
      </span>
    )
  }

  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <div key={star}>
            {star <= rating ? (
              <StarIconSolid className={`${size} text-yellow-400`} />
            ) : (
              <StarIcon className={`${size} text-gray-600`} />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-white">FXCHUB</h1>
              <UserNavigation 
                userInfo={userInfo}
                onLogout={() => {
                  localStorage.removeItem('token')
                  router.push('/')
                }}
              />
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm text-gray-400">Your Plan</div>
                <div className={`font-medium ${
                  userTier === 'VIP' ? 'text-purple-400' :
                  userTier === 'PRO' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {userTier}
                </div>
              </div>
              {getTierBadge(userTier)}
            </div>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold">Indicator Marketplace</h1>
            <p className="text-gray-400 mt-2">
              Discover and access premium trading indicators for your analysis
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search indicators..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FunnelIcon className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subscription Tier</label>
                <select
                  value={filters.tier}
                  onChange={(e) => setFilters(prev => ({ ...prev, tier: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                >
                  {tiers.map(tier => (
                    <option key={tier.value} value={tier.value}>{tier.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="h-20 bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {indicators.map(indicator => (
                <div key={indicator.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
                  {/* Image/Video Preview */}
                  {indicator.screenshots.length > 0 && (
                    <div className="relative h-48 bg-gray-800">
                      <Image
                        src={indicator.screenshots[0]}
                        alt={indicator.displayName}
                        fill
                        className="object-cover"
                      />
                      {indicator.demoVideo && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button className="bg-black/50 rounded-full p-3 hover:bg-black/70 transition-colors">
                            <PlayIcon className="w-6 h-6 text-white" />
                          </button>
                        </div>
                      )}
                      
                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleFavorite(indicator.id)}
                        className="absolute top-3 right-3 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                      >
                        {indicator.isFavorited ? (
                          <HeartIconSolid className="w-5 h-5 text-red-400" />
                        ) : (
                          <HeartIcon className="w-5 h-5 text-white" />
                        )}
                      </button>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {indicator.displayName}
                        </h3>
                        <div className="flex items-center space-x-3">
                          {getTierBadge(indicator.subscriptionTier)}
                          <span className="text-gray-400 text-sm">{indicator.category}</span>
                        </div>
                      </div>
                      {indicator.price > 0 && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            ${indicator.price}
                          </div>
                          <div className="text-xs text-gray-400">{indicator.currency}</div>
                        </div>
                      )}
                    </div>

                    {/* Rating and Stats */}
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-1">
                        {renderStars(Math.floor(indicator.rating))}
                        <span className="text-sm text-gray-400 ml-1">
                          {indicator.rating.toFixed(1)} ({indicator.reviewCount})
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-400 text-sm">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        <span>{indicator.downloads.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {indicator.description}
                    </p>

                    {/* Tags */}
                    {indicator.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {indicator.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-800 text-gray-300"
                          >
                            <TagIcon className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {indicator.tags.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{indicator.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Features */}
                    {indicator.features.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Key Features:</h4>
                        <ul className="text-xs text-gray-400 space-y-1">
                          {indicator.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <ShieldCheckIcon className="w-3 h-3 mr-2 text-green-400 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recent Reviews */}
                    {indicator.recentReviews.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Review:</h4>
                        <div className="bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              {renderStars(indicator.recentReviews[0].rating, 'w-3 h-3')}
                              <span className="text-xs text-gray-400">
                                by {indicator.recentReviews[0].user.name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {indicator.recentReviews[0].user.plan}
                            </span>
                          </div>
                          {indicator.recentReviews[0].title && (
                            <p className="text-sm font-medium text-white mb-1">
                              {indicator.recentReviews[0].title}
                            </p>
                          )}
                          <p className="text-xs text-gray-300 line-clamp-2">
                            {indicator.recentReviews[0].comment}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      {indicator.canAccess ? (
                        <>
                          <button
                            onClick={() => router.push(`/marketplace/indicators/${indicator.id}`)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            View Details
                          </button>
                          {indicator.demoVideo && (
                            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                              <PlayIcon className="w-5 h-5" />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex-1">
                          <div className="text-center text-gray-400 text-sm mb-2">
                            Requires {indicator.subscriptionTier} subscription
                          </div>
                          <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            Upgrade Plan
                          </button>
                        </div>
                      )}
                      
                      <button
                        onClick={() => toggleFavorite(indicator.id)}
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {indicator.isFavorited ? (
                          <HeartIconSolid className="w-5 h-5 text-red-400" />
                        ) : (
                          <HeartIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total > 1 && (
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => fetchIndicators(pagination.current - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-400">
                  Page {pagination.current} of {pagination.total}
                </span>
                <button
                  onClick={() => fetchIndicators(pagination.current + 1)}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 