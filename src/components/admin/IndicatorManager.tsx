'use client'

import React, { useState, useEffect } from 'react'
import { 
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
        // Add null checks for data.settings
        if (data && data.settings && Array.isArray(data.settings)) {
          const twelveDataSetting = data.settings.find((s: any) => s.name === 'twelve_data_api_key')
          setApiSettings({
            twelveDataApiKey: twelveDataSetting?.value || '',
            isConnected: !!twelveDataSetting?.value
          })
        } else {
          // Set default values if settings are not available
          setApiSettings({
            twelveDataApiKey: '',
            isConnected: false
          })
        }
      }
    } catch (error) {
      console.error('Failed to load API settings:', error)
      // Set default values on error
      setApiSettings({
        twelveDataApiKey: '',
        isConnected: false
      })
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
              <h2 className="text-xl font-semibold text-white">Custom Indicators Management Guide</h2>
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
            {/* Overview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2 text-blue-400" />
                Custom Indicators Overview
              </h3>
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">JavaScript-Based Indicators</h4>
                    <p className="text-gray-300 text-sm">
                      Create custom technical indicators using JavaScript. Your indicators will run in real-time on the Advanced TradingView Chart Library.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Real-Time Execution</h4>
                    <p className="text-gray-300 text-sm">
                      Custom indicators are executed server-side with live market data and rendered instantly on user charts.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Subscription Integration</h4>
                    <p className="text-gray-300 text-sm">
                      Control access to premium indicators through subscription tiers (FREE, PRO, VIP).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <CogIcon className="w-5 h-5 mr-2 text-green-400" />
                Technical Features
              </h3>
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Built-in Functions</h4>
                    <p className="text-gray-300 text-sm">
                      Access to SMA, EMA, RSI, ATR, and other technical analysis functions in your custom indicators.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Parameter Support</h4>
                    <p className="text-gray-300 text-sm">
                      Create configurable indicators with adjustable parameters that users can modify.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Real-Time Data</h4>
                    <p className="text-gray-300 text-sm">
                      Indicators receive live OHLC data and calculate values in real-time for accurate analysis.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Chart Integration</h4>
                    <p className="text-gray-300 text-sm">
                      Seamless integration with both TradingView embedded charts and Advanced TradingView Chart Library.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow Guide */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <PlayIcon className="w-5 h-5 mr-2 text-yellow-400" />
                Workflow Guide
              </h3>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-white">For Administrators:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                      <li>Configure API settings for real-time data access</li>
                      <li>Create subscription plans in "Plans Management"</li>
                      <li>Upload custom JavaScript indicators using "Upload JavaScript Indicator"</li>
                      <li>Set appropriate subscription tiers for each indicator</li>
                      <li>Test indicators using the provided templates</li>
                      <li>Activate indicators for user access</li>
                      <li>Configure chart integration in "Integrate Chart" module</li>
                    </ol>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-white">For Users:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                      <li>Navigate to the Scanners page to access charts</li>
                      <li>Select indicators based on your subscription tier</li>
                      <li>Add custom indicators to your chart for real-time analysis</li>
                      <li>Adjust indicator parameters as needed</li>
                      <li>Save chart templates for future use</li>
                      <li>Switch between TradingView and Advanced charts</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Examples */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <CodeBracketIcon className="w-5 h-5 mr-2 text-purple-400" />
                Quick Code Examples
              </h3>
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Basic Structure</h4>
                    <p className="text-gray-300 text-sm">
                      All custom indicators must include a <code className="bg-gray-600 px-1 rounded">calculateIndicator(candles, parameters)</code> function.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Available Data</h4>
                    <p className="text-gray-300 text-sm">
                      Access <code className="bg-gray-600 px-1 rounded">candles[i].open</code>, <code className="bg-gray-600 px-1 rounded">candles[i].high</code>, <code className="bg-gray-600 px-1 rounded">candles[i].low</code>, <code className="bg-gray-600 px-1 rounded">candles[i].close</code>, <code className="bg-gray-600 px-1 rounded">candles[i].volume</code>, <code className="bg-gray-600 px-1 rounded">candles[i].timestamp</code>
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Return Format</h4>
                    <p className="text-gray-300 text-sm">
                      Return array of objects: <code className="bg-gray-600 px-1 rounded">{'{ datetime: timestamp, value: number }'}</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Integration Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2 text-teal-400" />
                Chart Integration
              </h3>
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">TradingView Embedded Charts</h4>
                    <p className="text-gray-300 text-sm">
                      Use the "Integrate Chart" module to configure TradingView embedded charts with your custom indicators.
                    </p>
                  </div>
                  </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Advanced TradingView Chart Library</h4>
                    <p className="text-gray-300 text-sm">
                      Custom indicators automatically render on the Advanced TradingView Chart Library for enhanced performance.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-white">Dashboard Integration</h4>
                    <p className="text-gray-300 text-sm">
                      Charts configured in admin panel automatically appear on the dashboard scanner page for users.
                    </p>
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
                Upload JavaScript Indicator
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
            
            {/* Help Section */}
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <h4 className="text-white font-medium mb-2">How to Write Custom Indicators</h4>
              <p className="text-gray-300 text-sm mb-3">
                Your JavaScript code must include a <code className="bg-gray-600 px-1 rounded">calculateIndicator</code> function that returns an array of values.
              </p>
              
              <details className="text-sm">
                <summary className="text-blue-400 cursor-pointer hover:text-blue-300">View Sample Code Templates</summary>
                <div className="mt-3 space-y-4">
                  
                  {/* Simple Moving Average Template */}
                  <div className="bg-gray-600 p-3 rounded">
                    <h5 className="text-yellow-400 font-medium mb-2">Simple Moving Average Template:</h5>
                    <pre className="text-xs text-green-200 overflow-x-auto">
{`function calculateIndicator(candles, parameters) {
  const period = parameters.period || 20;
  const closes = candles.map(c => c.close);
  const result = [];
  
  for (let i = period - 1; i < closes.length; i++) {
    const sum = closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    const sma = sum / period;
    result.push({
      datetime: candles[i].timestamp,
      value: sma
    });
  }
  
  return result;
}`}
                    </pre>
                  </div>

                  {/* RSI Template */}
                  <div className="bg-gray-600 p-3 rounded">
                    <h5 className="text-yellow-400 font-medium mb-2">RSI Template:</h5>
                    <pre className="text-xs text-green-200 overflow-x-auto">
{`function calculateIndicator(candles, parameters) {
  const period = parameters.period || 14;
  const closes = candles.map(c => c.close);
  const result = [];
  
  for (let i = period; i < closes.length; i++) {
    let gains = 0, losses = 0;
    
    for (let j = i - period + 1; j <= i; j++) {
      const change = closes[j] - closes[j - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    result.push({
      datetime: candles[i].timestamp,
      value: rsi
    });
  }
  
  return result;
}`}
                    </pre>
      </div>

                  {/* Custom Strategy Template */}
                  <div className="bg-gray-600 p-3 rounded">
                    <h5 className="text-yellow-400 font-medium mb-2">Custom Strategy Template:</h5>
                    <pre className="text-xs text-green-200 overflow-x-auto">
{`function calculateIndicator(candles, parameters) {
  const fastPeriod = parameters.fastPeriod || 12;
  const slowPeriod = parameters.slowPeriod || 26;
  const closes = candles.map(c => c.close);
  const result = [];
  
  // Calculate fast and slow EMAs
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);
  
  for (let i = Math.max(fastPeriod, slowPeriod) - 1; i < closes.length; i++) {
    const fastIndex = i - fastPeriod + 1;
    const slowIndex = i - slowPeriod + 1;
    
    const signal = fastEMA[fastIndex] > slowEMA[slowIndex] ? 1 : 0;
    
    result.push({
      datetime: candles[i].timestamp,
      value: signal
    });
  }
  
  return result;
}

function calculateEMA(values, period) {
  const multiplier = 2 / (period + 1);
  const result = [];
  let ema = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result.push(ema);
  
  for (let i = period; i < values.length; i++) {
    ema = (values[i] * multiplier) + (ema * (1 - multiplier));
    result.push(ema);
  }
  
  return result;
}`}
                    </pre>
        </div>
        </div>
              </details>
      </div>

            <JavaScriptEditorModal onUpload={uploadJavaScript} onCancel={() => setShowJsEditor(false)} />
        </div>
        </div>
      )}
      </div>
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
      subscriptionTier
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