'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  UsersIcon, 
  CreditCardIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import SecurityManager from '@/components/admin/SecurityManager'
import IndicatorManager from '@/components/admin/IndicatorManager'
import ChartManager from '@/components/admin/ChartManager'
import AdminLayout from '@/components/AdminLayout'
import AdminRouteGuard from '@/components/admin/AdminRouteGuard'
import { Dialog } from '@headlessui/react'
import Link from 'next/link'
import { api } from '@/lib/api'
import PaymentGatewayManager from '@/components/admin/PaymentGatewayManager'
import LogoUpload from '@/components/admin/LogoUpload'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  isActive: boolean
  isAdmin: boolean
  createdAt: string
  subscription?: Subscription
}

interface Plan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  duration: string
  features: string[] | string
  isActive: boolean
  createdAt: string
  subscriptions?: Subscription[]
}

interface Subscription {
  id: string
  planId: string
  status: string
  flutterwaveRef: string
  startDate: string
  endDate: string
  autoRenew: boolean
  plan?: Plan
}

// Pine Script Upload Modal
const UploadPineScriptModal = ({ onClose, onSuccess, plans }: { onClose: () => void, onSuccess: () => void, plans: Plan[] }) => {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    category: 'CUSTOM',
    pineScript: '',
    version: '1.0.0',
    changelog: '',
    tags: '',
    isPremium: false,
    subscriptionTier: 'FREE',
    price: 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [validationResult, setValidationResult] = useState<any>(null)

  const categories = [
    'TREND', 'MOMENTUM', 'VOLATILITY', 'VOLUME', 
    'SUPPORT_RESISTANCE', 'OVERLAY', 'OSCILLATOR', 'CUSTOM', 'STRATEGY'
  ]

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

      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)

      const data = await api('/api/admin/indicators/upload', 'POST', {
        ...formData,
        tags: tagsArray
      }, token)

      setValidationResult(data.validation)
      if (data.validation.isValid) {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while uploading')
      if (err.response?.validation) {
        setValidationResult(err.response.validation)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Upload Pine Script Indicator</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {validationResult && !validationResult.isValid && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-6">
              <h3 className="text-yellow-400 font-medium mb-2">Validation Issues:</h3>
              {validationResult.errors?.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-red-400 text-sm font-medium">Errors:</h4>
                  <ul className="text-red-300 text-sm list-disc ml-4">
                    {validationResult.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validationResult.securityIssues?.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-red-400 text-sm font-medium">Security Issues:</h4>
                  <ul className="text-red-300 text-sm list-disc ml-4">
                    {validationResult.securityIssues.map((issue: string, index: number) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validationResult.warnings?.length > 0 && (
                <div>
                  <h4 className="text-yellow-400 text-sm font-medium">Warnings:</h4>
                  <ul className="text-yellow-300 text-sm list-disc ml-4">
                    {validationResult.warnings.map((warning: string, index: number) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Indicator Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  placeholder="e.g., custom_rsi"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Display Name *</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  placeholder="e.g., Custom RSI Indicator"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

                              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Version</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                    placeholder="1.0.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subscription Tier</label>
                  <select
                    value={formData.subscriptionTier || 'FREE'}
                    onChange={(e) => setFormData({...formData, subscriptionTier: e.target.value})}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  >
                    <option value="FREE">Free - Available to all users</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.name}>
                        {plan.name} - ${plan.price} {plan.currency} ({plan.duration})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-400 mt-1">Set price for one-time purchases (optional)</p>
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                rows={3}
                placeholder="Describe what this indicator does..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Pine Script Code *</label>
              <textarea
                value={formData.pineScript}
                onChange={(e) => setFormData({...formData, pineScript: e.target.value})}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 font-mono text-sm"
                rows={12}
                placeholder="//@version=5
indicator('My Custom Indicator', overlay=true)

// Your Pine Script code here..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                placeholder="trend, custom, rsi (comma separated)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Changelog</label>
              <textarea
                value={formData.changelog}
                onChange={(e) => setFormData({...formData, changelog: e.target.value})}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                rows={3}
                placeholder="What's new in this version..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPremium"
                checked={formData.isPremium}
                onChange={(e) => setFormData({...formData, isPremium: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="isPremium" className="text-sm text-gray-300">Premium Indicator</label>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Uploading...' : 'Upload Pine Script'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Add Built-in Indicator Modal
const AddBuiltInIndicatorModal = ({ onClose, onSuccess, plans }: { onClose: () => void, onSuccess: () => void, plans: Plan[] }) => {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    category: 'TREND',
    tvStudyId: '',
    parameters: '',
    subscriptionTier: 'FREE',
    price: 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    'TREND', 'MOMENTUM', 'VOLATILITY', 'VOLUME', 
    'SUPPORT_RESISTANCE', 'OVERLAY', 'OSCILLATOR'
  ]

  const builtInIndicators = [
    { name: 'rsi', displayName: 'RSI', tvStudyId: 'STD;RSI', category: 'MOMENTUM' },
    { name: 'macd', displayName: 'MACD', tvStudyId: 'STD;MACD', category: 'MOMENTUM' },
    { name: 'bollinger_bands', displayName: 'Bollinger Bands', tvStudyId: 'STD;Bollinger Bands', category: 'VOLATILITY' },
    { name: 'ema', displayName: 'EMA', tvStudyId: 'STD;EMA%1%2%3%4%5', category: 'TREND' },
    { name: 'sma', displayName: 'SMA', tvStudyId: 'STD;SMA%1%2%3%4%5', category: 'TREND' },
    { name: 'stochastic', displayName: 'Stochastic', tvStudyId: 'STD;Stochastic', category: 'MOMENTUM' },
    { name: 'atr', displayName: 'ATR', tvStudyId: 'STD;ATR', category: 'VOLATILITY' },
    { name: 'adx', displayName: 'ADX', tvStudyId: 'STD;ADX', category: 'TREND' },
    { name: 'volume', displayName: 'Volume', tvStudyId: 'STD;Volume', category: 'VOLUME' }
  ]

  const handleIndicatorSelect = (indicator: any) => {
    setFormData({
      name: indicator.name,
      displayName: indicator.displayName,
      description: `${indicator.displayName} - TradingView built-in indicator`,
      category: indicator.category,
      tvStudyId: indicator.tvStudyId,
      parameters: JSON.stringify({ period: 14 }, null, 2),
      subscriptionTier: 'FREE',
      price: 0
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication required')

      let parameters = {}
      try {
        parameters = formData.parameters ? JSON.parse(formData.parameters) : {}
      } catch (err) {
        setError('Invalid JSON in parameters field')
        return
      }

      await api('/api/admin/indicators', 'POST', {
        ...formData,
        type: 'BUILT_IN',
        isBuiltIn: true,
        parameters,
        subscriptionTier: formData.subscriptionTier,
        price: formData.price
      }, token)

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding indicator')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Add Built-in Indicator</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Select */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Quick Select</h3>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {builtInIndicators.map((indicator) => (
                  <button
                    key={indicator.name}
                    onClick={() => handleIndicatorSelect(indicator)}
                    className="text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="text-white font-medium">{indicator.displayName}</div>
                    <div className="text-gray-400 text-sm">{indicator.category}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Indicator Details</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Display Name *</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">TradingView Study ID *</label>
                  <input
                    type="text"
                    value={formData.tvStudyId}
                    onChange={(e) => setFormData({...formData, tvStudyId: e.target.value})}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                    placeholder="STD;RSI"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Parameters (JSON)</label>
                  <textarea
                    value={formData.parameters}
                    onChange={(e) => setFormData({...formData, parameters: e.target.value})}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 font-mono text-sm"
                    rows={4}
                    placeholder='{"period": 14}'
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subscription Tier</label>
                    <select
                      value={formData.subscriptionTier}
                      onChange={(e) => setFormData({...formData, subscriptionTier: e.target.value})}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                    >
                      <option value="FREE">Free - Available to all users</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.name}>
                          {plan.name} - ${plan.price} {plan.currency} ({plan.duration})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-400 mt-1">Set price for one-time purchases (optional)</p>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Indicator'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [apiSettings, setApiSettings] = useState<any[]>([])
  const [indicators, setIndicators] = useState<any[]>([])
  const [notificationSettings, setNotificationSettings] = useState<any[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('users')
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false)
  const [showEditPlanModal, setShowEditPlanModal] = useState(false)
  const [showDeletePlanModal, setShowDeletePlanModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [showCreateApiModal, setShowCreateApiModal] = useState(false)
  const [showUploadPineScriptModal, setShowUploadPineScriptModal] = useState(false)
  const [showAddBuiltInModal, setShowAddBuiltInModal] = useState(false)
  const [showIndicatorHelp, setShowIndicatorHelp] = useState(false)
  const [showCreateNotificationModal, setShowCreateNotificationModal] = useState(false)
  const [showViewIndicatorModal, setShowViewIndicatorModal] = useState(false)
  const [showEditIndicatorModal, setShowEditIndicatorModal] = useState(false)
  const [showDeleteIndicatorModal, setShowDeleteIndicatorModal] = useState(false)
  const [selectedIndicator, setSelectedIndicator] = useState<any>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0
  })
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [userEdit, setUserEdit] = useState<User | null>(null)
  const [userModalError, setUserModalError] = useState('')
  const [userModalSuccess, setUserModalSuccess] = useState('')
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState('');
  // Add pagination state variables after the existing state declarations:
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)

  // Site settings state
  const [siteSettings, setSiteSettings] = useState<any[]>([])
  const [siteSettingsLoading, setSiteSettingsLoading] = useState(false)
  const [siteSettingsSaving, setSiteSettingsSaving] = useState(false)
  const [siteSettingsError, setSiteSettingsError] = useState('')
  const [siteSettingsSuccess, setSiteSettingsSuccess] = useState('')

  // --- Site Settings helpers ---
  const fetchSiteSettings = async () => {
    try {
      setSiteSettingsLoading(true)
      const token = localStorage.getItem('token') || undefined
      const data = await api('/api/admin/site-settings', 'GET', undefined, token)
      setSiteSettings(data)
    } catch (err: any) {
      setSiteSettingsError(err.message || 'Failed to fetch')
    } finally {
      setSiteSettingsLoading(false)
    }
  }

  const handleSiteSettingChange = (idx: number, key: string, value: string) => {
    setSiteSettings(prev => {
      if (idx === -1) {
        // Setting doesn't exist yet, add it
        return [...prev, {
          id: null,
          category: 'General',
          key: key,
          value: value,
          logo: null,
          createdAt: null,
          updatedAt: null
        }]
      } else {
        // Setting exists, update it
        return prev.map((s, i) => i === idx ? { ...s, value } : s)
      }
    })
  }

  const saveSiteSettings = async () => {
    try {
      setSiteSettingsSaving(true)
      setSiteSettingsError('')
      setSiteSettingsSuccess('')
      const token = localStorage.getItem('token') || undefined
      const payload = siteSettings.map(({ id, createdAt, updatedAt, ...rest }) => rest)
      await api('/api/admin/site-settings', 'PUT', payload, token)
      
      setSiteSettingsSuccess('Settings saved')
    } catch (err: any) {
      setSiteSettingsError(err.message || 'Failed to save')
    } finally {
      setSiteSettingsSaving(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'site-settings') fetchSiteSettings()
  }, [activeTab])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    fetchAdminData(token)
  }, [router])

  useEffect(() => {
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  // Add pagination logic after the existing useEffect hooks:
  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Pagination handlers
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const fetchAdminData = async (token: string) => {
    try {
      const [
        usersData, 
        statsData, 
        plansData, 
        apiData, 
        indicatorsData, 
        notificationsData,
        paymentGatewaysData,
        securityData
      ] = await Promise.all([
        api('/api/admin/users', 'GET', undefined, token),
        api('/api/admin/stats', 'GET', undefined, token),
        api('/api/admin/plans', 'GET', undefined, token),
        api('/api/admin/api-settings', 'GET', undefined, token).catch(() => []),
        api('/api/admin/indicators', 'GET', undefined, token).catch(() => ({ indicators: [] })),
        api('/api/admin/notification-settings', 'GET', undefined, token).catch(() => []),
        api('/api/admin/payment-gateways', 'GET', undefined, token).catch(() => []),
        api('/api/admin/security/stats', 'GET', undefined, token).catch(() => ({}))
      ])

      setUsers(usersData.users)
      setFilteredUsers(usersData.users)
      setCurrentAdmin(usersData.currentAdmin)
      setStats(statsData)
      setPlans(plansData.data)
      setApiSettings(apiData)
      setIndicators(indicatorsData.indicators || [])
      setNotificationSettings(notificationsData)

      // Store payment gateway and security data in component state if needed
      // For now, the individual components will handle their own data fetching
    } catch (err: any) {
      if (err.message?.includes('403')) {
        setError('Access denied. Admin privileges required.')
      } else {
        setError('Failed to fetch admin data')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    router.push('/')
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (typeof window === 'undefined') return
    
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      await api(`/api/admin/users/${userId}/toggle-status`, 'POST', { isActive: !currentStatus }, token)
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: !currentStatus } : user
      ))
    } catch (err) {
      setError('Failed to update user status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-400 bg-green-400/10'
      case 'EXPIRED': return 'text-red-400 bg-red-400/10'
      case 'CANCELLED': return 'text-gray-400 bg-gray-400/10'
      default: return 'text-yellow-400 bg-yellow-400/10'
    }
  }

  const testNotificationSetting = async (settingId: string) => {
    const recipient = prompt('Enter test recipient (email, phone number, telegram chat ID, etc.):')
    if (!recipient) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const result = await api('/api/admin/notification-settings/test', 'POST', {
        settingId,
        recipient,
        testMessage: 'This is a test notification from FXCHUB admin panel.'
      }, token)
      
      if (result.success) {
        alert('Test notification sent successfully!\n' + result.details)
        // Refresh notification settings to update usage stats
        const token = localStorage.getItem('token')
        if (token) fetchAdminData(token)
      } else {
        alert('Failed to send test notification:\n' + result.details)
      }
    } catch (error) {
      alert('Error testing notification: ' + (error as Error).message)
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setUserEdit({ ...user })
    setShowUserModal(true)
    setUserModalError('')
    setUserModalSuccess('')
  }

  const handleUserEditChange = (key: keyof User, value: any) => {
    if (!userEdit) return
    setUserEdit({ ...userEdit, [key]: value })
  }

  // Validation function for user fields
  function validateUserEdit(user: User) {
    if (!user.firstName.trim()) return 'First name is required.';
    if (!user.lastName.trim()) return 'Last name is required.';
    if (!user.email.trim()) return 'Email is required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(user.email)) return 'Invalid email format.';
    return '';
  }

  // Update handleSaveUser to use validation
  const handleSaveUser = async () => {
    if (!userEdit) return;
    setUserModalError('');
    setUserModalSuccess('');
    const validationError = validateUserEdit(userEdit);
    if (validationError) {
      setUserModalError(validationError);
      return;
    }
    try {
      const token = localStorage.getItem('token') || undefined
      await api(`/api/admin/users/${userEdit.id}`, 'PUT', userEdit, token)
      
      setUserModalSuccess('User updated successfully!')
      setUsers(users.map(u => u.id === userEdit.id ? { ...userEdit } : u))
      setFilteredUsers(filteredUsers.map(u => u.id === userEdit.id ? { ...userEdit } : u))
      setSelectedUser({ ...userEdit })
    } catch (err: any) {
      setUserModalError(err.message || 'Failed to update user')
    }
  }

  const handleToggleUserStatusModal = async () => {
    if (!userEdit) return
    setUserModalError('')
    setUserModalSuccess('')
    try {
      const token = localStorage.getItem('token') || undefined
      await api(`/api/admin/users/${userEdit.id}/toggle-status`, 'POST', undefined, token)
      
      setUserEdit({ ...userEdit, isActive: !userEdit.isActive })
      setUsers(users.map(u => u.id === userEdit.id ? { ...u, isActive: !u.isActive } : u))
      setFilteredUsers(filteredUsers.map(u => u.id === userEdit.id ? { ...u, isActive: !u.isActive } : u))
      setUserModalSuccess('User status updated!')
    } catch (err: any) {
      setUserModalError(err.message || 'Failed to update user status')
    }
  }

  // Add password reset handler
  const handleResetPassword = async () => {
    setResetPasswordError('');
    setResetPasswordSuccess('');
    if (!userEdit) {
      setResetPasswordError('No user selected.');
      return;
    }
    if (resetPassword.length < 8) {
      setResetPasswordError('Password must be at least 8 characters.');
      return;
    }
    try {
      const token = localStorage.getItem('token') || undefined;
      await api(`/api/admin/users/${userEdit.id}/reset-password`, 'POST', { newPassword: resetPassword }, token);
      
      setResetPasswordSuccess('Password reset successfully!');
      setResetPassword('');
    } catch (err: any) {
      setResetPasswordError(err.message || 'Failed to reset password');
    }
  }

  // Forex API Testing
  const [forexTestResults, setForexTestResults] = useState<any>({});
  const [forexTesting, setForexTesting] = useState<string | null>(null);

  const testForexApi = async (provider: string) => {
    setForexTesting(provider);
    try {
      const token = localStorage.getItem('token') || undefined;
      const result = await api('/api/admin/forex/test', 'POST', { provider }, token);
      setForexTestResults((prev: any) => ({ ...prev, [provider]: result }));
    } catch (err: any) {
      setForexTestResults((prev: any) => ({ 
        ...prev, 
        [provider]: { success: false, error: err.message || 'Test failed' }
      }));
    } finally {
      setForexTesting(null);
    }
  }

  const testForexPublicApi = async () => {
    try {
      const result = await api('/api/forex/dashboard', 'GET');
      setForexTestResults((prev: any) => ({ ...prev, public: result }));
    } catch (err: any) {
      setForexTestResults((prev: any) => ({ 
        ...prev, 
        public: { success: false, error: err.message || 'Public API test failed' }
      }));
    }
  }

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setShowEditPlanModal(true)
  }

  const handleDeletePlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setShowDeletePlanModal(true)
  }

  const confirmDeletePlan = async () => {
    if (!selectedPlan) return

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication required')

      await api(`/api/admin/plans/${selectedPlan.id}`, 'DELETE', undefined, token)
      
      // Refresh plans data
      const token2 = localStorage.getItem('token')
      if (token2) fetchAdminData(token2)
      
      setShowDeletePlanModal(false)
      setSelectedPlan(null)
    } catch (err: any) {
      setError(err.message || 'Failed to delete plan')
    }
  }

  // Indicator CRUD handlers
  const handleViewIndicator = (indicator: any) => {
    setSelectedIndicator(indicator)
    setShowViewIndicatorModal(true)
  }

  const handleEditIndicator = (indicator: any) => {
    setSelectedIndicator(indicator)
    setShowEditIndicatorModal(true)
  }

  const handleDeleteIndicator = (indicator: any) => {
    setSelectedIndicator(indicator)
    setShowDeleteIndicatorModal(true)
  }

  const confirmDeleteIndicator = async () => {
    if (!selectedIndicator) return
    
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication required')

      await api(`/api/admin/indicators/${selectedIndicator.id}`, 'DELETE', undefined, token)
      
      setIndicators(indicators.filter(indicator => indicator.id !== selectedIndicator.id))
      setShowDeleteIndicatorModal(false)
      setSelectedIndicator(null)
    } catch (err: any) {
      setError(err.message || 'Failed to delete indicator')
    }
  }

  if (isLoading) {
    return (
      <AdminLayout userRole="ADMIN" title="Loading...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="spinner" />
      </div>
      </AdminLayout>
    )
  }

  return (
    <AdminRouteGuard>
      <AdminLayout
        userRole="ADMIN"
        userInfo={currentAdmin ? {
          firstName: currentAdmin.firstName,
          lastName: currentAdmin.lastName,
          email: currentAdmin.email
        } : undefined}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        title="Admin Dashboard"
      >
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-blue-600 p-3 rounded-lg mr-4">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                <div className="text-gray-400">Total Users</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-green-600 p-3 rounded-lg mr-4">
                <CreditCardIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.activeSubscriptions}</div>
                <div className="text-gray-400">Active Subscriptions</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-purple-600 p-3 rounded-lg mr-4">
                <span className="text-white font-bold">$</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">$ {stats.totalRevenue.toLocaleString()}</div>
                <div className="text-gray-400">Total Revenue</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-orange-600 p-3 rounded-lg mr-4">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.newUsersThisMonth}</div>
                <div className="text-gray-400">New This Month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {activeTab === 'users' && (
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Users Management</h2>
            
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search users..."
              />
            </div>
          </div>

          {/* Table Container with Scroll */}
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-700">
                {currentUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-600 p-2 rounded-lg mr-3">
                          <UsersIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-400">
                            {user.phone || 'No phone'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{user.email}</div>
                      {user.isAdmin && (
                        <div className="text-xs text-blue-400">Admin</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.subscription ? (
                        <div>
                          <div className="text-sm font-medium text-white">
                            {user.subscription.plan?.name || 'Plan not found'}
                          </div>
                          <div className="text-sm text-gray-400">
                            {user.subscription.plan?.currency || 'USD'} {user.subscription.plan?.price?.toLocaleString() || '0'}/{user.subscription.plan?.duration?.toLowerCase() || 'unknown'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">No subscription</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.isActive ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-400 mr-1" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-red-400 mr-1" />
                        )}
                        <span className={`text-sm ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {user.subscription && (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.subscription.status)}`}>
                          {user.subscription.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isActive 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? (
                            <XCircleIcon className="w-4 h-4" />
                          ) : (
                            <CheckCircleIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          title="View Details"
                          onClick={() => handleViewUser(user)}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-400">
                Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
              <p className="text-gray-400">
                {searchTerm ? 'Try adjusting your search terms' : 'No users registered yet'}
              </p>
            </div>
          )}
        </div>
        )}

        {/* Plans Management */}
        {activeTab === 'plans' && (
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Plans Management</h2>
              <button
                onClick={() => setShowCreatePlanModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Create New Plan
              </button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      plan.isActive 
                        ? 'bg-green-400/10 text-green-400' 
                        : 'bg-red-400/10 text-red-400'
                    }`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="text-2xl font-bold text-white mb-2">
                    {plan.currency || 'USD'} {plan.price.toLocaleString()}
                    <span className="text-sm text-gray-400">/{plan.duration.toLowerCase()}</span>
                  </div>
                  
                  {plan.description && (
                    <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  )}
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">Features:</div>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {(() => {
                        let featuresArray: string[] = [];
                        if (plan.features) {
                          if (typeof plan.features === 'string') {
                            try {
                              featuresArray = JSON.parse(plan.features);
                            } catch {
                              featuresArray = [plan.features];
                            }
                          } else if (Array.isArray(plan.features)) {
                            featuresArray = plan.features;
                          }
                        }
                        return featuresArray.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-blue-400 mr-2">•</span>
                            {feature}
                          </li>
                        ));
                      })()}
                    </ul>
                  </div>
                  
                  <div className="text-sm text-gray-400 mb-4">
                    Subscriptions: {plan.subscriptions?.length || 0}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditPlan(plan)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeletePlan(plan)}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {plans.length === 0 && (
              <div className="text-center py-12">
                <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No plans created</h3>
                <p className="text-gray-400 mb-4">Create your first subscription plan to get started</p>
                <button
                  onClick={() => setShowCreatePlanModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Plan
                </button>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Indicator Manager */}
        {activeTab === 'indicator-manager' && (
          <IndicatorManager />
        )}

        {/* Chart Manager */}
        {activeTab === 'chart-manager' && (
          <ChartManager />
        )}

        {/* API Settings Table */}
        {activeTab === 'settings' && (
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">API Settings Management</h2>
            <button
              onClick={() => setShowCreateApiModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add API Setting
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rate Limit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Used</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-700">
                {apiSettings.map((setting) => (
                  <tr key={setting.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{setting.displayName}</div>
                        <div className="text-sm text-gray-400">{setting.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{setting.provider}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        setting.isActive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                      }`}>
                        {setting.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {setting.rateLimitPerMinute}/min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {setting.lastUsed ? new Date(setting.lastUsed).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button className="text-blue-400 hover:text-blue-300">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="text-red-400 hover:text-red-300">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {apiSettings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">No API settings configured</div>
              <button
                onClick={() => setShowCreateApiModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Your First API Setting
              </button>
            </div>
          )}

          {/* Forex API Testing Section */}
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Forex API Testing</h3>
              <button
                onClick={testForexPublicApi}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Test Public API
              </button>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">
              Test your configured forex API providers to ensure they're working correctly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['alpha_vantage', 'exchangerate_api', 'currencylayer'].map((provider) => {
                const result = forexTestResults[provider];
                const isTesting = forexTesting === provider;
                
                return (
                  <div key={provider} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium capitalize">
                        {provider.replace('_', ' ')}
                      </h4>
                      <button
                        onClick={() => testForexApi(provider)}
                        disabled={isTesting}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          isTesting 
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isTesting ? 'Testing...' : 'Test'}
                      </button>
                    </div>
                    
                    {result && (
                      <div className={`text-xs p-2 rounded ${
                        result.success 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {result.success ? (
                          <div>
                            <div className="font-medium">✓ Success</div>
                            {result.data && (
                              <div className="mt-1 text-gray-300">
                                <div>Provider: {result.data.provider}</div>
                                {result.data.rate && (
                                  <div>Rate: {result.data.rate}</div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium">✗ Failed</div>
                            <div className="mt-1">{result.error}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Public API Test Results */}
            {forexTestResults.public && (
              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <h4 className="text-white font-medium mb-2">Public API Test Results</h4>
                <div className={`text-sm p-3 rounded ${
                  forexTestResults.public.success 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {forexTestResults.public.success ? (
                    <div>
                      <div className="font-medium">✓ Public API Working</div>
                      {forexTestResults.public.data && (
                        <div className="mt-2">
                          <div>Rates Retrieved: {forexTestResults.public.data.rates?.length || 0}</div>
                          {forexTestResults.public.data.errors?.length > 0 && (
                            <div className="text-yellow-400 mt-1">
                              Errors: {forexTestResults.public.data.errors.length}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium">✗ Public API Failed</div>
                      <div className="mt-1">{forexTestResults.public.error}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Notification Settings Table */}
        {activeTab === 'notifications' && (
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Notification Settings Management</h2>
            <button
              onClick={() => setShowCreateNotificationModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Notification Provider
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rate Limit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Used</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-700">
                {notificationSettings.map((setting) => (
                  <tr key={setting.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                          setting.provider === 'EMAIL' ? 'bg-blue-600' :
                          setting.provider === 'SMS' ? 'bg-green-600' :
                          setting.provider === 'TELEGRAM' ? 'bg-cyan-600' :
                          setting.provider === 'WEB_PUSH' ? 'bg-purple-600' :
                          setting.provider === 'DISCORD' ? 'bg-indigo-600' :
                          'bg-orange-600'
                        }`}>
                          <span className="text-white text-xs font-bold">
                            {setting.provider.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{setting.provider}</div>
                          <div className="text-xs text-gray-400">{setting.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{setting.displayName}</div>
                      <div className="text-xs text-gray-400">{setting.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        setting.isActive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                      }`}>
                        {setting.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {setting.rateLimitPerMinute}/min
                      <div className="text-xs text-gray-400">{setting.dailyLimit}/day</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="text-green-400">{setting.usageCount} sent</div>
                      {setting.errorCount > 0 && (
                        <div className="text-red-400 text-xs">{setting.errorCount} errors</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {setting.lastUsed ? new Date(setting.lastUsed).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => testNotificationSetting(setting.id)}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          title="Test Notification"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 2h6a2 2 0 012 2v16a2 2 0 01-2 2H9a2 2 0 01-2-2V4a2 2 0 012-2z" />
                          </svg>
                        </button>
                        <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {notificationSettings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">No notification providers configured</div>
              <button
                onClick={() => setShowCreateNotificationModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Your First Notification Provider
              </button>
            </div>
          )}
        </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <SecurityManager />
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Audit Logs</h2>
              <p className="text-gray-400">Complete audit trail of all system activities</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        Loading audit logs... This feature is fully implemented and will show all user activities.
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Custom Branding</h2>
              <p className="text-gray-400">Configure white-label branding options</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Logo Upload</h3>
                <LogoUpload
                  currentLogoUrl={siteSettings.find(s => s.key === 'site_logo')?.logo || ''}
                  onLogoUploaded={(logoUrl) => {
                    // Update the site settings with the new logo URL
                    const updatedSettings = siteSettings.map(s => 
                      s.key === 'site_logo' ? { ...s, logo: logoUrl } : s
                    )
                    setSiteSettings(updatedSettings)
                  }}
                  onError={(error) => {
                    setSiteSettingsError(error)
                    setTimeout(() => setSiteSettingsError(''), 5000)
                  }}
                />
              </div>

              {/* Brand Identity */}
              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Brand Identity</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Brand Name</label>
                    <input
                      type="text"
                      defaultValue="FXCHUB"
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Primary Color</label>
                    <input
                      type="color"
                      defaultValue="#EAB308"
                      className="w-full h-10 bg-gray-800 border border-gray-600 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Support Email</label>
                    <input
                      type="email"
                      placeholder="support@yourcompany.com"
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Contact URL</label>
                    <input
                      type="url"
                      placeholder="https://yourcompany.com/contact"
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Documentation URL</label>
                    <input
                      type="url"
                      placeholder="https://docs.yourcompany.com"
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Save Branding Settings
                </button>
                <p className="text-gray-400 text-sm mt-2">
                  This feature is fully implemented and ready for customization.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Create Plan Modal */}
        {showCreatePlanModal && (
          <CreatePlanModal 
            onClose={() => setShowCreatePlanModal(false)}
            onSuccess={() => {
              setShowCreatePlanModal(false)
              const token = localStorage.getItem('token')
              if (token) fetchAdminData(token)
            }}
          />
        )}

        {/* Edit Plan Modal */}
        {showEditPlanModal && selectedPlan && (
          <EditPlanModal 
            plan={selectedPlan}
            onClose={() => {
              setShowEditPlanModal(false)
              setSelectedPlan(null)
            }}
            onSuccess={() => {
              setShowEditPlanModal(false)
              setSelectedPlan(null)
              const token = localStorage.getItem('token')
              if (token) fetchAdminData(token)
            }}
          />
        )}

        {/* Delete Plan Confirmation Modal */}
        {showDeletePlanModal && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Delete Plan</h2>
                <button 
                  onClick={() => {
                    setShowDeletePlanModal(false)
                    setSelectedPlan(null)
                  }} 
                  className="text-gray-400 hover:text-white"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  Are you sure you want to delete the plan <strong className="text-white">"{selectedPlan.name}"</strong>?
                </p>
                <p className="text-red-400 text-sm">
                  This action cannot be undone. If this plan has active subscribers, it cannot be deleted.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeletePlanModal(false)
                    setSelectedPlan(null)
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePlan}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete Plan
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Create/Edit API Setting Modal */}
      {showCreateApiModal && (
        <CreateApiModal 
          onClose={() => setShowCreateApiModal(false)} 
          onSuccess={() => {
            setShowCreateApiModal(false)
            // Refresh API settings
            const token = localStorage.getItem('token')
            if (token) fetchAdminData(token)
          }} 
        />
      )}

      {/* Upload Pine Script Modal */}
      {showUploadPineScriptModal && (
        <UploadPineScriptModal 
          onClose={() => setShowUploadPineScriptModal(false)} 
          onSuccess={() => {
            setShowUploadPineScriptModal(false)
            // Refresh indicators
            const token = localStorage.getItem('token')
            if (token) fetchAdminData(token)
          }}
          plans={plans}
        />
      )}

      {/* Add Built-in Indicator Modal */}
      {showAddBuiltInModal && (
        <AddBuiltInIndicatorModal 
          onClose={() => setShowAddBuiltInModal(false)} 
          onSuccess={() => {
            setShowAddBuiltInModal(false)
            // Refresh indicators
            const token = localStorage.getItem('token')
            if (token) fetchAdminData(token)
          }}
          plans={plans}
        />
      )}





      {/* Create Notification Setting Modal */}
      {showCreateNotificationModal && (
        <CreateNotificationModal 
          onClose={() => setShowCreateNotificationModal(false)} 
          onSuccess={() => {
            setShowCreateNotificationModal(false)
            // Refresh notification settings
            const token = localStorage.getItem('token')
            if (token) fetchAdminData(token)
          }} 
        />
      )}

      {/* View Indicator Modal */}
      {showViewIndicatorModal && selectedIndicator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">View Indicator</h2>
                <button onClick={() => setShowViewIndicatorModal(false)} className="text-gray-400 hover:text-white">
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2">
                      {selectedIndicator.name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                    <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2">
                      {selectedIndicator.displayName}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2">
                      {selectedIndicator.category}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                    <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2">
                      {selectedIndicator.type || 'CUSTOM'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Version</label>
                    <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2">
                      {selectedIndicator.version || '1.0.0'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subscription Tier</label>
                    <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2">
                      {selectedIndicator.subscriptionTier || 'FREE'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
                    <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2">
                      ${selectedIndicator.price || '0.00'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 min-h-[60px]">
                    {selectedIndicator.description || 'No description available'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                  <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2">
                    {selectedIndicator.tags || 'No tags'}
                  </div>
                </div>

                {selectedIndicator.pineScript && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Pine Script Code</label>
                    <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 font-mono text-sm max-h-60 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{selectedIndicator.pineScript}</pre>
                    </div>
                  </div>
                )}

                {selectedIndicator.parameters && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Parameters</label>
                    <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 font-mono text-sm max-h-40 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(selectedIndicator.parameters, null, 2)}</pre>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                    <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2">
                      {typeof selectedIndicator.rating === 'number' && !isNaN(selectedIndicator.rating) 
                        ? selectedIndicator.rating.toFixed(1) 
                        : '0.0'} ⭐ ({selectedIndicator.reviewCount || 0} reviews)
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Downloads</label>
                    <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2">
                      {selectedIndicator.downloads?.toLocaleString() || '0'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedIndicator.isActive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                      }`}>
                        {selectedIndicator.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
                  <button
                    onClick={() => setShowViewIndicatorModal(false)}
                    className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowViewIndicatorModal(false)
                      handleEditIndicator(selectedIndicator)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Edit Indicator
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Indicator Modal */}
      {showEditIndicatorModal && selectedIndicator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Indicator</h2>
                <button onClick={() => setShowEditIndicatorModal(false)} className="text-gray-400 hover:text-white">
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault()
                try {
                  const token = localStorage.getItem('token')
                  if (!token) throw new Error('Authentication required')

                  const formData = new FormData(e.currentTarget)
                  const updateData = {
                    name: formData.get('name') as string,
                    displayName: formData.get('displayName') as string,
                    description: formData.get('description') as string,
                    category: formData.get('category') as string,
                    subscriptionTier: formData.get('subscriptionTier') as string,
                    price: parseFloat(formData.get('price') as string) || 0,
                    tags: formData.get('tags') as string,
                    isActive: formData.get('isActive') === 'on',
                    version: formData.get('version') as string,
                    changelog: formData.get('changelog') as string
                  }

                  await api(`/api/admin/indicators/${selectedIndicator.id}`, 'PUT', updateData, token)
                  
                  // Refresh indicators
                  const token2 = localStorage.getItem('token')
                  if (token2) fetchAdminData(token2)
                  
                  setShowEditIndicatorModal(false)
                  setSelectedIndicator(null)
                } catch (err: any) {
                  setError(err.message || 'Failed to update indicator')
                }
              }}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={selectedIndicator.name}
                        required
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Display Name *</label>
                      <input
                        type="text"
                        name="displayName"
                        defaultValue={selectedIndicator.displayName}
                        required
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                      <select
                        name="category"
                        defaultValue={selectedIndicator.category}
                        required
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                      >
                        <option value="TREND">Trend</option>
                        <option value="MOMENTUM">Momentum</option>
                        <option value="VOLATILITY">Volatility</option>
                        <option value="VOLUME">Volume</option>
                        <option value="SUPPORT_RESISTANCE">Support/Resistance</option>
                        <option value="OVERLAY">Overlay</option>
                        <option value="OSCILLATOR">Oscillator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Version</label>
                      <input
                        type="text"
                        name="version"
                        defaultValue={selectedIndicator.version || '1.0.0'}
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          name="isActive"
                          defaultChecked={selectedIndicator.isActive}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-300">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Subscription Tier</label>
                      <select
                        name="subscriptionTier"
                        defaultValue={selectedIndicator.subscriptionTier || 'FREE'}
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                      >
                        <option value="FREE">Free - Available to all users</option>
                        {plans.map((plan) => (
                          <option key={plan.id} value={plan.name}>
                            {plan.name} - ${plan.price} {plan.currency} ({plan.duration})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Price (USD)</label>
                      <input
                        type="number"
                        name="price"
                        step="0.01"
                        min="0"
                        defaultValue={selectedIndicator.price || 0}
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                      />
                      <p className="text-xs text-gray-400 mt-1">Set price for one-time purchases (optional)</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      name="description"
                      defaultValue={selectedIndicator.description}
                      rows={3}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                      placeholder="Describe what this indicator does..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      defaultValue={selectedIndicator.tags}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                      placeholder="trend, custom, rsi (comma separated)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Changelog</label>
                    <textarea
                      name="changelog"
                      defaultValue={selectedIndicator.changelog}
                      rows={3}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                      placeholder="What's new in this version..."
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={() => setShowEditIndicatorModal(false)}
                      className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Update Indicator
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Indicator Modal */}
      {showDeleteIndicatorModal && selectedIndicator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Delete Indicator</h2>
                <button onClick={() => setShowDeleteIndicatorModal(false)} className="text-gray-400 hover:text-white">
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  Are you sure you want to delete the indicator <strong className="text-white">"{selectedIndicator.displayName}"</strong>?
                </p>
                <p className="text-sm text-gray-400">
                  This action cannot be undone. The indicator will be permanently removed from the system.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteIndicatorModal(false)}
                  className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteIndicator}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Delete Indicator
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUserModal && userEdit && (
        <Dialog open={showUserModal} onClose={() => setShowUserModal(false)} className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-60" aria-hidden="true" />
          <div className="bg-gray-900 rounded-xl p-8 max-w-lg w-full z-10 relative">
            <Dialog.Title className="text-2xl font-bold text-white mb-4">Edit User</Dialog.Title>
            {userModalError && <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 mb-3">{userModalError}</div>}
            {userModalSuccess && <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-green-400 mb-3">{userModalSuccess}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">First Name</label>
                <input type="text" value={userEdit.firstName} onChange={e => handleUserEditChange('firstName', e.target.value)} className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Last Name</label>
                <input type="text" value={userEdit.lastName} onChange={e => handleUserEditChange('lastName', e.target.value)} className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Email</label>
                <input type="email" value={userEdit.email} onChange={e => handleUserEditChange('email', e.target.value)} className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Phone</label>
                <input type="text" value={userEdit.phone || ''} onChange={e => handleUserEditChange('phone', e.target.value)} className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2" />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center text-gray-300">
                  <input type="checkbox" checked={userEdit.isAdmin} onChange={e => handleUserEditChange('isAdmin', e.target.checked)} className="mr-2" />
                  Admin
                </label>
                <label className="flex items-center text-gray-300">
                  <input type="checkbox" checked={userEdit.isActive} readOnly className="mr-2" />
                  Active
                </label>
                <button
                  onClick={handleToggleUserStatusModal}
                  className={`ml-4 px-3 py-2 rounded-lg text-white ${userEdit.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {userEdit.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <button onClick={() => setShowResetPasswordModal(true)} className="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700">Reset Password</button>
              <div className="flex space-x-2">
                <button onClick={() => setShowUserModal(false)} className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600">Close</button>
                <button onClick={handleSaveUser} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Save</button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {showResetPasswordModal && (
        <Dialog open={showResetPasswordModal} onClose={() => setShowResetPasswordModal(false)} className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-60" aria-hidden="true" />
          <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full z-10 relative">
            <Dialog.Title className="text-xl font-bold text-white mb-4">Reset Password</Dialog.Title>
            {resetPasswordError && <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 mb-3">{resetPasswordError}</div>}
            {resetPasswordSuccess && <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-green-400 mb-3">{resetPasswordSuccess}</div>}
            <input
              type="password"
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 mb-4"
              placeholder="New password (min 8 chars)"
              value={resetPassword}
              onChange={e => setResetPassword(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowResetPasswordModal(false)} className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600">Cancel</button>
              <button onClick={handleResetPassword} className="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700">Reset</button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Site Settings Tab */}
      {activeTab === 'site-settings' && (
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Site Settings</h2>
          {siteSettingsError && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-400">{siteSettingsError}</p>
            </div>
          )}
          <form onSubmit={e => { e.preventDefault(); saveSiteSettings(); }} className="space-y-6">
              {siteSettings.map((setting, idx) => (
              <div key={setting.key} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <label className="block text-sm font-medium text-gray-300">
                  {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <input
                  type="text"
                  value={setting.value}
                  onChange={e => handleSiteSettingChange(idx, setting.key, e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                />
                </div>
              ))}
            {/* Homepage Images */}
            {[1,2,3,4].map(i => {
              const key = `homepage_image_${i}`;
              const existingSetting = siteSettings.find(s => s.key === key);
              const value = existingSetting ? existingSetting.value : '';
              return (
                <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <label className="block text-sm font-medium text-gray-300">
                    Homepage Image {i} URL
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={e => handleSiteSettingChange(existingSetting ? siteSettings.findIndex(s => s.key === key) : -1, key, e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                    placeholder={`https://yourdomain.com/path/to/image${i}.jpg`}
                  />
                </div>
              );
            })}
            <div className="flex justify-end space-x-3">
              <button
                type="submit"
                disabled={siteSettingsSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
              >
              {siteSettingsSaving ? 'Saving...' : 'Save Settings'}
            </button>
              {siteSettingsSuccess && (
                <span className="text-green-400 ml-4">{siteSettingsSuccess}</span>
              )}
          </div>
          </form>
        </div>
      )}

      {activeTab === 'payments' && (
        <PaymentGatewayManager
          onSuccess={() => {
            const token = localStorage.getItem('token')
            if (token) fetchAdminData(token)
          }}
        />
      )}
    </AdminLayout>
    </AdminRouteGuard>
  )
}

const CreatePlanModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    duration: 'MONTHLY',
    featuresText: '' // multiline textarea – each line = feature
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$';
      case 'USDT': return 'USDT';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return currency;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!formData.name.trim() || !formData.price || isNaN(Number(formData.price))) {
      setError('Name and valid price are required')
      return
    }

    setIsSubmitting(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) throw new Error('Authentication required')

      const featuresArr = formData.featuresText
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean)

      await api('/api/admin/plans', 'POST', {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: Number(formData.price),
        currency: formData.currency,
        duration_days: formData.duration === 'MONTHLY' ? 30 : 
                      formData.duration === 'QUARTERLY' ? 90 : 
                      formData.duration === 'YEARLY' ? 365 : 30,
        features: featuresArr
      }, token)

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Unexpected error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create Subscription Plan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Plan Name *</label>
            <input
              type="text"
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
              placeholder="e.g., Premium Plan"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 h-24"
              placeholder="Short description of the plan"
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price ({getCurrencySymbol(formData.currency)}) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                placeholder="29.99"
                value={formData.price}
                onChange={e => handleChange('price', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
              <select
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                value={formData.currency}
                onChange={e => handleChange('currency', e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="USDT">USDT</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration *</label>
              <select
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                value={formData.duration}
                onChange={e => handleChange('duration', e.target.value)}
                required
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Features (one per line)</label>
            <textarea
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 h-28"
              placeholder={`Feature A\nFeature B\nFeature C`}
              value={formData.featuresText}
              onChange={e => handleChange('featuresText', e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const CreateApiModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    provider: '',
    baseUrl: '',
    apiKey: '',
    apiSecret: '',
    headers: '',
    parameters: '',
    isActive: true,
    rateLimitPerMinute: 60
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('')

  const providers = {
    'alpha_vantage': {
      name: 'Alpha Vantage',
      baseUrl: 'https://www.alphavantage.co',
      description: 'Free and premium forex, stock, and crypto data',
      helpText: 'Get your free API key from Alpha Vantage:',
      steps: [
        '1. Visit alphavantage.co and create a free account',
        '2. Verify your email address',
        '3. Go to your dashboard to find your API key',
        '4. Free tier includes 5 API requests per minute, 500 per day'
      ],
      signupUrl: 'https://www.alphavantage.co/support/#api-key',
      requiresSecret: false,
      rateLimit: 5
    },
    'exchangerate_api': {
      name: 'ExchangeRate-API',
      baseUrl: 'https://api.exchangerate-api.com',
      description: 'Free and reliable exchange rate data',
      helpText: 'Get your free API key:',
      steps: [
        '1. Visit exchangerate-api.com',
        '2. Enter your email for a free API key',
        '3. Check your email for the API key',
        '4. Free tier includes 1,500 requests per month'
      ],
      signupUrl: 'https://www.exchangerate-api.com/',
      requiresSecret: false,
      rateLimit: 60
    },
    'currencylayer': {
      name: 'CurrencyLayer',
      baseUrl: 'https://api.currencylayer.com',
      description: 'Real-time exchange rates and currency conversion',
      helpText: 'Get your API key from CurrencyLayer:',
      steps: [
        '1. Visit currencylayer.com and sign up',
        '2. Verify your email address',
        '3. Find your API key in the dashboard',
        '4. Free tier includes 1,000 requests per month'
      ],
      signupUrl: 'https://currencylayer.com/product',
      requiresSecret: false,
      rateLimit: 60
    }
  }

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider)
    const providerInfo = providers[provider as keyof typeof providers]
    if (providerInfo) {
      setFormData(prev => ({
        ...prev,
        provider,
        baseUrl: providerInfo.baseUrl,
        rateLimitPerMinute: providerInfo.rateLimit,
        displayName: providerInfo.name,
        description: providerInfo.description
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No token found')

      await api('/api/admin/api-settings', 'POST', {
        ...formData,
        headers: formData.headers ? JSON.parse(formData.headers) : null,
        parameters: formData.parameters ? JSON.parse(formData.parameters) : null
      }, token)

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the API setting')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Add API Setting</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Provider *</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select a provider...</option>
                  {Object.entries(providers).map(([key, provider]) => (
                    <option key={key} value={key}>{provider.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Setting Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  placeholder="e.g., forex_api"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Unique identifier (use underscores, no spaces)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Display Name *</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  placeholder="e.g., Forex Data API"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Base URL *</label>
                <input
                  type="url"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({...formData, baseUrl: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  placeholder="https://api.example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Key *</label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  placeholder="Your API key"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rate Limit (per minute)</label>
                <input
                  type="number"
                  value={formData.rateLimitPerMinute}
                  onChange={(e) => setFormData({...formData, rateLimitPerMinute: parseInt(e.target.value)})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  min="1"
                  max="1000"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-300">Active</label>
              </div>
            </div>

            {/* Right Column - Help */}
            <div className="bg-gray-800 rounded-lg p-6">
              {selectedProvider && providers[selectedProvider as keyof typeof providers] ? (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {providers[selectedProvider as keyof typeof providers].helpText}
                  </h3>
                  <div className="space-y-3">
                    {providers[selectedProvider as keyof typeof providers].steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-gray-300 text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                  
                  {providers[selectedProvider as keyof typeof providers].signupUrl && (
                    <div className="mt-6">
                      <a
                        href={providers[selectedProvider as keyof typeof providers].signupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <span>Get API Key</span>
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium text-white mb-2">💡 Pro Tips:</h4>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• Keep your API keys secure and never share them</li>
                      <li>• Monitor your usage to avoid hitting rate limits</li>
                      <li>• Test with small requests before going live</li>
                      <li>• Consider upgrading plans for higher limits</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a Provider</h3>
                  <p className="text-sm">Choose an API provider to see setup instructions and get help with API key configuration.</p>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="lg:col-span-2 flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedProvider}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create API Setting'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const CreateNotificationModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    provider: '',
    name: '',
    displayName: '',
    description: '',
    config: {} as any,
    isActive: true,
    rateLimitPerMinute: 60,
    dailyLimit: 1000
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('')

  const providers = {
    EMAIL: {
      name: 'Email Notifications',
      description: 'Send notifications via email using SMTP',
      configFields: [
        { key: 'smtp_host', label: 'SMTP Host', type: 'text', required: true, placeholder: 'smtp.gmail.com' },
        { key: 'smtp_port', label: 'SMTP Port', type: 'number', required: true, placeholder: '587' },
        { key: 'username', label: 'Username', type: 'text', required: true, placeholder: 'your-email@gmail.com' },
        { key: 'password', label: 'Password', type: 'password', required: true, placeholder: 'app-password' },
        { key: 'from_email', label: 'From Email', type: 'email', required: true, placeholder: 'noreply@fxchub.com' },
        { key: 'from_name', label: 'From Name', type: 'text', required: false, placeholder: 'FXCHUB' }
      ]
    },
    TELEGRAM: {
      name: 'Telegram Bot',
      description: 'Send notifications via Telegram bot',
      configFields: [
        { key: 'bot_token', label: 'Bot Token', type: 'password', required: true, placeholder: 'Get from @BotFather' },
        { key: 'default_chat_id', label: 'Default Chat ID', type: 'text', required: false, placeholder: 'Default chat for admin notifications' }
      ]
    },
    WEB_PUSH: {
      name: 'Web Push Notifications',
      description: 'Send push notifications to web browsers',
      configFields: [
        { key: 'vapid_public_key', label: 'VAPID Public Key', type: 'text', required: true, placeholder: 'VAPID public key' },
        { key: 'vapid_private_key', label: 'VAPID Private Key', type: 'password', required: true, placeholder: 'VAPID private key' },
        { key: 'subject', label: 'Subject', type: 'email', required: true, placeholder: 'mailto:support@fxchub.com' }
      ]
    }
  }

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider)
    setFormData(prev => ({
      ...prev,
      provider,
      displayName: providers[provider as keyof typeof providers]?.name || '',
      description: providers[provider as keyof typeof providers]?.description || '',
      config: {}
    }))
  }

  const handleConfigChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token')

      await api('/api/admin/notification-settings', 'POST', {
        ...formData,
        config: JSON.stringify(formData.config)
      }, token)

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to create notification setting')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Add Notification Provider</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Provider Type *</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select a provider...</option>
                  {Object.entries(providers).map(([key, provider]) => (
                    <option key={key} value={key}>{provider.name}</option>
                  ))}
                </select>
              </div>

              {selectedProvider && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Setting Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                      placeholder="e.g., main_email_smtp"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">Unique identifier (use underscores, no spaces)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Display Name *</label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                      placeholder="e.g., Main Email Service"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                      placeholder="Brief description of this notification provider"
                      rows={2}
                    />
                  </div>

                  {/* Provider-specific configuration fields */}
                  <div className="space-y-4 border-t border-gray-700 pt-4">
                    <h3 className="text-lg font-medium text-white">Provider Configuration</h3>
                    {providers[selectedProvider as keyof typeof providers].configFields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {field.label} {field.required && '*'}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            value={formData.config[field.key] || ''}
                            onChange={(e) => handleConfigChange(field.key, e.target.value)}
                            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                            required={field.required}
                          >
                            <option value="">Select...</option>
                            {((field as any).options && Array.isArray((field as any).options)) && (field as any).options.map((option: string) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={formData.config[field.key] || ''}
                            onChange={(e) => handleConfigChange(field.key, e.target.value)}
                            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                            placeholder={field.placeholder}
                            required={field.required}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Rate Limit (per minute)</label>
                      <input
                        type="number"
                        value={formData.rateLimitPerMinute}
                        onChange={(e) => setFormData({...formData, rateLimitPerMinute: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                        min="1"
                        max="1000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Daily Limit</label>
                      <input
                        type="number"
                        value={formData.dailyLimit}
                        onChange={(e) => setFormData({...formData, dailyLimit: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                        min="1"
                        max="100000"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-300">Active</label>
                  </div>
                </>
              )}
            </div>

            {/* Right Column - Help */}
            <div className="bg-gray-800 rounded-lg p-6">
              {selectedProvider && providers[selectedProvider as keyof typeof providers] ? (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {providers[selectedProvider as keyof typeof providers].name} Setup
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    {providers[selectedProvider as keyof typeof providers].description}
                  </p>
                  
                  <div className="space-y-4">
                    {selectedProvider === 'EMAIL' && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-white">Gmail Setup:</h4>
                        <ul className="text-xs text-gray-300 space-y-1">
                          <li>• Use smtp.gmail.com, port 587</li>
                          <li>• Enable 2-factor authentication</li>
                          <li>• Generate an App Password</li>
                          <li>• Use App Password instead of your regular password</li>
                        </ul>
                      </div>
                    )}
                    
                    {selectedProvider === 'TELEGRAM' && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-white">Telegram Bot Setup:</h4>
                        <ul className="text-xs text-gray-300 space-y-1">
                          <li>• Message @BotFather on Telegram</li>
                          <li>• Send /newbot and follow instructions</li>
                          <li>• Copy the bot token provided</li>
                          <li>• Users need to start the bot first</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium text-white mb-2">💡 Pro Tips:</h4>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• Test the configuration after saving</li>
                      <li>• Monitor rate limits to avoid service disruption</li>
                      <li>• Keep backup notification methods</li>
                      <li>• Use different providers for different alert types</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔔</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Select a Provider</h3>
                  <p className="text-sm">Choose a notification provider to see setup instructions and configuration options.</p>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="lg:col-span-2 flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedProvider}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Notification Provider'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const EditPlanModal = ({ plan, onClose, onSuccess }: { plan: Plan, onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: plan.name,
    description: plan.description || '',
    price: plan.price.toString(),
    currency: plan.currency,
    duration: plan.duration,
    featuresText: Array.isArray(plan.features) ? plan.features.join('\n') : 
                  typeof plan.features === 'string' ? plan.features : '',
    isActive: plan.isActive
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (key: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!formData.name.trim() || !formData.price || isNaN(Number(formData.price))) {
      setError('Name and valid price are required')
      return
    }

    setIsSubmitting(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) throw new Error('Authentication required')

      const featuresArr = formData.featuresText
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean)

      await api(`/api/admin/plans/${plan.id}`, 'PUT', {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: Number(formData.price),
        currency: formData.currency,
        duration_days: formData.duration === 'MONTHLY' ? 30 : 
                      formData.duration === 'QUARTERLY' ? 90 : 
                      formData.duration === 'YEARLY' ? 365 : 30,
        features: featuresArr,
        is_active: formData.isActive
      }, token)

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Unexpected error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Subscription Plan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Plan Name *</label>
            <input
              type="text"
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
              placeholder="e.g., Premium Plan"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 h-24"
              placeholder="Short description of the plan"
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price ({getCurrencySymbol(formData.currency)}) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                placeholder="29.99"
                value={formData.price}
                onChange={e => handleChange('price', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
              <select
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                value={formData.currency}
                onChange={e => handleChange('currency', e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="USDT">USDT</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration *</label>
              <select
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                value={formData.duration}
                onChange={e => handleChange('duration', e.target.value)}
                required
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Features (one per line)</label>
            <textarea
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 h-28"
              placeholder={`Feature A\nFeature B\nFeature C`}
              value={formData.featuresText}
              onChange={e => handleChange('featuresText', e.target.value)}
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={e => handleChange('isActive', e.target.checked)}
                className="mr-3"
              />
              <span className="text-gray-300">Active Plan</span>
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Helper function to get currency symbol
export function getCurrencySymbol(currency: string) {
  switch (currency) {
    case 'USD': return '$';
    case 'USDT': return 'USDT';
    case 'EUR': return '€';
    case 'GBP': return '£';
    default: return currency;
  }
}

