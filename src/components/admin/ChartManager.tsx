'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrashIcon, 
  PencilIcon,
  EyeIcon,
  PlusIcon,
  CogIcon,
  PlayIcon,
  StopIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChartBarIcon,
  GlobeAltIcon,
  CpuChipIcon,
  SparklesIcon,
  XMarkIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import TradingViewChartEmbed from '@/components/TradingViewChartEmbed'

interface Indicator {
  id: string
  name: string
  displayName: string
  description: string
  category: string
  type: 'BUILT_IN' | 'JS_SCRIPT' | 'CUSTOM'
  isBuiltIn: boolean
  jsCode?: string
  tvStudyId?: string
  parameters?: any
  version: string
  changelog?: string
  tags?: string[]
  isPremium: boolean
  subscriptionTier: 'FREE' | 'PRO' | 'VIP'
  isActive: boolean
  rating: number
  reviewCount: number
  downloads: number
  validationResult?: any
}

interface Chart {
  id: string
  name: string
  displayName: string
  description: string
  type: 'FREE' | 'ADVANCED_LIBRARY' | 'ADVANCED_CHART'
  symbol: string
  interval: string
  theme: 'light' | 'dark'
  isActive: boolean
  features: {
    timeframes: boolean
    indicators: boolean
    drawingTools: boolean
    alerts: boolean
    news: boolean
    volume: boolean
    fullscreen: boolean
  }
  dataSource: {
    type: 'tradingview' | 'custom'
    apiKey?: string
    endpoint?: string
  }
  selectedIndicators?: string[] // Array of indicator IDs
  createdAt: string
  updatedAt: string
}

interface ChartManagerProps {
  onChartChange?: () => void
}

const ChartManager: React.FC<ChartManagerProps> = ({ onChartChange }) => {
  const [charts, setCharts] = useState<Chart[]>([])
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedChart, setSelectedChart] = useState<Chart | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  // Load charts and indicators
  useEffect(() => {
    loadCharts()
    loadIndicators()
  }, [])

  const loadCharts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/charts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCharts(data.charts || [])
      }
    } catch (error) {
      console.error('Failed to load charts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadIndicators = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/indicators', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIndicators(data.indicators || [])
      }
    } catch (error) {
      console.error('Failed to load indicators:', error)
    }
  }

  const handleCreateChart = () => {
    setSelectedChart(null)
    setShowCreateModal(true)
  }

  const handleEditChart = (chart: Chart) => {
    setSelectedChart(chart)
    setShowEditModal(true)
  }

  const handleViewChart = (chart: Chart) => {
    if (!chart) {
      console.error('Cannot view chart: chart is null or undefined')
      return
    }
    setSelectedChart(chart)
    setShowViewModal(true)
  }

  const handlePreviewChart = (chart: Chart) => {
    if (!chart) {
      console.error('Cannot preview chart: chart is null or undefined')
      return
    }
    setSelectedChart(chart)
    setShowPreviewModal(true)
  }

  const handleDeleteChart = async (chartId: string) => {
    if (!confirm('Are you sure you want to delete this chart?')) return

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token')
      await api(`/api/admin/charts/${chartId}`, 'DELETE', undefined, token)
      await loadCharts()
      onChartChange?.()
    } catch (error) {
      console.error('Failed to delete chart:', error)
    }
  }

  const toggleChartStatus = async (chartId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token')
      await api(`/api/admin/charts/${chartId}/toggle`, 'PATCH', { isActive: !currentStatus }, token)
      await loadCharts()
      onChartChange?.()
    } catch (error) {
      console.error('Failed to toggle chart status:', error)
    }
  }

  const getChartTypeIcon = (type: string) => {
    switch (type) {
      case 'FREE':
        return <ChartBarIcon className="w-5 h-5 text-green-500" />
      case 'ADVANCED_LIBRARY':
        return <CpuChipIcon className="w-5 h-5 text-blue-500" />
      case 'ADVANCED_CHART':
        return <SparklesIcon className="w-5 h-5 text-purple-500" />
      default:
        return <ChartBarIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getChartTypeLabel = (type: string) => {
    switch (type) {
      case 'FREE':
        return 'Free Chart'
      case 'ADVANCED_LIBRARY':
        return 'Advanced TradingView Library'
      case 'ADVANCED_CHART':
        return 'Advanced TradingView Chart'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Chart Manager</h2>
          <p className="text-gray-400">Manage TradingView charts for the scanner page</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
            title="Help"
          >
            <QuestionMarkCircleIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleCreateChart}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Chart</span>
          </button>
        </div>
      </div>

      {/* Help Section */}
      {showHelp && (
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">Chart Manager Help</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-300">
            <div>
              <h4 className="font-medium mb-2">Free Chart</h4>
              <p>Basic TradingView widget with limited features. Perfect for simple chart display.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Advanced Library</h4>
              <p>Full TradingView library with advanced features like custom indicators and drawing tools.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Advanced Chart</h4>
              <p>Premium TradingView chart with all features including news, alerts, and custom data sources.</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charts.map((chart) => (
          <div key={chart.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getChartTypeIcon(chart.type)}
                <div>
                  <h3 className="text-lg font-semibold text-white">{chart.displayName}</h3>
                  <p className="text-sm text-gray-400">{chart.symbol}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                chart.isActive 
                  ? 'bg-green-400/10 text-green-400' 
                  : 'bg-red-400/10 text-red-400'
              }`}>
                {chart.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">{chart.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Type:</span>
                <span className="text-white">{getChartTypeLabel(chart.type)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Interval:</span>
                <span className="text-white">{chart.interval}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Theme:</span>
                <span className="text-white capitalize">{chart.theme}</span>
              </div>
            </div>

            {/* Features */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Features:</h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(chart.features).map(([key, enabled]) => (
                  <span
                    key={key}
                    className={`px-2 py-1 text-xs rounded ${
                      enabled 
                        ? 'bg-green-400/10 text-green-400' 
                        : 'bg-gray-700 text-gray-500'
                    }`}
                  >
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => handleViewChart(chart)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm transition-colors flex items-center justify-center space-x-1"
              >
                <EyeIcon className="w-4 h-4" />
                <span>View</span>
              </button>
              <button 
                onClick={() => handlePreviewChart(chart)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm transition-colors flex items-center justify-center space-x-1"
              >
                <ChartBarIcon className="w-4 h-4" />
                <span>Preview</span>
              </button>
              <button 
                onClick={() => handleEditChart(chart)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors flex items-center justify-center space-x-1"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button 
                onClick={() => toggleChartStatus(chart.id, chart.isActive)}
                className={`py-2 px-3 rounded text-sm transition-colors flex items-center justify-center space-x-1 ${
                  chart.isActive
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {chart.isActive ? <StopIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => handleDeleteChart(chart.id)}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {charts.length === 0 && (
        <div className="text-center py-12">
          <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No charts created</h3>
          <p className="text-gray-400 mb-4">Create your first chart to get started with the scanner page</p>
          <button
            onClick={handleCreateChart}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create Chart
          </button>
        </div>
      )}

      {/* Create/Edit Chart Modal */}
      {(showCreateModal || showEditModal) && (
        <CreateEditChartModal
          chart={selectedChart}
          indicators={indicators}
          onClose={() => {
            setShowCreateModal(false)
            setShowEditModal(false)
            setSelectedChart(null)
          }}
          onSuccess={() => {
            setShowCreateModal(false)
            setShowEditModal(false)
            setSelectedChart(null)
            loadCharts()
            onChartChange?.()
          }}
        />
      )}

      {/* View Chart Modal */}
      {showViewModal && selectedChart && (
        <ViewChartModal
          chart={selectedChart}
          onClose={() => {
            setShowViewModal(false)
            setSelectedChart(null)
          }}
        />
      )}

      {/* Preview Chart Modal */}
      {showPreviewModal && selectedChart && (
        <PreviewChartModal
          chart={selectedChart}
          onClose={() => {
            setShowPreviewModal(false)
            setSelectedChart(null)
          }}
        />
      )}
    </div>
  )
}

// Create/Edit Chart Modal Component
interface CreateEditChartModalProps {
  chart?: Chart | null
  indicators: Indicator[]
  onClose: () => void
  onSuccess: () => void
}

const CreateEditChartModal: React.FC<CreateEditChartModalProps> = ({ chart, indicators, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: chart?.name || '',
    displayName: chart?.displayName || '',
    description: chart?.description || '',
    type: chart?.type || 'FREE',
    symbol: chart?.symbol || 'FX:EURUSD',
    interval: chart?.interval || '1D',
    theme: chart?.theme || 'dark',
    isActive: chart?.isActive ?? true,
    features: chart?.features || {
      timeframes: true,
      indicators: true,
      drawingTools: false,
      alerts: false,
      news: false,
      volume: true,
      fullscreen: true
    },
    dataSource: chart?.dataSource || {
      type: 'tradingview',
      apiKey: '',
      endpoint: ''
    },
    selectedIndicators: chart?.selectedIndicators || []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const chartTypes = [
    { value: 'FREE', label: 'Free Chart', description: 'Basic TradingView widget' },
    { value: 'ADVANCED_LIBRARY', label: 'Advanced TradingView Library', description: 'Full library with advanced features' },
    { value: 'ADVANCED_CHART', label: 'Advanced TradingView Chart', description: 'Premium chart with all features' }
  ]

  const intervals = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token')

      const url = chart ? `/api/admin/charts/${chart.id}` : '/api/admin/charts'
      const method = chart ? 'PUT' : 'POST'

      // Debug: Log the data being sent
      console.log('Submitting chart data:', formData)
      console.log('Selected indicators:', formData.selectedIndicators)

      const response = await api(url, method, formData, token)
      console.log('Chart saved successfully:', response)
      onSuccess()
    } catch (err: any) {
      console.error('Chart save error:', err)
      
      // Show detailed validation errors if available
      if (err.response && err.response.errors) {
        const errorMessages = Object.entries(err.response.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n')
        setError(`Validation failed:\n${errorMessages}`)
      } else {
        setError(err.message || 'Failed to save chart')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFeatureChange = (feature: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: value
      }
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {chart ? 'Edit Chart' : 'Create New Chart'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Chart Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                    placeholder="e.g., main_forex_chart"
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
                    placeholder="e.g., Main Forex Chart"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                    placeholder="Brief description of this chart"
                    rows={3}
                  />
                </div>
              </div>

              {/* Chart Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Chart Configuration</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Chart Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                    required
                  >
                    {chartTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Symbol *</label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                    placeholder="e.g., FX:EURUSD, BINANCE:BTCUSDT"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Default Interval</label>
                  <select
                    value={formData.interval}
                    onChange={(e) => setFormData({...formData, interval: e.target.value})}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  >
                    {intervals.map((interval) => (
                      <option key={interval.value} value={interval.value}>
                        {interval.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                  <select
                    value={formData.theme}
                    onChange={(e) => setFormData({...formData, theme: e.target.value as any})}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Features Configuration */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Features Configuration</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(formData.features).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleFeatureChange(key, e.target.checked)}
                      className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Indicators Configuration */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Custom Indicators</h3>
              <p className="text-sm text-gray-400 mb-4">
                Select custom indicators to inject into this chart. These indicators will be automatically applied when the chart loads.
              </p>
              
              <div className="space-y-4">
                {/* Indicator Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                  {indicators.filter(indicator => indicator.isActive).map((indicator) => (
                    <label key={indicator.id} className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selectedIndicators.includes(indicator.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              selectedIndicators: [...prev.selectedIndicators, indicator.id]
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              selectedIndicators: prev.selectedIndicators.filter(id => id !== indicator.id)
                            }))
                          }
                        }}
                        className="mt-1 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-white truncate">
                            {indicator.displayName}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            indicator.subscriptionTier === 'FREE' ? 'bg-green-500/20 text-green-400' :
                            indicator.subscriptionTier === 'PRO' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>
                            {indicator.subscriptionTier}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {indicator.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            indicator.type === 'BUILT_IN' ? 'bg-gray-500/20 text-gray-400' :
                            indicator.type === 'JS_SCRIPT' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            {indicator.type}
                          </span>
                          {indicator.isPremium && (
                            <span className="px-2 py-1 text-xs rounded bg-yellow-500/20 text-yellow-400">
                              PREMIUM
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                
                {indicators.filter(indicator => indicator.isActive).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <ChartBarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No active indicators found</p>
                    <p className="text-xs mt-1">Create indicators in the Indicator Manager first</p>
                  </div>
                )}
                
                {formData.selectedIndicators.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-300 mb-2">Selected Indicators ({formData.selectedIndicators.length})</h4>
                    <div className="space-y-2">
                      {formData.selectedIndicators.map(indicatorId => {
                        const indicator = indicators.find(ind => ind.id === indicatorId)
                        return indicator ? (
                          <div key={indicatorId} className="flex items-center justify-between text-sm">
                            <span className="text-white">{indicator.displayName}</span>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                selectedIndicators: prev.selectedIndicators.filter(id => id !== indicatorId)
                              }))}
                              className="text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Data Source Configuration */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Data Source Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Data Source Type</label>
                  <select
                    value={formData.dataSource.type}
                    onChange={(e) => setFormData({
                      ...formData, 
                      dataSource: {...formData.dataSource, type: e.target.value as any}
                    })}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  >
                    <option value="tradingview">TradingView (Default)</option>
                    <option value="custom">Custom API</option>
                  </select>
                </div>

                {formData.dataSource.type === 'custom' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                      <input
                        type="password"
                        value={formData.dataSource.apiKey || ''}
                        onChange={(e) => setFormData({
                          ...formData, 
                          dataSource: {...formData.dataSource, apiKey: e.target.value}
                        })}
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                        placeholder="Your API key"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">API Endpoint</label>
                      <input
                        type="url"
                        value={formData.dataSource.endpoint || ''}
                        onChange={(e) => setFormData({
                          ...formData, 
                          dataSource: {...formData.dataSource, endpoint: e.target.value}
                        })}
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                        placeholder="https://api.example.com/data"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="border-t border-gray-700 pt-6">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-300">Active Chart</span>
              </label>
            </div>

            {/* Submit Buttons */}
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
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Saving...' : (chart ? 'Update Chart' : 'Create Chart')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// View Chart Modal Component
interface ViewChartModalProps {
  chart: Chart | null
  onClose: () => void
}

const ViewChartModal: React.FC<ViewChartModalProps> = ({ chart, onClose }) => {
  // Safety check - if chart is undefined or null, don't render the modal
  if (!chart) {
    return null
  }

  // Additional safety checks for chart properties
  const chartName = chart.name || 'N/A'
  const chartDisplayName = chart.displayName || 'N/A'
  const chartDescription = chart.description || 'No description available'
  const chartType = chart.type || 'UNKNOWN'
  const chartSymbol = chart.symbol || 'N/A'
  const chartInterval = chart.interval || 'N/A'
  const chartTheme = chart.theme || 'dark'
  const chartIsActive = chart.isActive ?? false
  const chartFeatures = chart.features || {}
  const chartDataSource = chart.dataSource || { type: 'tradingview' }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Chart Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Chart Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2">
                  {chartName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2">
                  {chartDisplayName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 min-h-[60px]">
                  {chartDescription}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2">
                  {(() => {
                    switch (chartType) {
                      case 'FREE':
                        return 'Free Chart'
                      case 'ADVANCED_LIBRARY':
                        return 'Advanced TradingView Library'
                      case 'ADVANCED_CHART':
                        return 'Advanced TradingView Chart'
                      default:
                        return chartType
                    }
                  })()}
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Configuration</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label>
                <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2">
                  {chartSymbol}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Interval</label>
                <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2">
                  {chartInterval}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 capitalize">
                  {chartTheme}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    chartIsActive 
                      ? 'bg-green-400/10 text-green-400' 
                      : 'bg-red-400/10 text-red-400'
                  }`}>
                    {chartIsActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="border-t border-gray-700 pt-6 mt-6">
            <h3 className="text-lg font-medium text-white mb-4">Enabled Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(chartFeatures).map(([key, enabled]) => (
                <div key={key} className="flex items-center space-x-3">
                  {enabled ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-gray-500" />
                  )}
                  <span className={`text-sm ${enabled ? 'text-white' : 'text-gray-500'}`}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Source */}
          <div className="border-t border-gray-700 pt-6 mt-6">
            <h3 className="text-lg font-medium text-white mb-4">Data Source</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 capitalize">
                  {chartDataSource.type}
                </div>
              </div>
              {chartDataSource.endpoint && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Endpoint</label>
                  <div className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2">
                    {chartDataSource.endpoint}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-6 border-t border-gray-700 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview Chart Modal Component
interface PreviewChartModalProps {
  chart: Chart | null
  onClose: () => void
}

const PreviewChartModal: React.FC<PreviewChartModalProps> = ({ chart, onClose }) => {
  // Safety check - if chart is undefined or null, don't render the modal
  if (!chart) {
    return null
  }

  // Additional safety checks for chart properties
  const chartType = chart.type || 'FREE'
  const chartSymbol = chart.symbol || 'FX:EURUSD'
  const chartInterval = chart.interval || '1D'
  const chartTheme = chart.theme || 'dark'
  const chartFeatures = chart.features || {
    timeframes: true,
    indicators: true,
    drawingTools: false,
    alerts: false,
    news: false,
    volume: true,
    fullscreen: true
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Chart Preview</h2>
              <p className="text-gray-400 mt-1">
                {chart.displayName} - {chartSymbol} ({chartInterval})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 h-[calc(95vh-120px)]">
          <div className="bg-gray-800 rounded-lg h-full overflow-hidden">
            <TradingViewChartEmbed
              symbol={chartSymbol}
              interval={chartInterval}
              theme={chartTheme}
              features={chartFeatures}
              chartType={chartType}
              selectedIndicators={chart.selectedIndicators || []}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartManager 