'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCardIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'

interface PaymentGateway {
  id: string
  gateway: string
  name: string
  displayName: string
  display_name?: string // Backend format
  description?: string
  isActive: boolean
  is_active?: boolean // Backend format
  isPrimary: boolean
  is_primary?: boolean // Backend format
  supportedCurrencies: string[]
  supported_currencies?: string[] // Backend format
  minAmount: number
  min_amount?: string | number // Backend format (can be string from DB)
  maxAmount: number
  max_amount?: string | number // Backend format (can be string from DB)
  processingFee: number
  processing_fee?: string | number // Backend format (can be string from DB)
  transactionCount: number
  transaction_count?: string | number // Backend format (can be string from DB)
  totalVolume: number
  total_volume?: string | number // Backend format (can be string from DB)
  successRate: number
  success_rate?: string | number // Backend format (can be string from DB)
  lastUsed?: string
  last_used_at?: string // Backend format
  createdAt: string
  created_at?: string // Backend format
  updatedAt: string
  updated_at?: string // Backend format
}

interface PaymentGatewayManagerProps {
  onSuccess?: () => void
}

export default function PaymentGatewayManager({ onSuccess }: PaymentGatewayManagerProps) {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchGateways()
  }, [])

  const fetchGateways = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const data = await api('/api/admin/payment-gateways', 'GET', undefined, token)
      const normalized = data.map((g: any) => ({
        id: g.id,
        gateway: g.gateway,
        name: g.name,
        displayName: g.display_name || g.displayName || '', // Handle both formats
        description: g.description,
        isActive: g.is_active || g.isActive || false,
        isPrimary: g.is_primary || g.isPrimary || false,
        supportedCurrencies: Array.isArray(g.supported_currencies)
          ? g.supported_currencies
          : (() => {
              try {
                return JSON.parse(g.supported_currencies || '[]')
              } catch {
                return []
              }
            })(),
        minAmount: parseFloat(g.min_amount || g.minAmount || 0),
        maxAmount: parseFloat(g.max_amount || g.maxAmount || 0),
        processingFee: parseFloat(g.processing_fee || g.processingFee || 0),
        transactionCount: parseInt(g.transaction_count || g.transactionCount || 0),
        totalVolume: parseFloat(g.total_volume || g.totalVolume || 0),
        successRate: parseFloat(g.success_rate || g.successRate || 0),
        lastUsed: g.last_used_at || g.lastUsed,
        createdAt: g.created_at || g.createdAt,
        updatedAt: g.updated_at || g.updatedAt
      }))
      setGateways(normalized)
    } catch (err) {
      setError('Error fetching payment gateways')
    } finally {
      setIsLoading(false)
    }
  }

  const testGateway = async (gatewayId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const result = await api('/api/admin/payment-gateways/test', 'POST', {
        gatewayId,
        testAmount: 1,
        testCurrency: 'USD'
      }, token)
      
      if (result.success) {
        alert('✅ Gateway test successful!\n' + result.message)
        fetchGateways() // Refresh to update stats
      } else {
        alert('❌ Gateway test failed:\n' + result.message)
      }
    } catch (error) {
      alert('Error testing gateway: ' + (error as Error).message)
    }
  }

  const deleteGateway = async (gatewayId: string) => {
    if (!confirm('Are you sure you want to delete this payment gateway?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await api(`/api/admin/payment-gateways/${gatewayId}`, 'DELETE', undefined, token)
      setGateways(gateways.filter(g => g.id !== gatewayId))
      if (onSuccess) onSuccess()
    } catch (error) {
      alert('Error deleting gateway: ' + (error as Error).message)
    }
  }

  const toggleGatewayStatus = async (gatewayId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await api(`/api/admin/payment-gateways/${gatewayId}`, 'PUT', {
        isActive: !currentStatus
      }, token)
      
      setGateways(gateways.map(g => 
        g.id === gatewayId ? { ...g, isActive: !currentStatus } : g
      ))
    } catch (error) {
      setError('Error updating gateway status')
    }
  }

  const getGatewayIcon = (gateway: string) => {
    switch (gateway) {
      case 'FLUTTERWAVE':
        return '🦋'
      case 'CRYPTO_COINBASE':
        return '₿'
      case 'STRIPE':
        return '💳'
      default:
        return '💳'
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-500/10 text-green-400' 
      : 'bg-red-500/10 text-red-400'
  }

  // Helper function to safely convert values to numbers
  const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined) return defaultValue
    const num = parseFloat(value)
    return isNaN(num) ? defaultValue : num
  }

  // Filter out Stripe and Flutterwave from displayed gateways
  const filteredGateways = isLoading || !Array.isArray(gateways) ? [] : gateways.filter(gateway => {
    const displayName = gateway.displayName || gateway.display_name || '';
    const gatewayType = gateway.gateway || '';
    const searchLower = searchTerm.toLowerCase();
    // Hide Stripe and Flutterwave from UI
    if (gatewayType === 'STRIPE' || gatewayType === 'FLUTTERWAVE') return false;
    return displayName.toLowerCase().includes(searchLower) ||
           gatewayType.toLowerCase().includes(searchLower);
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading payment gateways...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Payment Gateway Settings</h2>
          <p className="text-gray-400">Configure and manage payment providers</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Gateway</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search payment gateways..."
          className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute left-3 top-2.5">
          <CreditCardIcon className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Gateway Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGateways.map((gateway) => (
          <div key={gateway.id} className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getGatewayIcon(gateway.gateway || '')}</div>
                <div>
                  <h3 className="font-semibold text-white">{gateway.displayName || 'Unnamed Gateway'}</h3>
                  <p className="text-sm text-gray-400">{gateway.gateway || 'Unknown'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {gateway.isPrimary && (
                  <span className="bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full text-xs">
                    Primary
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(gateway.isActive)}`}>
                  {gateway.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {gateway.description && (
              <p className="text-gray-300 text-sm mb-4">{gateway.description}</p>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-lg font-semibold text-white">
                  {safeNumber(gateway.transactionCount).toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Transactions</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-lg font-semibold text-white">
                  {safeNumber(gateway.successRate).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">Success Rate</div>
              </div>
            </div>

            {/* Configuration Info */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Fee:</span>
                <span className="text-white">{safeNumber(gateway.processingFee)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Range:</span>
                <span className="text-white">
                  ${safeNumber(gateway.minAmount)} - ${safeNumber(gateway.maxAmount).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Currencies:</span>
                <span className="text-white">
                  {(gateway.supportedCurrencies || []).slice(0, 3).join(', ')}
                  {(gateway.supportedCurrencies || []).length > 3 && '...'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => testGateway(gateway.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center space-x-1"
              >
                <ShieldCheckIcon className="w-4 h-4" />
                <span>Test</span>
              </button>
              <button
                onClick={() => setEditingGateway(gateway)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleGatewayStatus(gateway.id, gateway.isActive)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  gateway.isActive 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {gateway.isActive ? (
                  <XCircleIcon className="w-4 h-4" />
                ) : (
                  <CheckCircleIcon className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => deleteGateway(gateway.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredGateways.length === 0 && (
        <div className="text-center py-12">
          <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No payment gateways found</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Add Your First Gateway
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingGateway) && (
        <CreatePaymentGatewayModal
          gateway={editingGateway}
          onClose={() => {
            setShowCreateModal(false)
            setEditingGateway(null)
          }}
          onSuccess={() => {
            fetchGateways()
            setShowCreateModal(false)
            setEditingGateway(null)
            if (onSuccess) onSuccess()
          }}
        />
      )}
    </div>
  )
}

// Create/Edit Payment Gateway Modal
interface CreatePaymentGatewayModalProps {
  gateway?: PaymentGateway | null
  onClose: () => void
  onSuccess: () => void
}

function CreatePaymentGatewayModal({ gateway, onClose, onSuccess }: CreatePaymentGatewayModalProps) {
  const [formData, setFormData] = useState({
    gateway: gateway?.gateway || 'STRIPE',
    name: gateway?.name || '',
    displayName: gateway?.displayName || '',
    description: gateway?.description || '',
    isActive: gateway?.isActive ?? true,
    isPrimary: gateway?.isPrimary ?? false,
    config: '{}',
    supportedCurrencies: gateway?.supportedCurrencies || ['USD', 'EUR', 'GBP'],
    minAmount: gateway ? String(gateway.minAmount) : '1',
    maxAmount: gateway ? String(gateway.maxAmount) : '10000',
    processingFee: gateway ? String(gateway.processingFee) : '0'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Comment out Stripe and Flutterwave from gatewayTypes
  const gatewayTypes = [
    // { value: 'FLUTTERWAVE', label: 'Flutterwave', icon: '🦋' },
    { value: 'BINANCE', label: 'Binance', icon: '🟡' },
    // { value: 'STRIPE', label: 'Stripe', icon: '💳' }
  ]

  // Comment out config templates for Stripe and Flutterwave
  const getConfigTemplate = (gatewayType: string) => {
    switch (gatewayType) {
      // case 'FLUTTERWAVE':
      //   return { secretKey: '', publicKey: '', encryptionKey: '' }
      case 'BINANCE':
        return { apiKey: '', apiSecret: '', webhookSecret: '' }
      // case 'STRIPE':
      //   return { secretKey: '', publishableKey: '', webhookSecret: '' }
      default:
        return {}
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication required')
        return
      }

      const method = gateway ? 'PUT' : 'POST'
      const url = gateway 
        ? `/api/admin/payment-gateways/${gateway.id}`
        : '/api/admin/payment-gateways'

      await api(url, method, {
        ...formData,
        minAmount: formData.minAmount === '' ? null : parseFloat(formData.minAmount),
        maxAmount: formData.maxAmount === '' ? null : parseFloat(formData.maxAmount),
        processingFee: formData.processingFee === '' ? null : parseFloat(formData.processingFee),
        config: formData.config,
        supportedCurrencies: formData.supportedCurrencies
      }, token)

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGatewayChange = (newGateway: string) => {
    setFormData({
      ...formData,
      gateway: newGateway,
      config: JSON.stringify(getConfigTemplate(newGateway), null, 2)
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {gateway ? 'Edit' : 'Add'} Payment Gateway
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gateway Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gateway Type *
                </label>
                <select
                  value={formData.gateway}
                  onChange={(e) => handleGatewayChange(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  required
                >
                  {gatewayTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Internal Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  placeholder="e.g., main_stripe"
                  required
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  placeholder="e.g., Main Stripe Gateway"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  placeholder="Optional description"
                />
              </div>

              {/* Min Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Min Amount (USD)
                </label>
                <input
                  type="number"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({...formData, minAmount: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Max Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Amount (USD)
                </label>
                <input
                  type="number"
                  value={formData.maxAmount}
                  onChange={(e) => setFormData({...formData, maxAmount: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Processing Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Processing Fee (%)
                </label>
                <input
                  type="number"
                  value={formData.processingFee}
                  onChange={(e) => setFormData({...formData, processingFee: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-gray-300">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData({...formData, isPrimary: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-gray-300">Primary Gateway</span>
                </label>
              </div>
            </div>

            {/* Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Configuration (JSON) *
              </label>
              <textarea
                value={formData.config}
                onChange={(e) => setFormData({...formData, config: e.target.value})}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 h-32 font-mono text-sm"
                placeholder="Enter gateway configuration as JSON"
                required
              />
            </div>

            {/* Supported Currencies */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Supported Currencies (comma-separated)
              </label>
              <input
                type="text"
                value={formData.supportedCurrencies.join(', ')}
                onChange={(e) => setFormData({
                  ...formData, 
                  supportedCurrencies: e.target.value.split(',').map(c => c.trim())
                })}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                placeholder="USD, EUR, GBP"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : (gateway ? 'Update' : 'Create')} Gateway
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 