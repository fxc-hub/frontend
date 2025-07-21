'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface AdminRouteGuardProps {
  children: React.ReactNode
  fallbackRoute?: string
}

export default function AdminRouteGuard({ 
  children, 
  fallbackRoute = '/dashboard' 
}: AdminRouteGuardProps) {
  const router = useRouter()
  const { user, token } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    checkAdminAccess()
  }, [user, token])

  const checkAdminAccess = async () => {
    try {
      console.log('AdminRouteGuard: Checking admin access', { user, token: token ? 'exists' : 'missing' })
      
      // Check if user is logged in
      if (!token || !user) {
        console.log('AdminRouteGuard: No token or user, redirecting')
        redirectToFallback()
        return
      }

      // Check if user has admin role
      if (user.role !== 'admin') {
        console.log('AdminRouteGuard: User is not admin, redirecting. Role:', user.role)
        redirectToFallback()
        return
      }

      // User is admin, allow access
      console.log('AdminRouteGuard: User is admin, allowing access')
      setIsAuthorized(true)
    } catch (error) {
      console.error('AdminRouteGuard: Admin access check failed:', error)
      redirectToFallback()
    } finally {
      setIsLoading(false)
    }
  }

  const redirectToFallback = () => {
    setIsLoading(false)
    setIsAuthorized(false)
    router.replace(fallbackRoute)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <div className="text-white">Verifying admin access...</div>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⛔</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">You don't have permission to access the admin panel.</p>
          <button
            onClick={() => router.push(fallbackRoute)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 