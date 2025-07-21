'use client'

import React, { useState, useEffect } from 'react'
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  EyeIcon,
  CodeBracketIcon,
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  StopIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

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
  price: number
  isActive: boolean
  rating: number
  reviewCount: number
  downloads: number
  validationResult?: any
}

interface IndicatorManagerProps {
  onIndicatorChange?: (indicators: Indicator[]) => void
}

const IndicatorManager: React.FC<IndicatorManagerProps> = ({ onIndicatorChange }) => {
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null)
  const [showPineEditor, setShowPineEditor] = useState(false)
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [plans, setPlans] = useState<any[]>([])
  const [apiSettings, setApiSettings] = useState({
    twelveDataApiKey: '',
    isConnected: false
  })
  // Add state for JS upload modal
  const [showJsEditor, setShowJsEditor] = useState(false);

  // Load indicators
  useEffect(() => {
    loadIndicators()
    loadApiSettings()
    loadPlans()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  const loadPlans = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans || [])
      }
    } catch (error) {
      console.error('Failed to load plans:', error)
    }
  }

  const loadApiSettings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/api-settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const twelveDataSetting = data.settings.find((s: any) => s.name === 'twelve_data_api_key')
        setApiSettings({
          twelveDataApiKey: twelveDataSetting?.value || '',
          isConnected: !!twelveDataSetting?.value
        })
      }
    } catch (error) {
      console.error('Failed to load API settings:', error)
    }
  }

  const createIndicator = async (indicatorData: Partial<Indicator>) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/indicators', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(indicatorData)
      })

      if (response.ok) {
        await loadIndicators()
        setShowCreateModal(false)
        setEditingIndicator(null)
      }
    } catch (error) {
      console.error('Failed to create indicator:', error)
    }
  }

  const updateIndicator = async (id: string, indicatorData: Partial<Indicator>) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/indicators/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(indicatorData)
      })

      if (response.ok) {
        await loadIndicators()
        setEditingIndicator(null)
      }
    } catch (error) {
      console.error('Failed to update indicator:', error)
    }
  }

  const deleteIndicator = async (id: string) => {
    if (!confirm('Are you sure you want to delete this indicator?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/indicators/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await loadIndicators()
      }
    } catch (error) {
      console.error('Failed to delete indicator:', error)
    }
  }

  const uploadPineScript = async (pineScriptData: any) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Authentication required. Please log in again.')
        return
      }

      console.log('Uploading Pine Script:', pineScriptData)

      const response = await fetch('/api/admin/indicators/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(pineScriptData)
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text()
        console.error('Non-JSON response:', textResponse)
        alert(`Server error: Received non-JSON response. Status: ${response.status}`)
        return
      }

      if (response.ok) {
        const data = await response.json()
        console.log('Pine Script uploaded successfully:', data)
        
        // Show success message
        alert(`Pine Script uploaded successfully!\n\nIndicator: ${pineScriptData.displayName}\nStudy ID: ${pineScriptData.name}\nValidation: ${data.validation?.isValid ? 'Valid' : 'Has warnings'}`)
        
        // Refresh indicators list
        await loadIndicators()
        
        // Close Pine Script editor
        setShowPineEditor(false)
        
        // Notify parent component if callback exists
        if (onIndicatorChange) {
          const updatedData = await fetch('/api/admin/indicators', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const updatedIndicators = await updatedData.json()
          onIndicatorChange(updatedIndicators.indicators || [])
        }
      } else {
        const errorData = await response.json()
        console.error('Upload failed:', errorData)
        alert(`Failed to upload Pine Script: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to upload Pine Script:', error)
      alert('Failed to upload Pine Script. Please check your connection and try again.')
    }
  }

  const uploadJavaScript = async (jsData: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }
      // Use backend URL from env or default
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/admin/indicators/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(jsData)
      });
      if (response.ok) {
        const data = await response.json();
        alert(`JavaScript indicator uploaded successfully!\n\nIndicator: ${jsData.displayName}\nStudy ID: ${jsData.name}`);
        await loadIndicators();
        setShowJsEditor(false);
        if (onIndicatorChange) {
          const updatedData = await fetch(`${backendUrl}/api/admin/indicators`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const updatedIndicators = await updatedData.json();
          onIndicatorChange(updatedIndicators.indicators || []);
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to upload JavaScript indicator: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Failed to upload JavaScript indicator. Please check your connection and try again.');
    }
  };

  const testTwelveDataConnection = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/forex/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: apiSettings.twelveDataApiKey
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message || 'Connection test completed')
      }
    } catch (error) {
      console.error('Failed to test connection:', error)
      alert('Connection test failed')
    }
  }

  const updateApiKey = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/api-settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'twelve_data_api_key',
          value: apiSettings.twelveDataApiKey,
          description: 'Twelve Data API Key for real-time forex data'
        })
      })

      if (response.ok) {
        setApiSettings(prev => ({ ...prev, isConnected: !!apiSettings.twelveDataApiKey }))
        alert('API key updated successfully')
      }
    } catch (error) {
      console.error('Failed to update API key:', error)
      alert('Failed to update API key')
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'MOMENTUM': 'bg-blue-100 text-blue-800',
      'TREND': 'bg-green-100 text-green-800',
      'VOLATILITY': 'bg-yellow-100 text-yellow-800',
      'VOLUME': 'bg-purple-100 text-purple-800',
      'CUSTOM': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'JS_SCRIPT':
        return <CodeBracketIcon className="w-4 h-4" />;
      case 'BUILT_IN':
        return <ChartBarIcon className="w-4 h-4" />;
      default:
        return <CogIcon className="w-4 h-4" />;
    }
  }

  const getPlanDisplayName = (tierName: string) => {
    const plan = plans.find(p => p.name === tierName)
    return plan ? plan.display_name || plan.name : tierName
  }

  const getPlanColor = (tierName: string) => {
    const plan = plans.find(p => p.name === tierName)
    if (!plan) return 'bg-gray-100 text-gray-800'
    
    // Use plan-specific colors or fallback to tier-based colors
    switch (plan.name.toLowerCase()) {
      case 'free':
        return 'bg-green-100 text-green-800'
      case 'pro':
        return 'bg-blue-100 text-blue-800'
      case 'vip':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading indicators...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Featured Scanners Auto-Generation Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ChartBarIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Featured Scanners Auto-Generation
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                <strong>Good news!</strong> Featured scanners are automatically generated from your active indicators. 
                When you add, update, or remove indicators here, the featured scanners on the subscriber dashboard 
                will automatically update to reflect those changes.
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Each active indicator creates its own scanner</li>
                <li>Combination scanners are automatically created for related indicators</li>
                <li>Deactivating an indicator removes it from featured scanners</li>
                <li>No manual management required!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* API Settings Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twelve Data API Key
            </label>
            <input
              type="password"
              value={apiSettings.twelveDataApiKey}
              onChange={(e) => setApiSettings({...apiSettings, twelveDataApiKey: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your API key"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={updateApiKey}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Update Key
            </button>
            <button
              onClick={testTwelveDataConnection}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Test Connection
            </button>
          </div>
        </div>
      </div>

      {/* Help Tutorial Section */}
      <div className="bg-gray-800 rounded-lg shadow">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-full p-6 text-left border-b border-gray-700 hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <QuestionMarkCircleIcon className="w-6 h-6 text-blue-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">How Indicators Management Works</h2>
            </div>
            {showHelp ? (
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>
        
        {showHelp && (
          <div className="p-6 space-y-6">
            {/* TradingView Integration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2 text-blue-400" />
                TradingView Account Integration
              </h3>
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Indicator Sources</h4>
                    <p className="text-gray-300 text-sm">
                      Import indicators from your TradingView account, including built-in indicators, custom Pine Scripts, and community indicators.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Pine Script Support</h4>
                    <p className="text-gray-300 text-sm">
                      Upload and validate custom Pine Script indicators. The system automatically validates syntax and provides error feedback.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Real-time Data</h4>
                    <p className="text-gray-300 text-sm">
                      Connect to Twelve Data API for real-time forex data that powers your indicators and charts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* LightweightChart Integration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <CogIcon className="w-5 h-5 mr-2 text-green-400" />
                LightweightChart Integration
              </h3>
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Chart Rendering</h4>
                    <p className="text-gray-300 text-sm">
                      Indicators are automatically rendered on the LightweightChart component using TradingView's lightweight charts library.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Dynamic Loading</h4>
                    <p className="text-gray-300 text-sm">
                      Users can add/remove indicators dynamically from the chart interface. Built-in indicators are calculated server-side, while Pine Scripts are executed in real-time.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Performance Optimization</h4>
                    <p className="text-gray-300 text-sm">
                      Indicators are cached and optimized for smooth real-time updates. Multiple indicators can run simultaneously without performance degradation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Integration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2 text-purple-400" />
                Subscription Plans Integration
              </h3>
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Tier-based Access</h4>
                    <p className="text-gray-300 text-sm">
                      Indicators are categorized by subscription tiers that you create in the "Plans Management" module. Users can only access indicators matching their current subscription level.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Plan Management</h4>
                    <p className="text-gray-300 text-sm">
                      Create and manage subscription plans in the "Plans Management" module. Premium indicators are automatically unlocked when users upgrade their subscription.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Revenue Generation</h4>
                    <p className="text-gray-300 text-sm">
                      Premium indicators can be monetized. Set pricing for individual indicators or create indicator bundles that align with your custom subscription plans.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow Guide */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <PlayIcon className="w-5 h-5 mr-2 text-yellow-400" />
                Quick Start Guide
              </h3>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-white">For Administrators:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                      <li>Configure Twelve Data API key in the settings above</li>
                      <li>Create subscription plans in the "Plans Management" module</li>
                      <li>Upload or create indicators using the "Add Indicator" button</li>
                      <li>Set appropriate subscription tiers for each indicator</li>
                      <li>Test indicators using the Pine Script editor</li>
                      <li>Activate indicators for user access</li>
                    </ol>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-white">For Users:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                      <li>Navigate to the Scanners page to access charts</li>
                      <li>Select indicators based on your subscription tier</li>
                      <li>Add indicators to your chart for real-time analysis</li>
                      <li>Customize indicator parameters as needed</li>
                      <li>Save chart templates for future use</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Indicators Management */}
      <div className="bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Indicators Management</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowJsEditor(true)}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                <CodeBracketIcon className="w-4 h-4 mr-2" />
                Upload JavaScript
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Indicator
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Indicator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {indicators.map((indicator) => (
                <tr key={indicator.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {indicator.displayName}
                      </div>
                      <div className="text-sm text-gray-400">
                        {indicator.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTypeIcon(indicator.type)}
                      <span className="ml-2 text-sm text-white">{indicator.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(indicator.category)}`}>
                      {indicator.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {indicator.isActive ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${indicator.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {indicator.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(indicator.subscriptionTier)}`}>
                      {getPlanDisplayName(indicator.subscriptionTier)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedIndicator(indicator)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingIndicator(indicator)}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteIndicator(indicator.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Indicator Modal */}
      {(showCreateModal || editingIndicator) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4 text-white">
              {editingIndicator ? 'Edit Indicator' : 'Create New Indicator'}
            </h3>
            <IndicatorForm
              indicator={editingIndicator}
              plans={plans}
              onSubmit={(data) => {
                if (editingIndicator) {
                  updateIndicator(editingIndicator.id, data)
                } else {
                  createIndicator(data)
                }
              }}
              onCancel={() => {
                setShowCreateModal(false)
                setEditingIndicator(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Indicator Details Modal */}
      {selectedIndicator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Indicator Details</h3>
              <button
                onClick={() => setSelectedIndicator(null)}
                className="text-gray-400 hover:text-gray-200"
              >
                ×
              </button>
            </div>
            <IndicatorDetails indicator={selectedIndicator} />
          </div>
        </div>
      )}

      {/* JavaScript Editor Modal */}
      {showJsEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Upload JavaScript Indicator</h3>
              <button
                onClick={() => setShowJsEditor(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                ×
              </button>
            </div>
            <JavaScriptEditorModal onUpload={uploadJavaScript} onCancel={() => setShowJsEditor(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

// Indicator Form Component
interface IndicatorFormProps {
  indicator?: Indicator | null
  plans: any[]
  onSubmit: (data: Partial<Indicator>) => void
  onCancel: () => void
}

const IndicatorForm: React.FC<IndicatorFormProps> = ({ indicator, plans, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: indicator?.name || '',
    displayName: indicator?.displayName || '',
    description: indicator?.description || '',
    category: indicator?.category || 'MOMENTUM',
    type: indicator?.type || 'BUILT_IN',
    subscriptionTier: indicator?.subscriptionTier || (plans.length > 0 ? plans[0].name : 'FREE'),
    price: indicator?.price || 0,
    isActive: indicator?.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
          >
            <option value="MOMENTUM">Momentum</option>
            <option value="TREND">Trend</option>
            <option value="VOLATILITY">Volatility</option>
            <option value="VOLUME">Volume</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
          >
            <option value="BUILT_IN">Built-in</option>
            <option value="JS_SCRIPT">JavaScript Script</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Subscription Tier</label>
          <select
            value={formData.subscriptionTier}
            onChange={(e) => setFormData(prev => ({ ...prev, subscriptionTier: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
          >
            {plans.map((plan) => (
              <option key={plan.id} value={plan.name}>
                {plan.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="mr-2"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
            Active
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {indicator ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

// Indicator Details Component
interface IndicatorDetailsProps {
  indicator: Indicator
}

const IndicatorDetails: React.FC<IndicatorDetailsProps> = ({ indicator }) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-white">{indicator.displayName}</h4>
        <p className="text-sm text-gray-400">{indicator.description}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-300">Name:</span>
          <span className="ml-2 text-white">{indicator.name}</span>
        </div>
        <div>
          <span className="font-medium text-gray-300">Type:</span>
          <span className="ml-2 text-white">{indicator.type}</span>
        </div>
        <div>
          <span className="font-medium text-gray-300">Category:</span>
          <span className="ml-2 text-white">{indicator.category}</span>
        </div>
        <div>
          <span className="font-medium text-gray-300">Version:</span>
          <span className="ml-2 text-white">{indicator.version}</span>
        </div>
        <div>
          <span className="font-medium text-gray-300">Subscription Tier:</span>
          <span className="ml-2 text-white">{indicator.subscriptionTier}</span>
        </div>
        <div>
          <span className="font-medium text-gray-300">Price:</span>
          <span className="ml-2 text-white">${indicator.price}</span>
        </div>
        <div>
          <span className="font-medium text-gray-300">Status:</span>
          <span className={`ml-2 ${indicator.isActive ? 'text-green-400' : 'text-red-400'}`}>
            {indicator.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div>
          <span className="font-medium text-gray-300">Downloads:</span>
          <span className="ml-2 text-white">{indicator.downloads}</span>
        </div>
      </div>
      {indicator.type === 'JS_SCRIPT' && indicator.jsCode && (
        <div>
          <h5 className="font-medium text-white mb-2">JavaScript Code</h5>
          <pre className="bg-gray-700 p-3 rounded text-xs overflow-x-auto text-yellow-200">
            <code>{indicator.jsCode}</code>
          </pre>
        </div>
      )}
      {indicator.validationResult && (
        <div>
          <h5 className="font-medium text-white mb-2">Validation Results</h5>
          <div className="bg-gray-700 p-3 rounded text-sm">
            {indicator.validationResult.errors?.length > 0 && (
              <div className="mb-2">
                <span className="font-medium text-red-400">Errors:</span>
                <ul className="text-red-400 ml-4">
                  {indicator.validationResult.errors.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// JavaScriptEditorModal component
const JavaScriptEditorModal = ({ onUpload, onCancel }: { onUpload: (data: any) => void, onCancel: () => void }) => {
  const [jsCode, setJsCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('CUSTOM');
  const [subscriptionTier, setSubscriptionTier] = useState('FREE');
  const [price, setPrice] = useState(0);

  const handleUpload = () => {
    if (!displayName || !jsCode) {
      alert('Display Name and JavaScript code are required.');
      return;
    }
    const uniqueName = `js_${Date.now()}_${displayName.replace(/\s+/g, '_').toLowerCase()}`;
    onUpload({
      name: uniqueName,
      displayName,
      description,
      category,
      jsCode,
      type: 'JS_SCRIPT',
      version: '1.0.0',
      changelog: 'Initial upload',
      tags: ['custom', 'js-script'],
      isPremium: false,
      subscriptionTier,
      price
    });
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
          rows={2}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
        >
          <option value="MOMENTUM">Momentum</option>
          <option value="TREND">Trend</option>
          <option value="VOLATILITY">Volatility</option>
          <option value="VOLUME">Volume</option>
          <option value="CUSTOM">Custom</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">JavaScript Code</label>
        <textarea
          value={jsCode}
          onChange={e => setJsCode(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-700 text-yellow-200 font-mono"
          rows={10}
          placeholder="Paste your JavaScript indicator code here..."
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">Subscription Tier</label>
        <select
          value={subscriptionTier}
          onChange={e => setSubscriptionTier(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
        >
          <option value="FREE">Free</option>
          <option value="PRO">Pro</option>
          <option value="VIP">VIP</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={e => setPrice(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleUpload}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
        >
          Upload
        </button>
      </div>
    </div>
  );
};

export default IndicatorManager 