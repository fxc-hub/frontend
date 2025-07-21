'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  HeartIcon,
  StarIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

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
  isFavorited: boolean
  isPurchased: boolean
  favoriteCount: number
  canAccess: boolean
  createdAt: string
}

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  isVerified: boolean
  isHelpful: number
  createdAt: string
  user: {
    name: string
    plan: string
  }
}

export default function IndicatorDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [indicator, setIndicator] = useState<Indicator | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' })
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    fetchIndicatorDetails()
    fetchReviews()
  }, [params.id])

  const fetchIndicatorDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`/api/marketplace/indicators?id=${params.id}`, { headers })
      const data = await response.json()
      
      if (response.ok && data.indicators.length > 0) {
        setIndicator(data.indicators[0])
      }
    } catch (error) {
      console.error('Error fetching indicator:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/marketplace/indicators/${params.id}/reviews`)
      const data = await response.json()
      if (response.ok) {
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const toggleFavorite = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    try {
      const response = await fetch(`/api/marketplace/indicators/${params.id}/favorite`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        setIndicator(prev => prev ? { ...prev, isFavorited: data.isFavorited, favoriteCount: data.favoriteCount } : null)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`/api/marketplace/indicators/${params.id}/reviews`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      })

      if (response.ok) {
        setNewReview({ rating: 5, title: '', comment: '' })
        setShowReviewForm(false)
        fetchReviews()
        fetchIndicatorDetails()
      }
    } catch (error) {
      console.error('Error submitting review:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!indicator) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Indicator Not Found</h1>
          <button onClick={() => router.push('/marketplace')} className="bg-blue-600 px-4 py-2 rounded-lg">
            Back to Marketplace
          </button>
        </div>
      </div>
    )
  }

  const getTierBadge = (tier: string) => {
    const config = {
      FREE: { color: 'bg-green-500/10 text-green-400 border-green-500/30', label: 'Free' },
      PRO: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', label: 'Pro' },
      VIP: { color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', label: 'VIP' }
    }
    const { color, label } = config[tier as keyof typeof config] || config.FREE
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${color}`}>{label}</span>
  }

  const renderStars = (rating: number, size = 'w-5 h-5') => {
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
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Media */}
            <div>
              {indicator.screenshots.length > 0 ? (
                <div className="relative h-80 bg-gray-800 rounded-xl overflow-hidden">
                  <Image src={indicator.screenshots[0]} alt={indicator.displayName} fill className="object-cover" />
                  {indicator.demoVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors">
                        <PlayIcon className="w-8 h-8 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-80 bg-gray-800 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="w-16 h-16 text-gray-600" />
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                {getTierBadge(indicator.subscriptionTier)}
                <span className="text-gray-400">{indicator.category}</span>
              </div>

              <h1 className="text-3xl font-bold mb-2">{indicator.displayName}</h1>
              <p className="text-gray-300 mb-6">{indicator.description}</p>

              {/* Rating & Stats */}
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center space-x-2">
                  {renderStars(Math.floor(indicator.rating))}
                  <span className="text-lg font-medium">{indicator.rating.toFixed(1)}</span>
                  <span className="text-gray-400">({indicator.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-400">
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span>{indicator.downloads.toLocaleString()} downloads</span>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="flex items-center space-x-4 mb-6">
                {indicator.price > 0 && (
                  <div className="text-2xl font-bold">${indicator.price}</div>
                )}
                
                {indicator.canAccess ? (
                  <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium">
                    Add to Chart
                  </button>
                ) : (
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium"
                  >
                    Upgrade to Access
                  </button>
                )}

                <button onClick={toggleFavorite} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg">
                  {indicator.isFavorited ? (
                    <HeartIconSolid className="w-6 h-6 text-red-400" />
                  ) : (
                    <HeartIcon className="w-6 h-6" />
                  )}
                </button>
              </div>

              {/* Tags */}
              {indicator.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {indicator.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-gray-800 text-gray-300">
                      <TagIcon className="w-4 h-4 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="border-b border-gray-800">
          <nav className="flex space-x-8">
            {['overview', 'reviews', 'changelog'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab 
                    ? 'border-blue-500 text-blue-400' 
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="py-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Features */}
              {indicator.features.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {indicator.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <ShieldCheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Version Info */}
              {indicator.latestVersion && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Latest Version</h3>
                  <div className="bg-gray-900 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Version {indicator.latestVersion.version}</span>
                      <span className="text-gray-400">{indicator.latestVersion.downloads} downloads</span>
                    </div>
                    <p className="text-gray-300">{indicator.latestVersion.changelog}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Reviews</h3>
                <button 
                  onClick={() => setShowReviewForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                >
                  Write Review
                </button>
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <form onSubmit={submitReview} className="bg-gray-900 rounded-lg p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                          className="p-1"
                        >
                          {star <= newReview.rating ? (
                            <StarIconSolid className="w-6 h-6 text-yellow-400" />
                          ) : (
                            <StarIcon className="w-6 h-6 text-gray-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Title (optional)</label>
                    <input
                      type="text"
                      value={newReview.title}
                      onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                      placeholder="Review title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Comment</label>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                      rows={4}
                      placeholder="Share your experience..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
                      Submit Review
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowReviewForm(false)}
                      className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-gray-900 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          {renderStars(review.rating, 'w-4 h-4')}
                          {review.isVerified && (
                            <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">Verified</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          by {review.user.name} • {review.user.plan} • {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    {review.title && (
                      <h4 className="font-medium mb-2">{review.title}</h4>
                    )}
                    
                    <p className="text-gray-300">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Changelog Tab */}
          {activeTab === 'changelog' && indicator.latestVersion && (
            <div>
              <h3 className="text-xl font-bold mb-4">Version History</h3>
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="font-medium mb-2">Version {indicator.latestVersion.version}</div>
                <p className="text-gray-300">{indicator.latestVersion.changelog}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 