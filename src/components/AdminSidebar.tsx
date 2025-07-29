'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  UsersIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BellIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ServerIcon,
  KeyIcon,
  PhotoIcon,
  PuzzlePieceIcon,
  EyeIcon,
  SwatchIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  HomeIcon,
  CircleStackIcon,
  ChartBarSquareIcon,
  Cog6ToothIcon as SettingsIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  UserPlusIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { useSettings } from '@/context/SettingsContext'
import { useTheme } from '@/context/ThemeContext'

interface NavigationItem {
  id: string
  name: string
  icon: React.ElementType
  href?: string
  onClick?: () => void
  badge?: string | number
  submenu?: NavigationItem[]
}

interface AdminSidebarProps {
  userRole: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'ADMIN'
  activeTab?: string
  onTabChange?: (tab: string) => void
  currentAdminPath: '/admin' | '/super-admin' | '/org-admin'
}

export default function AdminSidebar({ 
  userRole, 
  activeTab, 
  onTabChange, 
  currentAdminPath 
}: AdminSidebarProps) {
  const { settings, toggleSidebarCollapse } = useSettings()
  const { actualTheme } = useTheme()
  const pathname = usePathname()

  // Define navigation items based on user role and current admin path
  const getNavigationItems = (): NavigationItem[] => {
    switch (currentAdminPath) {
      case '/super-admin':
        return [
          {
            id: 'overview',
            name: 'Platform Overview',
            icon: HomeIcon,
            onClick: () => onTabChange?.('overview')
          },
          {
            id: 'organizations',
            name: 'Organizations',
            icon: BuildingOfficeIcon,
            onClick: () => onTabChange?.('organizations')
          },
          {
            id: 'platform',
            name: 'Platform Management',
            icon: Cog6ToothIcon,
            onClick: () => onTabChange?.('platform')
          },
          {
            id: 'platform-settings',
            name: 'Site Settings',
            icon: ServerIcon,
            onClick: () => onTabChange?.('platform-settings')
          },
          {
            id: 'payments',
            name: 'Payment Gateways',
            icon: CreditCardIcon,
            onClick: () => onTabChange?.('payments')
          },
          {
            id: 'security',
            name: 'Security & Audit',
            icon: ShieldCheckIcon,
            onClick: () => onTabChange?.('security')
          }
        ]

      case '/org-admin':
        return [
          {
            id: 'overview',
            name: 'Overview',
            icon: HomeIcon,
            onClick: () => onTabChange?.('overview')
          },
          {
            id: 'users',
            name: 'Users',
            icon: UsersIcon,
            onClick: () => onTabChange?.('users')
          },
          {
            id: 'usage',
            name: 'Usage & Analytics',
            icon: ChartBarIcon,
            onClick: () => onTabChange?.('usage')
          },
          {
            id: 'settings',
            name: 'Settings',
            icon: SettingsIcon,
            onClick: () => onTabChange?.('settings')
          },
          {
            id: 'currency',
            name: 'Currency',
            icon: CurrencyDollarIcon,
            onClick: () => onTabChange?.('currency')
          },
          {
            id: 'domain',
            name: 'Domain',
            icon: GlobeAltIcon,
            onClick: () => onTabChange?.('domain')
          },
          {
            id: 'branding',
            name: 'Branding',
            icon: SwatchIcon,
            onClick: () => onTabChange?.('branding')
          }
        ]

      case '/admin':
      default:
        return [
          {
            id: 'users',
            name: 'Users Management',
            icon: UsersIcon,
            onClick: () => onTabChange?.('users')
          },
          {
            id: 'plans',
            name: 'Plans Management',
            icon: CreditCardIcon,
            onClick: () => onTabChange?.('plans')
          },
          {
            id: 'indicator-manager',
            name: 'Indicator Manager',
            icon: PuzzlePieceIcon,
            onClick: () => onTabChange?.('indicator-manager')
          },
          {
            id: 'chart-manager',
            name: 'Chart Manager',
            icon: ChartBarSquareIcon,
            onClick: () => onTabChange?.('chart-manager')
          },
          {
            id: 'settings',
            name: 'API Settings',
            icon: Cog6ToothIcon,
            onClick: () => onTabChange?.('settings')
          },
          {
            id: 'site-settings',
            name: 'Site Settings',
            icon: ServerIcon,
            onClick: () => onTabChange?.('site-settings')
          },
          {
            id: 'notifications',
            name: 'Notifications',
            icon: BellIcon,
            onClick: () => onTabChange?.('notifications')
          },
          {
            id: 'payments',
            name: 'Payment Gateways',
            icon: CreditCardIcon,
            onClick: () => onTabChange?.('payments')
          },
          {
            id: 'security',
            name: 'Security',
            icon: ShieldCheckIcon,
            onClick: () => onTabChange?.('security')
          },
          {
            id: 'audit',
            name: 'Audit Logs',
            icon: DocumentTextIcon,
            onClick: () => onTabChange?.('audit')
          },
          {
            id: 'branding',
            name: 'Branding',
            icon: SwatchIcon,
            onClick: () => onTabChange?.('branding')
          }
        ]
    }
  }

  const navigationItems = getNavigationItems()

  const sidebarWidth = settings.sidebarCollapsed ? 'w-16' : 'w-64'
  const isDark = actualTheme === 'dark'

  return (
    <div className={`${sidebarWidth} transition-all duration-300 flex flex-col ${
      isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    } border-r min-h-screen`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!settings.sidebarCollapsed && (
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 ${isDark ? 'bg-blue-600' : 'bg-blue-500'} rounded-lg flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <div>
              <h2 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                FXCHUB
              </h2>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {currentAdminPath === '/super-admin' ? 'Super Admin' : 
                 currentAdminPath === '/org-admin' ? 'Org Admin' : 'Admin'}
              </p>
            </div>
          </div>
        )}
        
        <button
          onClick={toggleSidebarCollapse}
          className={`p-1.5 rounded-lg transition-colors ${
            isDark 
              ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
          }`}
        >
          {settings.sidebarCollapsed ? (
            <ArrowRightIcon className="w-4 h-4" />
          ) : (
            <ArrowLeftIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                isActive
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                  : isDark
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${settings.sidebarCollapsed ? 'mx-auto' : ''}`} />
              {!settings.sidebarCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.badge && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      isActive
                        ? 'bg-white text-blue-600'
                        : isDark
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Admin Panel Switcher (for Super Admins) */}
      {userRole === 'SUPER_ADMIN' && !settings.sidebarCollapsed && (
        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="space-y-2">
            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
              Quick Switch
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/super-admin"
                className={`p-2 rounded text-xs text-center transition-colors ${
                  pathname === '/super-admin'
                    ? isDark
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                    : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Super
              </Link>
              <Link
                href="/org-admin"
                className={`p-2 rounded text-xs text-center transition-colors ${
                  pathname === '/org-admin'
                    ? isDark
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                    : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Org
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Collapsed Tooltip */}
      {settings.sidebarCollapsed && (
        <div className="p-4">
          <div className={`w-8 h-1 rounded-full mx-auto ${
            isDark ? 'bg-gray-700' : 'bg-gray-300'
          }`} />
        </div>
      )}
    </div>
  )
} 