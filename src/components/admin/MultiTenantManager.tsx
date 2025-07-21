'use client'

import { useState, useEffect } from 'react'
import { 
  BuildingOfficeIcon,
  UsersIcon,
  CogIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  BellIcon,
  KeyIcon,
  ServerIcon,
  ClipboardDocumentCheckIcon,
  GlobeAltIcon,
  LinkIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  PuzzlePieceIcon,
  PhotoIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'
import HelpAccordion from '../HelpAccordion'

interface Organization {
  id: string
  name: string
  slug: string
  domain?: string
  email: string
  planType: string
  currentUsers: number
  maxUsers: number
  storageUsed: number
  storageLimit: number
  isActive: boolean
  isTrial: boolean
  trialEndsAt?: string
  createdAt: string
  users: OrganizationUser[]
  usage?: UsageData
}

interface OrganizationUser {
  id: string
  role: string
  status: string
  joinedAt: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
}

interface UsageData {
  activeUsers: number
  totalUsers: number
  storageUsed: number
  apiCalls: number
  indicatorsUsed: number
  signalsGenerated: number
}

interface ApiSetting {
  id: string
  organizationId?: string
  name: string
  displayName: string
  provider: string
  isActive: boolean
  organization?: {
    id: string
    name: string
  }
}

export default function MultiTenantManager() {
  const [activeTab, setActiveTab] = useState('organizations')
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [apiSettings, setApiSettings] = useState<ApiSetting[]>([])
  const [platformModules, setPlatformModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showApiModal, setShowApiModal] = useState(false)
  const [showDomainModal, setShowDomainModal] = useState(false)
  const [selectedOrgForDomain, setSelectedOrgForDomain] = useState<Organization | null>(null)
  const [moduleStates, setModuleStates] = useState<{[key: string]: {[moduleId: string]: boolean}}>({})
  const [currencyStates, setCurrencyStates] = useState<{[currencyCode: string]: boolean}>({
    USD: true,
    EUR: true,
    GBP: true,
    JPY: false,
    CAD: true,
    AUD: false
  })
  const [brandingSettings, setBrandingSettings] = useState({
    autoRotate: true,
    showCredits: false,
    rotationInterval: 'login'
  })
  const [imageStates, setImageStates] = useState<{[imageId: string]: boolean}>({
    '1': true,
    '2': false,
    '3': true,
    '4': false
  })

  useEffect(() => {
    fetchOrganizations()
    fetchApiSettings()
    fetchPlatformModules()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/organizations', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setOrganizations(data.organizations || [])
    } catch (error) {
      console.error('Error fetching organizations:', error)
    }
  }

  const fetchApiSettings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/api-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setApiSettings(data || [])
    } catch (error) {
      console.error('Error fetching API settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlatformModules = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/modules', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setPlatformModules(data || [])
    } catch (error) {
      console.error('Error fetching platform modules:', error)
    }
  }

  const seedModules = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/modules/seed', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        console.log('Modules seeded successfully:', data)
        fetchPlatformModules() // Refresh the modules list
      } else {
        console.error('Error seeding modules:', data.error)
      }
    } catch (error) {
      console.error('Error seeding modules:', error)
    }
  }

  const toggleModuleStatus = async (moduleId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/admin/modules/${moduleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isEnabled: !currentStatus })
      })
      fetchPlatformModules() // Refresh the modules list
    } catch (error) {
      console.error('Error toggling module status:', error)
    }
  }

  const toggleOrgStatus = async (orgId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/organizations/${orgId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })
      fetchOrganizations()
    } catch (error) {
      console.error('Error toggling organization status:', error)
    }
  }

  const getStatusColor = (status: string, isActive?: boolean) => {
    if (typeof isActive === 'boolean') {
      return isActive ? 'text-green-400' : 'text-red-400'
    }
    switch (status) {
      case 'ACTIVE': return 'text-green-400'
      case 'PENDING': return 'text-yellow-400'
      case 'INACTIVE': return 'text-red-400'
      case 'SUSPENDED': return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'FREE': return 'bg-gray-500/20 text-gray-300'
      case 'STARTER': return 'bg-blue-500/20 text-blue-300'
      case 'PROFESSIONAL': return 'bg-purple-500/20 text-purple-300'
      case 'ENTERPRISE': return 'bg-gold-500/20 text-yellow-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Multi-Tenant Management</h1>
          <p className="text-gray-400">Manage organizations, users, and tenant-specific settings</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Organization</span>
        </button>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'organizations', name: 'Organizations', icon: BuildingOfficeIcon },
            { id: 'users', name: 'Users', icon: UsersIcon },
            { id: 'modules', name: 'Modules', icon: PuzzlePieceIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Secondary Navigation Tabs */}
      <div className="border-b border-gray-600">
        <nav className="flex space-x-6 px-2">
          {[
            { id: 'api-settings', name: 'API Settings', icon: CogIcon },
            { id: 'usage', name: 'Usage & Analytics', icon: ChartBarIcon },
            { id: 'security', name: 'Security', icon: ShieldCheckIcon },
            { id: 'notifications', name: 'Notifications', icon: BellIcon },
            { id: 'payments', name: 'Payments', icon: CreditCardIcon },
            { id: 'logs', name: 'System Logs', icon: DocumentTextIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 transition-colors text-sm ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search organizations, users, or settings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Content */}
      {activeTab === 'organizations' && (
        <div className="space-y-6">
          {/* Organizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrganizations.map((org) => (
              <div key={org.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <BuildingOfficeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{org.name}</h3>
                      <p className="text-sm text-gray-400">{org.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleOrgStatus(org.id, org.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        org.isActive ? 'text-green-400 hover:bg-green-500/10' : 'text-red-400 hover:bg-red-500/10'
                      }`}
                    >
                      {org.isActive ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setSelectedOrg(org)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Plan</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(org.planType)}`}>
                      {org.planType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Users</span>
                    <span className="text-sm text-white">{org.currentUsers}/{org.maxUsers}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Storage</span>
                    <span className="text-sm text-white">
                      {formatBytes(org.storageUsed)}/{formatBytes(org.storageLimit)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Status</span>
                    <span className={`text-sm ${getStatusColor('', org.isActive)}`}>
                      {org.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Domain</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white">
                        {org.domain ? (
                          <span className="flex items-center space-x-1">
                            <span>{org.domain}</span>
                            <span className="text-xs text-green-400">✓</span>
                          </span>
                        ) : (
                          <span className="text-gray-500">Not set</span>
                        )}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedOrgForDomain(org)
                          setShowDomainModal(true)
                        }}
                        className="text-blue-400 hover:text-blue-300 text-xs"
                      >
                        Configure
                      </button>
                    </div>
                  </div>

                  {org.isTrial && org.trialEndsAt && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <p className="text-yellow-400 text-xs">
                        Trial ends: {new Date(org.trialEndsAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredOrganizations.length === 0 && (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No organizations found</h3>
              <p className="text-gray-400">Try adjusting your search or create a new organization.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'api-settings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">API Settings</h2>
            <button
              onClick={() => setShowApiModal(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add API Setting</span>
            </button>
          </div>

          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Provider</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Organization</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {apiSettings.map((setting) => (
                    <tr key={setting.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white font-medium">{setting.displayName}</div>
                          <div className="text-gray-400 text-sm">{setting.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{setting.provider}</td>
                      <td className="px-6 py-4 text-gray-300">
                        {setting.organization?.name || 'Global'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          setting.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {setting.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
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
        </div>
              )}

      {/* Domains Management Tab */}
      {activeTab === 'domains' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Domain Management</h2>
            <p className="text-gray-400">Configure custom domains and subdomains for organizations</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <div key={org.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white">{org.name}</h3>
                    <p className="text-sm text-gray-400">{org.slug}.yourapp.com</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(org.planType)}`}>
                    {org.planType}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Subdomain</span>
                    <span className="text-sm text-white">{org.slug}.yourapp.com</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Custom Domain</span>
                    <div className="flex items-center space-x-2">
                      {org.domain ? (
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-white">{org.domain}</span>
                          <CheckBadgeIcon className="w-4 h-4 text-green-400" />
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not configured</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">SSL Status</span>
                    <span className="text-sm text-green-400">Active</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">DNS Status</span>
                    <span className={`text-sm ${org.domain ? 'text-green-400' : 'text-gray-500'}`}>
                      {org.domain ? 'Verified' : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => {
                      setSelectedOrgForDomain(org)
                      setShowDomainModal(true)
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Configure Domain
                  </button>
                </div>
              </div>
            ))}
          </div>

          {organizations.length === 0 && (
            <div className="text-center py-12">
              <GlobeAltIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No organizations found</h3>
              <p className="text-gray-400">Create organizations to manage their domains.</p>
            </div>
          )}
        </div>
      )}

      {/* Modules Management Tab */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Platform Modules Management</h2>
            <div className="flex space-x-3">
              <button 
                onClick={seedModules}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Seed Modules</span>
              </button>
              <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                <CogIcon className="w-5 h-5" />
                <span>Module Settings</span>
              </button>
            </div>
          </div>

          <HelpAccordion
            title="Module Management Help"
            items={[
              {
                id: 'module-overview',
                title: 'Platform Module System',
                type: 'info',
                content: 'Platform modules are feature sets that can be enabled/disabled globally. Each module can have specific plan requirements and configuration options.'
              },
              {
                id: 'plan-restrictions',
                title: 'Plan-Based Access Control',
                type: 'tip',
                content: 'Modules can require specific subscription plans (FREE, PRO, VIP). Users on lower plans will not have access to premium modules even if enabled.'
              },
              {
                id: 'module-seeding',
                title: 'Module Seeding',
                type: 'help',
                content: 'Use the "Seed Modules" button to populate the database with default platform modules if none exist. This is typically done during initial setup.'
              }
            ]}
            className="mb-6"
          />

          {platformModules.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
              <PuzzlePieceIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Modules Found</h3>
              <p className="text-gray-400 mb-6">No platform modules have been configured yet.</p>
              <button 
                onClick={seedModules}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Seed Default Modules
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {platformModules.map((module) => (
                <div key={module.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{module.displayName}</h3>
                      <p className="text-sm text-gray-400 mb-2">{module.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          module.category === 'feature' ? 'bg-blue-500/20 text-blue-300' :
                          module.category === 'tool' ? 'bg-green-500/20 text-green-300' :
                          module.category === 'integration' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {module.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          module.requiredPlan === 'FREE' ? 'bg-gray-500/20 text-gray-300' :
                          module.requiredPlan === 'PRO' ? 'bg-blue-500/20 text-blue-300' :
                          module.requiredPlan === 'VIP' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-purple-500/20 text-purple-300'
                        }`}>
                          {module.requiredPlan || 'FREE'}
                        </span>
                        {module.betaFeature && (
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-medium">
                            BETA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          module.status === 'AVAILABLE' ? 'bg-green-400' :
                          module.status === 'BETA' ? 'bg-orange-400' :
                          module.status === 'MAINTENANCE' ? 'bg-yellow-400' :
                          module.status === 'DEPRECATED' ? 'bg-red-400' :
                          'bg-gray-400'
                        }`}></div>
                        <span className="text-white text-sm font-medium">Module Status</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        module.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-300' :
                        module.status === 'BETA' ? 'bg-orange-500/20 text-orange-300' :
                        module.status === 'MAINTENANCE' ? 'bg-yellow-500/20 text-yellow-300' :
                        module.status === 'DEPRECATED' ? 'bg-red-500/20 text-red-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {module.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="text-white text-sm font-medium">Enabled Globally</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={module.isEnabled}
                          onChange={() => toggleModuleStatus(module.id, module.isEnabled)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    {module.requiresApi && (
                      <div className="flex items-center space-x-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <CogIcon className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-300 text-xs">Requires API Configuration</span>
                      </div>
                    )}

                    {module.adminOnly && (
                      <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <ShieldCheckIcon className="w-4 h-4 text-red-400" />
                        <span className="text-red-300 text-xs">Admin Only</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>v{module.version}</span>
                      <span>Usage: {module.usageCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Currency Management Tab */}
      {activeTab === 'currency' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Multi-Currency Settings</h2>
            <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
              <PlusIcon className="w-5 h-5" />
              <span>Add Currency</span>
            </button>
          </div>

          <HelpAccordion
            title="Currency Management Guide"
            items={[
              {
                id: 'currency-setup',
                title: 'Setting Up Multiple Currencies',
                type: 'info',
                content: 'Configure supported currencies for your platform. Each organization can have a default currency, but users can view data in their preferred currency.'
              },
              {
                id: 'exchange-rates',
                title: 'Exchange Rate Updates',
                type: 'tip',
                content: 'Exchange rates are automatically updated every hour using reliable financial data providers. You can also manually refresh rates when needed.'
              },
              {
                id: 'currency-display',
                title: 'Currency Display Format',
                type: 'help',
                content: 'Customize how currencies are displayed including decimal places, thousand separators, and currency symbol position for different locales.'
              }
            ]}
            className="mb-6"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4">Supported Currencies</h3>
              
              <div className="space-y-4">
                {[
                  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0000, enabled: true, default: true },
                  { code: 'USDT', name: 'Tether USD', symbol: 'USDT', rate: 1.0000, enabled: true, default: false },
                  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.8456, enabled: true, default: false },
                  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.7234, enabled: true, default: false },
                  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110.45, enabled: false, default: false },
                  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.2456, enabled: true, default: false },
                  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.3456, enabled: false, default: false }
                ].map((currency) => (
                  <div key={currency.code} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span className="text-green-400 font-bold">{currency.symbol}</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{currency.code}</div>
                        <div className="text-gray-400 text-sm">{currency.name}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-white text-sm">1 USD = {currency.rate} {currency.code}</div>
                        <div className="text-gray-400 text-xs">Updated 2 mins ago</div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {currency.default && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Default</span>
                        )}
                        
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currencyStates[currency.code] ?? currency.enabled}
                            onChange={(e) => {
                              setCurrencyStates(prev => ({
                                ...prev,
                                [currency.code]: e.target.checked
                              }));
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4">Currency Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Default Platform Currency</label>
                  <select className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-green-500 focus:outline-none">
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Exchange Rate Provider</label>
                  <select className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-green-500 focus:outline-none">
                    <option value="fixer">Fixer.io</option>
                    <option value="openexchange">Open Exchange Rates</option>
                    <option value="currencylayer">Currency Layer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Update Frequency</label>
                  <select className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-green-500 focus:outline-none">
                    <option value="1h">Every Hour</option>
                    <option value="6h">Every 6 Hours</option>
                    <option value="24h">Daily</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoConvert"
                    className="mr-3"
                    defaultChecked
                  />
                  <label htmlFor="autoConvert" className="text-white">Auto-convert prices for users</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showRates"
                    className="mr-3"
                    defaultChecked
                  />
                  <label htmlFor="showRates" className="text-white">Show exchange rates to users</label>
                </div>

                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors">
                  Update Currency Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Branding Management Tab */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Branding & Login Images</h2>
            <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
              <PhotoIcon className="w-5 h-5" />
              <span>Upload Image</span>
            </button>
          </div>

          <HelpAccordion
            title="Branding Management Guide"
            items={[
              {
                id: 'login-images',
                title: 'Login Page Images',
                type: 'info',
                content: 'Upload and manage images that appear on the login page. Images rotate automatically to keep the login experience fresh and engaging.'
              },
              {
                id: 'image-requirements',
                title: 'Image Requirements',
                type: 'warning',
                content: 'Images should be:<br/>• High resolution (minimum 1920x1080)<br/>• Professional trading/financial themes<br/>• Under 5MB file size<br/>• JPG or PNG format'
              },
              {
                id: 'organization-branding',
                title: 'Organization-Specific Branding',
                type: 'tip',
                content: 'Enterprise plans can upload custom login images specific to their organization domain, creating a fully branded experience.'
              }
            ]}
            className="mb-6"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4">Global Login Images</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { id: 1, url: '/api/placeholder/400/250', name: 'Trading Floor', active: true },
                  { id: 2, url: '/api/placeholder/400/250', name: 'Financial District', active: false },
                  { id: 3, url: '/api/placeholder/400/250', name: 'Charts & Analytics', active: true },
                  { id: 4, url: '/api/placeholder/400/250', name: 'Market Data', active: false }
                ].map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <PhotoIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="flex space-x-2">
                        <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">{image.name}</span>
                                                 <label className="relative inline-flex items-center cursor-pointer">
                           <input
                             type="checkbox"
                             checked={imageStates[image.id.toString()] ?? image.active}
                             onChange={(e) => {
                               setImageStates(prev => ({
                                 ...prev,
                                 [image.id.toString()]: e.target.checked
                               }));
                             }}
                             className="sr-only peer"
                           />
                           <div className="w-7 h-4 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600"></div>
                         </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Drag and drop images here</p>
                <p className="text-gray-500 text-sm">or click to browse files</p>
                <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Select Files
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4">Organization Branding</h3>
              
              <div className="space-y-4">
                {organizations.filter(org => org.planType === 'ENTERPRISE').slice(0, 3).map((org) => (
                  <div key={org.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{org.name}</h4>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                        Enterprise
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded flex items-center justify-center">
                        <PhotoIcon className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-300 text-sm">Custom login image</p>
                        <p className="text-gray-500 text-xs">1920x1080 • Updated 2 days ago</p>
                      </div>
                      <button className="text-purple-400 hover:text-purple-300 text-sm">
                        Change
                      </button>
                    </div>
                  </div>
                ))}

                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="text-white font-medium mb-2">Branding Settings</h4>
                  
                  <div className="space-y-3">
                                         <div className="flex items-center justify-between">
                       <span className="text-gray-300 text-sm">Auto-rotate images</span>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input 
                           type="checkbox" 
                           className="sr-only peer" 
                           checked={brandingSettings.autoRotate}
                           onChange={(e) => setBrandingSettings(prev => ({
                             ...prev,
                             autoRotate: e.target.checked
                           }))}
                         />
                         <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                       </label>
                     </div>
                     
                     <div className="flex items-center justify-between">
                       <span className="text-gray-300 text-sm">Show image credits</span>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input 
                           type="checkbox" 
                           className="sr-only peer" 
                           checked={brandingSettings.showCredits}
                           onChange={(e) => setBrandingSettings(prev => ({
                             ...prev,
                             showCredits: e.target.checked
                           }))}
                         />
                         <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                       </label>
                     </div>
                    
                                         <div>
                       <label className="block text-sm text-gray-300 mb-1">Rotation interval</label>
                       <select 
                         className="w-full bg-gray-600 text-white border border-gray-500 rounded px-2 py-1 text-sm"
                         value={brandingSettings.rotationInterval}
                         onChange={(e) => setBrandingSettings(prev => ({
                           ...prev,
                           rotationInterval: e.target.value
                         }))}
                       >
                         <option value="login">Every login</option>
                         <option value="hour">Every hour</option>
                         <option value="daily">Daily</option>
                       </select>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Organization Detail Modal */}
      {selectedOrg && (
        <OrganizationDetailModal
          organization={selectedOrg}
          onClose={() => setSelectedOrg(null)}
          onUpdate={fetchOrganizations}
        />
      )}

      {/* Create Organization Modal */}
      {showCreateModal && (
        <CreateOrganizationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchOrganizations()
          }}
        />
      )}

      {/* Domain Configuration Modal */}
      {showDomainModal && selectedOrgForDomain && (
        <DomainConfigurationModal
          organization={selectedOrgForDomain}
          onClose={() => {
            setShowDomainModal(false)
            setSelectedOrgForDomain(null)
          }}
          onSuccess={() => {
            setShowDomainModal(false)
            setSelectedOrgForDomain(null)
            fetchOrganizations()
          }}
        />
      )}
    </div>
  )
}

// Organization Detail Modal Component
const OrganizationDetailModal = ({ 
  organization, 
  onClose, 
  onUpdate 
}: { 
  organization: Organization
  onClose: () => void
  onUpdate: () => void 
}) => {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BuildingOfficeIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{organization.name}</h2>
                <p className="text-gray-400">{organization.email}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-700 mb-6">
            <nav className="flex space-x-6">
              {[
                { id: 'overview', name: 'Overview', icon: ClipboardDocumentCheckIcon },
                { id: 'users', name: 'Users', icon: UsersIcon },
                { id: 'usage', name: 'Usage', icon: ChartBarIcon },
                { id: 'settings', name: 'Settings', icon: CogIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Organization Details</h3>
                <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan Type</span>
                    <span className="text-white">{organization.planType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className={organization.isActive ? 'text-green-400' : 'text-red-400'}>
                      {organization.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white">{new Date(organization.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Domain</span>
                    <span className="text-white">{organization.domain || 'Not set'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Resource Usage</h3>
                <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Users</span>
                    <span className="text-white">{organization.currentUsers}/{organization.maxUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Storage Used</span>
                    <span className="text-white">
                      {((organization.storageUsed / organization.storageLimit) * 100).toFixed(1)}%
                    </span>
                  </div>
                  {organization.usage && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">API Calls</span>
                        <span className="text-white">{organization.usage.apiCalls.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Indicators Used</span>
                        <span className="text-white">{organization.usage.indicatorsUsed}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Organization Users</h3>
                <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                  <PlusIcon className="w-4 h-4" />
                  <span>Invite User</span>
                </button>
              </div>
              
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">User</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Joined</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {organization.users?.map((orgUser) => (
                      <tr key={orgUser.id} className="hover:bg-gray-700/50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-white font-medium">
                              {orgUser.user.firstName} {orgUser.user.lastName}
                            </div>
                            <div className="text-gray-400 text-sm">{orgUser.user.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            orgUser.role === 'OWNER' ? 'bg-purple-500/20 text-purple-300' :
                            orgUser.role === 'ADMIN' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {orgUser.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            orgUser.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300' :
                            orgUser.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {orgUser.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-300 text-sm">
                          {new Date(orgUser.joinedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
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
          )}
        </div>
      </div>
    </div>
  )
}

// Create Organization Modal Component
const CreateOrganizationModal = ({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void
  onSuccess: () => void 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    industry: '',
    size: 'SMALL',
    planType: 'FREE',
    phone: '',
    website: '',
    country: 'NG',
    ownerEmail: '',
    ownerFirstName: '',
    ownerLastName: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newOrg = await response.json()
        onSuccess()
        // Show success message could be added here
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create organization')
      }
    } catch (err) {
      setError('An error occurred while creating the organization')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Create New Organization</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Organization Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Organization Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Size</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="SMALL">Small (1-10 employees)</option>
                  <option value="MEDIUM">Medium (11-50 employees)</option>
                  <option value="LARGE">Large (51-200 employees)</option>
                  <option value="ENTERPRISE">Enterprise (200+ employees)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Plan Type</label>
                <select
                  value={formData.planType}
                  onChange={(e) => setFormData({...formData, planType: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="FREE">Free</option>
                  <option value="STARTER">Starter</option>
                  <option value="PROFESSIONAL">Professional</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Organization Owner Section */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Organization Owner</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Owner Email *</label>
                  <input
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="owner@company.com"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">User will be created if doesn't exist</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.ownerFirstName}
                    onChange={(e) => setFormData({...formData, ownerFirstName: e.target.value})}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.ownerLastName}
                    onChange={(e) => setFormData({...formData, ownerLastName: e.target.value})}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Organization'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 

// Domain Configuration Modal Component
const DomainConfigurationModal = ({
  organization,
  onClose,
  onSuccess
}: {
  organization: Organization
  onClose: () => void
  onSuccess: () => void
}) => {
  const [activeTab, setActiveTab] = useState('setup')
  const [formData, setFormData] = useState({
    domain: organization.domain || '',
    subdomainPrefix: organization.slug,
    enableSubdomain: true,
    enableCustomDomain: false,
    sslEnabled: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [verificationStatus, setVerificationStatus] = useState('pending')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/organizations`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: organization.id,
          domain: formData.enableCustomDomain ? formData.domain : null,
          slug: formData.subdomainPrefix
        })
      })

      if (response.ok) {
        onSuccess()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update domain configuration')
      }
    } catch (err) {
      setError('An error occurred while updating domain configuration')
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyDomain = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/organizations/${organization.id}/verify-domain`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ domain: formData.domain })
      })

      const data = await response.json()
      if (response.ok) {
        setVerificationStatus('verified')
      } else {
        setVerificationStatus('failed')
        setError(data.error || 'Domain verification failed')
      }
    } catch (err) {
      setVerificationStatus('failed')
      setError('Failed to verify domain')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <GlobeAltIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Domain Configuration</h2>
                <p className="text-gray-400">{organization.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-700 mb-6">
            <nav className="flex space-x-6">
              {[
                { id: 'setup', name: 'Domain Setup', icon: CogIcon },
                { id: 'dns', name: 'DNS Configuration', icon: ServerIcon },
                { id: 'ssl', name: 'SSL Certificate', icon: ShieldCheckIcon },
                { id: 'verification', name: 'Verification', icon: CheckBadgeIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'setup' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subdomain Configuration */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <LinkIcon className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-medium text-white">Subdomain</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableSubdomain"
                        checked={formData.enableSubdomain}
                        onChange={(e) => setFormData({...formData, enableSubdomain: e.target.checked})}
                        className="mr-3"
                      />
                      <label htmlFor="enableSubdomain" className="text-white">Enable subdomain access</label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Subdomain Prefix</label>
                      <div className="flex">
                        <input
                          type="text"
                          value={formData.subdomainPrefix}
                          onChange={(e) => setFormData({...formData, subdomainPrefix: e.target.value})}
                          className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-l-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                          placeholder="organization-name"
                        />
                        <span className="bg-gray-600 text-gray-300 px-3 py-2 border border-l-0 border-gray-600 rounded-r-lg">
                          .yourapp.com
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Your organization will be accessible at: {formData.subdomainPrefix}.yourapp.com
                      </p>
                    </div>
                  </div>
                </div>

                {/* Custom Domain Configuration */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <GlobeAltIcon className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-medium text-white">Custom Domain</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableCustomDomain"
                        checked={formData.enableCustomDomain}
                        onChange={(e) => setFormData({...formData, enableCustomDomain: e.target.checked})}
                        className="mr-3"
                      />
                      <label htmlFor="enableCustomDomain" className="text-white">Enable custom domain</label>
                    </div>

                    {formData.enableCustomDomain && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Domain Name</label>
                        <input
                          type="text"
                          value={formData.domain}
                          onChange={(e) => setFormData({...formData, domain: e.target.value})}
                          className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                          placeholder="trading.yourcompany.com"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Enter your custom domain (e.g., trading.yourcompany.com)
                        </p>
                      </div>
                    )}

                    {organization.planType === 'FREE' && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />
                          <p className="text-yellow-400 text-sm">
                            Custom domains require a paid plan. Upgrade to enable this feature.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'dns' && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">DNS Configuration</h3>
                
                {formData.enableCustomDomain && formData.domain ? (
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      To use your custom domain <strong>{formData.domain}</strong>, add the following DNS records:
                    </p>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3">Required DNS Records:</h4>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="text-gray-400 font-medium">Type</div>
                          <div className="text-gray-400 font-medium">Name</div>
                          <div className="text-gray-400 font-medium">Value</div>
                          <div className="text-gray-400 font-medium">TTL</div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm bg-gray-600 p-2 rounded">
                          <div className="text-white">CNAME</div>
                          <div className="text-white">{formData.domain}</div>
                          <div className="text-white">cname.yourapp.com</div>
                          <div className="text-white">300</div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm bg-gray-600 p-2 rounded">
                          <div className="text-white">TXT</div>
                          <div className="text-white">_yourapp-verification</div>
                          <div className="text-white">yourapp-verify-{organization.id.slice(0, 8)}</div>
                          <div className="text-white">300</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="text-blue-400 font-medium mb-2">📝 Setup Instructions:</h4>
                      <ol className="text-blue-300 text-sm space-y-1 list-decimal list-inside">
                        <li>Log in to your domain registrar's control panel</li>
                        <li>Navigate to DNS management or DNS settings</li>
                        <li>Add the DNS records shown above</li>
                        <li>Wait for DNS propagation (usually 5-30 minutes)</li>
                        <li>Click "Verify Domain" in the Verification tab</li>
                      </ol>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GlobeAltIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h4 className="text-white font-medium mb-2">No Custom Domain Configured</h4>
                    <p className="text-gray-400 text-sm">
                      Enable custom domain in the Domain Setup tab to see DNS configuration instructions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ssl' && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">SSL Certificate</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckBadgeIcon className="w-6 h-6 text-green-400" />
                      <div>
                        <h4 className="text-white font-medium">Automatic SSL</h4>
                        <p className="text-gray-400 text-sm">SSL certificates are automatically provisioned and renewed</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Active</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Subdomain SSL</h4>
                      <p className="text-gray-400 text-sm mb-2">{formData.subdomainPrefix}.yourapp.com</p>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">Valid</span>
                    </div>

                    {formData.enableCustomDomain && formData.domain && (
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Custom Domain SSL</h4>
                        <p className="text-gray-400 text-sm mb-2">{formData.domain}</p>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">Pending Verification</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-400 font-medium mb-2">🔒 SSL Information:</h4>
                    <ul className="text-blue-300 text-sm space-y-1">
                      <li>• SSL certificates are automatically issued by Let's Encrypt</li>
                      <li>• Certificates are renewed automatically before expiration</li>
                      <li>• All traffic is encrypted with TLS 1.2/1.3</li>
                      <li>• HSTS is enabled for enhanced security</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Domain Verification</h3>
                
                {formData.enableCustomDomain && formData.domain ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">{formData.domain}</h4>
                        <p className="text-gray-400 text-sm">Custom domain verification status</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          verificationStatus === 'verified' ? 'bg-green-500/20 text-green-300' :
                          verificationStatus === 'failed' ? 'bg-red-500/20 text-red-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {verificationStatus === 'verified' ? 'Verified' :
                           verificationStatus === 'failed' ? 'Failed' : 'Pending'}
                        </span>
                        <button
                          onClick={verifyDomain}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                        >
                          Verify Domain
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3">Verification Checklist:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckBadgeIcon className="w-4 h-4 text-green-400" />
                          <span className="text-green-300 text-sm">CNAME record configured</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckBadgeIcon className="w-4 h-4 text-green-400" />
                          <span className="text-green-300 text-sm">TXT verification record added</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-300 text-sm">DNS propagation pending</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckBadgeIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h4 className="text-white font-medium mb-2">No Domain to Verify</h4>
                    <p className="text-gray-400 text-sm">
                      Configure a custom domain first to enable verification.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 