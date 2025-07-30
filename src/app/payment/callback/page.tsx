'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { api } from '@/lib/api'

function PaymentCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading')
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    verifyPayment()
  }, [])

  const verifyPayment = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      // Get payment reference from URL params
      const reference = searchParams.get('reference') || 
                       searchParams.get('transaction_id') || 
                       searchParams.get('payment_reference')

      if (!reference) {
        setStatus('failed')
        setMessage('Payment reference not found')
        return
      }

      // Verify payment with backend
      const response = await api('/api/payment/verify', 'POST', {
        reference: reference
      }, token)

      if (response.success) {
        setStatus('success')
        setMessage('Payment successful! Your subscription has been activated.')
        setDetails(response.data)
      } else {
        setStatus('failed')
        setMessage(response.message || 'Payment verification failed')
      }
    } catch (error: any) {
      setStatus('failed')
      setMessage(error.message || 'Payment verification failed')
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-16 h-16 text-green-400" />
      case 'failed':
        return <XCircleIcon className="w-16 h-16 text-red-400" />
      case 'pending':
        return <ClockIcon className="w-16 h-16 text-yellow-400" />
      default:
        return <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-400'
      case 'failed':
        return 'text-red-400'
      case 'pending':
        return 'text-yellow-400'
      default:
        return 'text-blue-400'
    }
  }

  const getStatusBg = () => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 border-green-500/50'
      case 'failed':
        return 'bg-red-500/10 border-red-500/50'
      case 'pending':
        return 'bg-yellow-500/10 border-yellow-500/50'
      default:
        return 'bg-blue-500/10 border-blue-500/50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full">
        <div className={`${getStatusBg()} border rounded-xl p-8 text-center`}>
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>
          
          <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
            {status === 'loading' && 'Verifying Payment...'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
            {status === 'pending' && 'Payment Pending'}
          </h1>
          
          <p className="text-gray-300 mb-6">
            {message}
          </p>

          {details && status === 'success' && (
            <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-white font-medium mb-3">Payment Details:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white">
                    {details.currency} {details.amount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reference:</span>
                  <span className="text-white font-mono text-xs">
                    {details.payment_reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan:</span>
                  <span className="text-white">{details.plan?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {status === 'success' && (
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            )}
            
            {status === 'failed' && (
              <button
                onClick={() => router.push('/subscribe')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            )}
            
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full">
          <div className="bg-blue-500/10 border border-blue-500/50 rounded-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-blue-400">Loading...</h1>
            <p className="text-gray-300">Verifying payment...</p>
          </div>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
} 