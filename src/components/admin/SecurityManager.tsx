'use client'

import { useState, useEffect } from 'react'
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  ExclamationTriangleIcon,
  LockClosedIcon,
  EyeIcon,
  TrashIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  scopes: string[]
  rateLimit: number
  dailyLimit: number
  usageCount: number
  lastUsedAt?: string
  lastUsedIp?: string
  allowedIps?: string[]
  status: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
  userProfile: {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
    }
  }
}

interface SecurityStats {
  totalApiKeys: number
  activeApiKeys: number
  suspendedApiKeys: number
  totalUsers: number
  usersWithTwoFA: number
  recentSecurityEvents: number
  averageSessionDuration: number
}

interface SecurityEvent {
  id: string
  action: string
  resource?: string
  userId?: string
  ipAddress?: string
  userAgent?: string
  success: boolean
  createdAt: string
  metadata?: any
}

export default function SecurityManager() {
  const [stats, setStats] = useState<SecurityStats>({
    totalApiKeys: 0,
    activeApiKeys: 0,
    suspendedApiKeys: 0,
    totalUsers: 0,
    usersWithTwoFA: 0,
    recentSecurityEvents: 0,
    averageSessionDuration: 0
  })
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const [statsResponse, eventsResponse] = await Promise.all([
        fetch('/api/admin/security/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/security/events', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setSecurityEvents(eventsData.events || [])
      }
    } catch (err) {
      setError('Failed to fetch security data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchApiKeys = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/security/api-keys', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setApiKeys(data)
      }
    } catch (err) {
      setError('Failed to fetch API keys')
    }
  }

  const suspendApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to suspend this API key?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/security/api-keys/${keyId}/suspend`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        fetchApiKeys()
        fetchSecurityData()
      } else {
        setError('Failed to suspend API key')
      }
    } catch (error) {
      setError('Error suspending API key')
    }
  }

  const revokeApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to permanently revoke this API key? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/security/api-keys/${keyId}/revoke`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        fetchApiKeys()
        fetchSecurityData()
      } else {
        setError('Failed to revoke API key')
      }
    } catch (error) {
      setError('Error revoking API key')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/10 text-green-400'
      case 'SUSPENDED':
        return 'bg-yellow-500/10 text-yellow-400'
      case 'REVOKED':
        return 'bg-red-500/10 text-red-400'
      case 'EXPIRED':
        return 'bg-gray-500/10 text-gray-400'
      default:
        return 'bg-gray-500/10 text-gray-400'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return '🔐'
      case 'LOGOUT':
        return '🚪'
      case 'API_CALL':
        return '🔑'
      case 'SECURITY_VIOLATION':
        return '⚠️'
      case 'PAYMENT':
        return '💳'
      default:
        return '📝'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const filteredApiKeys = apiKeys.filter(key => 
    key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.userProfile.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredEvents = securityEvents.filter(event =>
    event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.ipAddress && event.ipAddress.includes(searchTerm))
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading security data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Security Management</h2>
        <p className="text-gray-400">Monitor and manage platform security</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center">
            <div className="bg-blue-600 p-3 rounded-lg mr-4">
              <KeyIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.activeApiKeys}</div>
              <div className="text-gray-400">Active API Keys</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center">
            <div className="bg-green-600 p-3 rounded-lg mr-4">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.usersWithTwoFA}</div>
              <div className="text-gray-400">Users with 2FA</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center">
            <div className="bg-yellow-600 p-3 rounded-lg mr-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.suspendedApiKeys}</div>
              <div className="text-gray-400">Suspended Keys</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center">
            <div className="bg-purple-600 p-3 rounded-lg mr-4">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.recentSecurityEvents}</div>
              <div className="text-gray-400">Recent Events</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'api-keys', label: 'API Keys' },
            { id: 'events', label: 'Security Events' },
            { id: 'settings', label: 'Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                if (tab.id === 'api-keys') fetchApiKeys()
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Search */}
      {(activeTab === 'api-keys' || activeTab === 'events') && (
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab === 'api-keys' ? 'API keys' : 'security events'}...`}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-2.5">
            <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Two-Factor Authentication Status */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Users:</span>
                <span className="text-white">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">With 2FA:</span>
                <span className="text-green-400">{stats.usersWithTwoFA}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Adoption Rate:</span>
                <span className="text-white">
                  {stats.totalUsers > 0 ? ((stats.usersWithTwoFA / stats.totalUsers) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            <div className="mt-4 bg-gray-800 rounded-lg h-2">
              <div 
                className="bg-green-500 h-2 rounded-lg"
                style={{ 
                  width: `${stats.totalUsers > 0 ? (stats.usersWithTwoFA / stats.totalUsers) * 100 : 0}%` 
                }}
              />
            </div>
          </div>

          {/* API Key Status */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">API Key Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Keys:</span>
                <span className="text-white">{stats.totalApiKeys}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active:</span>
                <span className="text-green-400">{stats.activeApiKeys}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Suspended:</span>
                <span className="text-yellow-400">{stats.suspendedApiKeys}</span>
              </div>
            </div>
          </div>

          {/* Recent Security Events */}
          <div className="bg-gray-900 rounded-xl p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Security Events</h3>
            <div className="space-y-2">
              {securityEvents.slice(0, 5).map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">{getActionIcon(event.action)}</div>
                    <div>
                      <div className="text-white font-medium">{event.action}</div>
                      <div className="text-gray-400 text-sm">
                        {event.ipAddress} • {formatDate(event.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    event.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {event.success ? 'Success' : 'Failed'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Key Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-700">
                {filteredApiKeys.map((key) => (
                  <tr key={key.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-white font-medium">{key.name}</div>
                        <div className="text-gray-400 text-sm font-mono">{key.keyPrefix}...</div>
                        <div className="text-gray-400 text-xs">
                          {key.scopes.slice(0, 2).join(', ')}
                          {key.scopes.length > 2 && ` +${key.scopes.length - 2} more`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-white">
                          {key.userProfile.user.firstName} {key.userProfile.user.lastName}
                        </div>
                        <div className="text-gray-400 text-sm">{key.userProfile.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-white">{key.usageCount.toLocaleString()}</div>
                        <div className="text-gray-400 text-sm">
                          Limit: {key.dailyLimit.toLocaleString()}/day
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(key.status)}`}>
                        {key.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {key.lastUsedAt && (
                          <>
                            <div className="text-white text-sm">
                              {formatDate(key.lastUsedAt)}
                            </div>
                            <div className="text-gray-400 text-xs">{key.lastUsedIp}</div>
                          </>
                        )}
                        {!key.lastUsedAt && (
                          <div className="text-gray-400 text-sm">Never used</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => suspendApiKey(key.id)}
                          className="text-yellow-400 hover:text-yellow-300"
                          title="Suspend"
                        >
                          <LockClosedIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => revokeApiKey(key.id)}
                          className="text-red-400 hover:text-red-300"
                          title="Revoke"
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

          {filteredApiKeys.length === 0 && (
            <div className="text-center py-12">
              <KeyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No API keys found</p>
            </div>
          )}
        </div>
      )}

      {/* Security Events Tab */}
      {activeTab === 'events' && (
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-700">
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">{getActionIcon(event.action)}</div>
                        <div>
                          <div className="text-white font-medium">{event.action}</div>
                          {event.resource && (
                            <div className="text-gray-400 text-sm">{event.resource}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{event.userId || 'System'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-mono">{event.ipAddress}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {event.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white text-sm">{formatDate(event.createdAt)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No security events found</p>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rate Limiting Settings */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Rate Limiting</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Requests per minute
                </label>
                <input
                  type="number"
                  defaultValue={100}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Auth attempts per 15 minutes
                </label>
                <input
                  type="number"
                  defaultValue={5}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Security Policies */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Security Policies</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-3" />
                <span className="text-gray-300">Require 2FA for admin accounts</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-3" />
                <span className="text-gray-300">Lock accounts after failed attempts</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-3" />
                <span className="text-gray-300">Log all security events</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span className="text-gray-300">Require device verification</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 