"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowRightOnRectangleIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import UserNavigation from '@/components/UserNavigation'
import SiteLogo from '@/components/SiteLogo'

const videos = [
  {
    id: 'xw6uX9FzPp8',
    title: 'Forex Trading for Beginners (Full Course)'
  },
  {
    id: 'd8q9k6lU8pA',
    title: 'How to Read Forex Charts Right Way'
  },
  {
    id: 'p7HKvqRI_Bo',
    title: 'Price Action Trading Strategies'
  },
  {
    id: 'bJ8b8gkQb2g',
    title: 'Risk Management in Forex Trading'
  },
  {
    id: 'G9p7n6Qp1pA',
    title: 'Technical Analysis Basics'
  },
  {
    id: 'Qw4w9WgXcQw',
    title: 'Understanding Forex Indicators'
  }
]

export default function EducationHubPage() {
  const [featured, setFeatured] = useState(videos[0])
  const [userInfo, setUserInfo] = useState<{
    firstName?: string
    lastName?: string
    email?: string
  } | undefined>(undefined)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [])

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

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <SiteLogo className="h-8 w-auto" fallbackText="FXCHUB" />
              <UserNavigation 
                userInfo={userInfo}
                onLogout={() => {
                  localStorage.removeItem('token')
                  router.push('/')
                }}
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <UserIcon className="w-5 h-5" />
                <span className="text-sm">
                  {userInfo?.firstName ? `${userInfo.firstName} ${userInfo.lastName}` : 'User'}
                </span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('token')
                  router.push('/')
                }}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center p-4">
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-r from-yellow-600 to-purple-600 rounded-full w-24 h-24 flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-white">FX</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Education Hub</h1>
            <p className="text-lg text-gray-300 mb-4 text-center max-w-2xl">
              Watch curated Forex trading tutorials and educational videos. Click any video below to start learning today!
            </p>
          </div>

          {/* Featured Video */}
          <div className="w-full aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg mb-8 flex items-center justify-center">
            <iframe
              key={featured.id}
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${featured.id}`}
              title={featured.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              style={{ minHeight: 320 }}
            />
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {videos.map((video) => (
              <button
                key={video.id}
                onClick={() => setFeatured(video)}
                className={`group bg-gray-900 rounded-xl overflow-hidden shadow-lg border-2 transition-all duration-200 ${featured.id === video.id ? 'border-yellow-500' : 'border-transparent'} hover:border-yellow-400`}
                aria-label={`Play ${video.title}`}
              >
                <div className="relative aspect-video w-full">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${video.id}?controls=0&showinfo=0&rel=0`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    style={{ minHeight: 120 }}
                  />
                  {featured.id !== video.id && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-lg font-semibold">Play</span>
                    </div>
                  )}
                </div>
                <div className="p-3 text-left">
                  <div className="text-white font-semibold text-base truncate" title={video.title}>{video.title}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/dashboard" className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
} 