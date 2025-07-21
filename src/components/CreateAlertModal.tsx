'use client'

import React, { useState } from 'react'
import { 
  XMarkIcon,
  BellIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  CogIcon
} from '@heroicons/react/24/outline'

interface CreateAlertModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface AlertFormData {
  name: string
  description: string
  symbol: string
  exchange: string
  conditionType: string
  conditionValue: string
  indicatorName: string
  indicatorParams: string
  isRecurring: boolean
  cooldownMinutes: string
  expiresAt: string
  notifyEmail: boolean
  notifySms: boolean
  notifyTelegram: boolean
  notifyWebPush: boolean
}

const conditionTypes = [
  { value: 'PRICE_ABOVE', label: 'Price Above', description: 'Alert when price goes above a certain level' },
  { value: 'PRICE_BELOW', label: 'Price Below', description: 'Alert when price goes below a certain level' },
  { value: 'PRICE_CHANGE_PERCENT', label: 'Price Change %', description: 'Alert when price changes by a percentage' },
  { value: 'RSI_OVERBOUGHT', label: 'RSI Overbought', description: 'Alert when RSI indicates overbought conditions' },
  { value: 'RSI_OVERSOLD', label: 'RSI Oversold', description: 'Alert when RSI indicates oversold conditions' },
  { value: 'MACD_BULLISH_CROSS', label: 'MACD Bullish Cross', description: 'Alert when MACD makes a bullish crossover' },
  { value: 'MACD_BEARISH_CROSS', label: 'MACD Bearish Cross', description: 'Alert when MACD makes a bearish crossover' },
  { value: 'VOLUME_SPIKE', label: 'Volume Spike', description: 'Alert when trading volume spikes' }
]

const popularSymbols = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
  'EURGBP', 'EURJPY', 'GBPJPY', 'CHFJPY', 'AUDJPY', 'CADJPY', 'NZDJPY',
  'EURCHF', 'GBPCHF', 'AUDCHF', 'CADCHF', 'NZDCHF', 'AUDCAD', 'NZDCAD'
]

export default function CreateAlertModal({ isOpen, onClose, onSuccess }: CreateAlertModalProps) {
  const [formData, setFormData] = useState<AlertFormData>({
    name: '',
    description: '',
    symbol: '',
    exchange: 'FOREX',
    conditionType: 'PRICE_ABOVE',
    conditionValue: '',
    indicatorName: '',
    indicatorParams: '',
    isRecurring: false,
    cooldownMinutes: '60',
    expiresAt: '',
    notifyEmail: true,
    notifySms: false,
    notifyTelegram: false,
    notifyWebPush: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('basic')

  if (!isOpen) return null

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

      const response = await fetch('/api/user/alerts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          conditionValue: formData.conditionValue ? parseFloat(formData.conditionValue) : null,
          cooldownMinutes: parseInt(formData.cooldownMinutes),
          expiresAt: formData.expiresAt || null,
          indicatorParams: formData.indicatorParams ? JSON.parse(formData.indicatorParams) : null
        })
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
        onClose()
        // Reset form
        setFormData({
          name: '',
          description: '',
          symbol: '',
          exchange: 'FOREX',
          conditionType: 'PRICE_ABOVE',
          conditionValue: '',
          indicatorName: '',
          indicatorParams: '',
          isRecurring: false,
          cooldownMinutes: '60',
          expiresAt: '',
          notifyEmail: true,
          notifySms: false,
          notifyTelegram: false,
          notifyWebPush: true
        })
      } else {
        setError(data.error || 'Failed to create alert')
      }
    } catch (err) {
      setError('An error occurred while creating the alert')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof AlertFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getConditionDescription = () => {
    const condition = conditionTypes.find(c => c.value === formData.conditionType)
    return condition?.description || ''
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BellIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Create Signal Alert</h2>
                <p className="text-gray-400">Set up automated notifications for market conditions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'basic'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
              Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('conditions')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'conditions'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <ChartBarIcon className="w-4 h-4 inline mr-2" />
              Conditions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <BellIcon className="w-4 h-4 inline mr-2" />
              Notifications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('advanced')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'advanced'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <CogIcon className="w-4 h-4 inline mr-2" />
              Advanced
            </button>
          </div>

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Alert Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., EURUSD Price Breakout"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Currency Pair *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.symbol}
                      onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., EURUSD"
                      required
                    />
                    <div className="absolute right-2 top-2">
                      <select
                        value={formData.exchange}
                        onChange={(e) => handleInputChange('exchange', e.target.value)}
                        className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-xs"
                      >
                        <option value="FOREX">Forex</option>
                        <option value="CRYPTO">Crypto</option>
                        <option value="STOCKS">Stocks</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Popular: {popularSymbols.slice(0, 6).join(', ')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional description of this alert"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Conditions Tab */}
          {activeTab === 'conditions' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Condition Type *
                </label>
                <select
                  value={formData.conditionType}
                  onChange={(e) => handleInputChange('conditionType', e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {conditionTypes.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-400">{getConditionDescription()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Condition Value *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.conditionValue}
                  onChange={(e) => handleInputChange('conditionValue', e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={formData.conditionType.includes('PRICE') ? '1.2500' : '70'}
                  required
                />
                <p className="mt-2 text-xs text-gray-400">
                  {formData.conditionType.includes('PRICE') 
                    ? 'Enter the price level (e.g., 1.2500 for EURUSD)'
                    : formData.conditionType.includes('RSI')
                    ? 'Enter RSI value (0-100)'
                    : formData.conditionType.includes('PERCENT')
                    ? 'Enter percentage change (e.g., 2.5 for 2.5%)'
                    : 'Enter the threshold value'
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recurring Alert
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Alert can trigger multiple times</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cooldown (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.cooldownMinutes}
                    onChange={(e) => handleInputChange('cooldownMinutes', e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="1440"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.notifyEmail}
                      onChange={(e) => handleInputChange('notifyEmail', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-white">Email Notifications</span>
                      <p className="text-xs text-gray-400">Receive alerts via email</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.notifyWebPush}
                      onChange={(e) => handleInputChange('notifyWebPush', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-white">Browser Notifications</span>
                      <p className="text-xs text-gray-400">Receive alerts in your browser</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.notifySms}
                      onChange={(e) => handleInputChange('notifySms', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-white">SMS Notifications</span>
                      <p className="text-xs text-gray-400">Receive alerts via SMS (Premium)</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.notifyTelegram}
                      onChange={(e) => handleInputChange('notifyTelegram', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-white">Telegram Notifications</span>
                      <p className="text-xs text-gray-400">Receive alerts via Telegram (Premium)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-medium text-blue-400 mb-2">💡 Notification Tips</h4>
                <ul className="text-sm text-blue-300 space-y-1">
                  <li>• Email and browser notifications are free for all users</li>
                  <li>• SMS and Telegram require a premium subscription</li>
                  <li>• Use multiple channels to ensure you never miss important signals</li>
                </ul>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expiration Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-2 text-xs text-gray-400">
                  Leave empty for no expiration
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Technical Indicator Parameters (JSON)
                </label>
                <textarea
                  value={formData.indicatorParams}
                  onChange={(e) => handleInputChange('indicatorParams', e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder='{"period": 14, "source": "close"}'
                  rows={4}
                />
                <p className="mt-2 text-xs text-gray-400">
                  Advanced: Custom parameters for technical indicators
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-700">
            <div className="flex space-x-3">
              {activeTab !== 'basic' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'conditions' ? 'basic' : activeTab === 'notifications' ? 'conditions' : 'notifications')}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              {activeTab !== 'advanced' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'basic' ? 'conditions' : activeTab === 'conditions' ? 'notifications' : 'advanced')}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Next
                </button>
              )}
              
              {activeTab === 'advanced' && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <BellIcon className="w-4 h-4" />
                      <span>Create Alert</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 