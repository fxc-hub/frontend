import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export interface PaymentGateway {
  id: string
  gateway: string
  name: string
  display_name: string
  description: string
  is_active: boolean
  is_primary: boolean
  supported_currencies: string[]
  min_amount: number
  max_amount: number
  processing_fee: number
  icon?: string
}

export interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: string
}

export const usePaymentGateways = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const paymentMethods: Record<string, PaymentMethod[]> = {
    'FLUTTERWAVE': [
      { id: 'card', name: 'Credit/Debit Card', description: 'Visa, Mastercard, Verve', icon: '💳' },
      { id: 'bank_transfer', name: 'Bank Transfer', description: 'Direct bank transfer', icon: '🏦' },
      { id: 'mobile_money', name: 'Mobile Money', description: 'M-Pesa, MTN, Airtel', icon: '📱' },
      { id: 'ussd', name: 'USSD', description: 'USSD payment', icon: '📞' }
    ],
    'STRIPE': [
      { id: 'card', name: 'Credit/Debit Card', description: 'Visa, Mastercard, Amex', icon: '💳' },
      { id: 'bank_transfer', name: 'ACH Bank Transfer', description: 'Direct bank transfer', icon: '🏦' },
      { id: 'sepa_debit', name: 'SEPA Direct Debit', description: 'European bank transfer', icon: '🇪🇺' }
    ],
    'BINANCE': [
      { id: 'crypto', name: 'Cryptocurrency', description: 'USDT, Bitcoin, Ethereum, BNB', icon: '🟡' }
    ]
  }

  const fetchGateways = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await api('/api/payment-gateways')
      const activeGateways = response.filter((gateway: PaymentGateway) => gateway.is_active)
      setGateways(activeGateways)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment gateways')
    } finally {
      setIsLoading(false)
    }
  }

  const getGatewayIcon = (gateway: string) => {
    switch (gateway) {
      case 'FLUTTERWAVE': return '🦋'
      case 'STRIPE': return '💳'
      case 'BINANCE': return '🟡'
      default: return '💳'
    }
  }

  const isGatewayCompatible = (gateway: PaymentGateway, amount: number, currency: string) => {
    return gateway.supported_currencies.includes(currency) &&
           amount >= gateway.min_amount &&
           amount <= gateway.max_amount
  }

  const getCompatibleGateways = (amount: number, currency: string) => {
    return gateways.filter(gateway => isGatewayCompatible(gateway, amount, currency))
  }

  const calculateProcessingFee = (amount: number, feePercentage: number) => {
    return (amount * feePercentage) / 100
  }

  const getPaymentMethods = (gatewayType: string) => {
    return paymentMethods[gatewayType] || []
  }

  useEffect(() => {
    fetchGateways()
  }, [])

  return {
    gateways,
    isLoading,
    error,
    paymentMethods,
    getGatewayIcon,
    isGatewayCompatible,
    getCompatibleGateways,
    calculateProcessingFee,
    getPaymentMethods,
    refetch: fetchGateways
  }
} 