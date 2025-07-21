'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PlanSelectionAndPayment from '@/components/PlanSelectionAndPayment'

export default function SubscribePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login?redirect=/subscribe')
      return
    }
    
    setIsAuthenticated(true)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <PlanSelectionAndPayment />
} 