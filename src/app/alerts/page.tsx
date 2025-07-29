'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BellIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import UserNavigation from '@/components/UserNavigation'
import CreateAlertModal from '@/components/CreateAlertModal'
import SignalHistoryModal from '@/components/SignalHistoryModal'
import SiteLogo from '@/components/SiteLogo'

interface Alert {
  id: string
  name: string
  description: string
  symbol: string
  exchange: string
  conditionType: string
  conditionValue: number
  status: string
  isRecurring: boolean
  triggerCount: number
  lastTriggered: string | null
  createdAt: string
  notifyEmail: boolean
  notifySms: boolean
  notifyTelegram: boolean
  notifyWebPush: boolean
  signals: Signal[]
}

interface Signal {
  id: string
  triggeredAt: string
  triggerValue: number
  marketPrice: number
  signalStrength: string
  confidence: number
  message: string
}

interface AlertStats {
  total: number
  active: number
  triggered: number
  paused: number
  totalTriggers: number
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [stats, setStats] = useState<AlertStats>({ total: 0, active: 0, triggered: 0, paused: 0, totalTriggers: 0 })
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [showSignalHistory, setShowSignalHistory] = useState(false)
  const [userInfo, setUserInfo] = useState<{
    firstName?: string
    lastName?: string
    email?: string
  } | undefined>(undefined)
  const [tutorialOpen, setTutorialOpen] = useState({
    what: false,
    howToUse: false,
    proTips: false
  })
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
    fetchAlerts()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUserInfo({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  useEffect(() => {
    const filtered = alerts.filter(alert => {
      const matchesSearch = alert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.conditionType.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilter = filterStatus === 'all' || alert.status.toLowerCase() === filterStatus.toLowerCase()
      
      return matchesSearch && matchesFilter
    })
    setFilteredAlerts(filtered)
  }, [searchTerm, filterStatus, alerts])

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      const response = await fetch('/api/user/alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts)
        setStats(data.stats)
      } else if (response.status === 403) {
        router.push('/')
      } else {
        setError('Failed to fetch alerts')
      }
    } catch (err) {
      setError('An error occurred while fetching alerts')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAlertStatus = async (alertId: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'

      const response = await fetch(`/api/user/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setAlerts(alerts.map(alert =>
          alert.id === alertId ? { ...alert, status: newStatus } : alert
        ))
      } else {
        setError('Failed to update alert status')
      }
    } catch (err) {
      setError('An error occurred while updating alert')
    }
  }

  const deleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/user/alerts/${alertId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setAlerts(alerts.filter(alert => alert.id !== alertId))
      } else {
        setError('Failed to delete alert')
      }
    } catch (err) {
      setError('An error occurred while deleting alert')
    }
  }

  const exportSignals = async (format: 'csv' | 'json') => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/user/signals/export?format=${format}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        if (format === 'csv') {
          const csv = await response.text()
          const blob = new Blob([csv], { type: 'text/csv' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `signal-history-${new Date().toISOString().split('T')[0]}.csv`
          a.click()
          window.URL.revokeObjectURL(url)
        } else {
          const data = await response.json()
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `signal-history-${new Date().toISOString().split('T')[0]}.json`
          a.click()
          window.URL.revokeObjectURL(url)
        }
      }
    } catch (err) {
      setError('Failed to export signal history')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />
      case 'PAUSED':
        return <PauseIcon className="w-5 h-5 text-yellow-400" />
      case 'TRIGGERED':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-400" />
      case 'EXPIRED':
        return <ClockIcon className="w-5 h-5 text-gray-400" />
      default:
        return <XCircleIcon className="w-5 h-5 text-red-400" />
    }
  }

  const getConditionDisplay = (conditionType: string, conditionValue: number) => {
    const formatted = conditionType.replace(/_/g, ' ').toLowerCase()
    if (conditionValue) {
      return `${formatted} (${conditionValue})`
    }
    return formatted
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading alerts...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <SiteLogo className="h-8 w-auto" fallbackText="FXCHUB" />
              <UserNavigation 
                userInfo={userInfo}
                onLogout={() => {
                  localStorage.removeItem('token')
                  router.push('/')
                }}
              />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create Alert</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center">
                            <BellIcon className="w-8 h-8 text-yellow-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">Signal Alerts</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Tutorial Accordion */}
        <div className="bg-gradient-to-r from-yellow-900/20 to-purple-900/20 border border-yellow-500/30 rounded-xl mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-yellow-600 p-3 rounded-lg">
                <BellIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Signal Alerts Tutorial</h2>
            </div>
            
            {/* Accordion Items */}
            <div className="space-y-3">
              {/* What are Signal Alerts */}
              <div className="bg-gray-800/30 rounded-lg border border-gray-700">
                <button
                  onClick={() => setTutorialOpen(prev => ({ ...prev, what: !prev.what }))}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-700/50 transition-colors rounded-lg"
                >
                  <span className="font-semibold text-yellow-400">What are Signal Alerts?</span>
                  <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${tutorialOpen.what ? 'rotate-180' : ''}`} />
                </button>
                {tutorialOpen.what && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-300 mb-4">
                      Signal Alerts are automated notifications that monitor forex pairs and trigger when specific market conditions are met. 
                      They help you stay informed about trading opportunities without constantly watching the markets.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-white mb-2">Key Features:</h4>
                        <ul className="text-gray-300 space-y-2 text-sm">
                          <li className="flex items-start space-x-2">
                            <span className="text-yellow-400 mt-1">•</span>
                            <span><strong>Multi-channel notifications:</strong> Email, SMS, Telegram, and Web Push</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-yellow-400 mt-1">•</span>
                            <span><strong>Real-time monitoring:</strong> 24/7 market surveillance across multiple exchanges</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-yellow-400 mt-1">•</span>
                            <span><strong>Customizable conditions:</strong> Set price levels, technical indicators, and market events</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-yellow-400 mt-1">•</span>
                            <span><strong>Recurring alerts:</strong> Alerts that reset and trigger multiple times</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-2">Alert Status Types:</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <CheckCircleIcon className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300"><strong>Active:</strong> Monitoring markets</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ExclamationTriangleIcon className="w-4 h-4 text-orange-400" />
                            <span className="text-gray-300"><strong>Triggered:</strong> Condition met</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <PauseIcon className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-300"><strong>Paused:</strong> Temporarily stopped</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300"><strong>Expired:</strong> Time limit reached</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* How to Use */}
              <div className="bg-gray-800/30 rounded-lg border border-gray-700">
                <button
                  onClick={() => setTutorialOpen(prev => ({ ...prev, howToUse: !prev.howToUse }))}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-700/50 transition-colors rounded-lg"
                >
                  <span className="font-semibold text-yellow-400">How to Use Signal Alerts</span>
                  <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${tutorialOpen.howToUse ? 'rotate-180' : ''}`} />
                </button>
                {tutorialOpen.howToUse && (
                  <div className="px-4 pb-4">
                    <div className="space-y-4">
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2 flex items-center">
                          <span className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
                          Create an Alert
                        </h4>
                        <p className="text-sm text-gray-300">Click the "Create Alert" button in the top-right corner to set up a new signal notification. You'll be guided through a step-by-step process to configure your alert.</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2 flex items-center">
                          <span className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
                          Configure Conditions
                        </h4>
                        <p className="text-sm text-gray-300">Choose your currency pair, set trigger conditions (price levels, technical indicators), select notification methods, and configure alert timing and recurrence settings.</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2 flex items-center">
                          <span className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
                          Monitor & Manage
                        </h4>
                        <p className="text-sm text-gray-300">Track your alert status in the table below, view signal history, export data for analysis, and manage your alerts (pause, edit, or delete as needed).</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pro Tips */}
              <div className="bg-gray-800/30 rounded-lg border border-gray-700">
                <button
                  onClick={() => setTutorialOpen(prev => ({ ...prev, proTips: !prev.proTips }))}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-700/50 transition-colors rounded-lg"
                >
                  <span className="font-semibold text-yellow-400">💡 Pro Tips & Best Practices</span>
                  <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${tutorialOpen.proTips ? 'rotate-180' : ''}`} />
                </button>
                {tutorialOpen.proTips && (
                  <div className="px-4 pb-4">
                    <div className="space-y-4">
                      <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-400 mb-2">Multiple Notification Channels</h4>
                        <p className="text-sm text-yellow-300">
                          Use multiple notification channels (Email + SMS + Telegram) to ensure you never miss important signals, especially during high-impact market events.
                        </p>
                      </div>
                      <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-400 mb-2">Combine Alert Types</h4>
                        <p className="text-sm text-yellow-300">
                          Combine price alerts with technical indicator conditions for more sophisticated trading strategies. For example, set a price alert that only triggers when RSI is oversold.
                        </p>
                      </div>
                      <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4">
                        <h4 className="font-medium text-green-400 mb-2">Use Recurring Alerts</h4>
                        <p className="text-sm text-green-300">
                          Set up recurring alerts for regular market conditions like support/resistance levels or moving average crossovers that happen frequently.
                        </p>
                      </div>
                      <div className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-4">
                        <h4 className="font-medium text-purple-400 mb-2">Export & Analyze</h4>
                        <p className="text-sm text-purple-300">
                          Regularly export your signal history to analyze your alert performance and optimize your trading strategy based on what works best.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-yellow-600 p-3 rounded-lg mr-4">
                <BellIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-gray-400">Total Alerts</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-green-600 p-3 rounded-lg mr-4">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.active}</div>
                <div className="text-sm text-gray-400">Active</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-orange-600 p-3 rounded-lg mr-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.triggered}</div>
                <div className="text-sm text-gray-400">Triggered</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-yellow-600 p-3 rounded-lg mr-4">
                <PauseIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.paused}</div>
                <div className="text-sm text-gray-400">Paused</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-purple-600 p-3 rounded-lg mr-4">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalTriggers}</div>
                <div className="text-sm text-gray-400">Total Signals</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-900 rounded-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Search alerts..."
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="triggered">Triggered</option>
                <option value="paused">Paused</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSignalHistory(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <ChartBarIcon className="w-5 h-5" />
                <span>Signal History</span>
              </button>
              
              <div className="relative group">
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span>Export</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => exportSignals('csv')}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded-t-lg"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => exportSignals('json')}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded-b-lg"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Alert</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Triggers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Notifications</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-700">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{alert.name}</div>
                        <div className="text-sm text-gray-400">{alert.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-yellow-600 p-2 rounded-lg mr-3">
                          <span className="text-white text-xs font-bold">{alert.symbol}</span>
                        </div>
                        <div className="text-sm text-gray-400">{alert.exchange}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{getConditionDisplay(alert.conditionType, alert.conditionValue)}</div>
                      {alert.isRecurring && (
                        <div className="text-xs text-yellow-400">Recurring</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(alert.status)}
                        <span className="ml-2 text-sm text-white">{alert.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{alert.triggerCount}</div>
                      {alert.lastTriggered && (
                        <div className="text-xs text-gray-400">
                          {new Date(alert.lastTriggered).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        {alert.notifyEmail && <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">📧</span>}
                        {alert.notifySms && <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">📱</span>}
                        {alert.notifyTelegram && <span className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">💬</span>}
                        {alert.notifyWebPush && <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">🔔</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleAlertStatus(alert.id, alert.status)}
                          className={`p-2 rounded-lg transition-colors ${
                            alert.status === 'ACTIVE' 
                              ? 'bg-yellow-600 hover:bg-yellow-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          } text-white`}
                          title={alert.status === 'ACTIVE' ? 'Pause Alert' : 'Activate Alert'}
                        >
                          {alert.status === 'ACTIVE' ? (
                            <PauseIcon className="w-4 h-4" />
                          ) : (
                            <PlayIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                          title="Edit Alert"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          title="Delete Alert"
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

          {filteredAlerts.length === 0 && (
            <div className="text-center py-12">
              <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No alerts found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Create your first alert to get started with signal notifications'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Your First Alert
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchAlerts()
          setShowCreateModal(false)
        }}
      />

      {/* Signal History Modal */}
      <SignalHistoryModal
        isOpen={showSignalHistory}
        onClose={() => setShowSignalHistory(false)}
        signals={alerts.flatMap(alert => alert.signals)}
      />
    </div>
  )
} 