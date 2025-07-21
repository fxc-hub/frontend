'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  CogIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import AdminSidebar from './AdminSidebar'
import ThemeSwitcher from './ThemeSwitcher'
import { useSettings } from '@/context/SettingsContext'
import { useTheme } from '@/context/ThemeContext'

interface AdminLayoutProps {
  children: React.ReactNode
  userRole: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'ADMIN'
  userInfo?: {
    firstName?: string
    lastName?: string
    email?: string
  }
  activeTab?: string
  onTabChange?: (tab: string) => void
  title?: string
  actions?: React.ReactNode
}

export default function AdminLayout({ 
  children, 
  userRole, 
  userInfo, 
  activeTab, 
  onTabChange, 
  title,
  actions 
}: AdminLayoutProps) {
  const { settings, toggleSidebar, updateSetting } = useSettings()
  const { actualTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const isDark = actualTheme === 'dark'
  
  // Determine current admin path
  const currentAdminPath = pathname.includes('/super-admin') 
    ? '/super-admin' 
    : pathname.includes('/org-admin') 
      ? '/org-admin' 
      : '/admin'

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  const getPageTitle = () => {
    if (title) return title
    
    switch (currentAdminPath) {
      case '/super-admin':
        return 'FXCHUB Super Admin'
      case '/org-admin':
        return 'FXCHUB Organization Admin'
      default:
        return 'FXCHUB Admin'
    }
  }

  // Top navigation bar (shown when sidebar is disabled)
  const TopNavigation = () => (
    <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 ${isDark ? 'bg-blue-600' : 'bg-blue-500'} rounded-lg flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            <ThemeSwitcher variant="toggle" size="md" />
            
            <button
              onClick={() => setShowSettingsModal(true)}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title="Settings"
            >
              <CogIcon className="w-5 h-5" />
            </button>

            {userInfo && (
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Welcome, {userInfo.firstName} {userInfo.lastName}!
              </div>
            )}

            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Mobile header (always shown on mobile)
  const MobileHeader = () => (
    <div className={`lg:hidden border-b ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg ${
                isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
            
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 ${isDark ? 'bg-blue-600' : 'bg-blue-500'} rounded flex items-center justify-center`}>
                <span className="text-white font-bold text-xs">W</span>
              </div>
              <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                FXCHUB
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeSwitcher variant="toggle" size="sm" />
            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg ${
                isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Settings Modal
  const SettingsModal = () => {
    if (!showSettingsModal) return null

    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowSettingsModal(false)} />
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4`}>
          <div className={`w-full max-w-md rounded-xl shadow-lg ${
            isDark ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'
          }`}>
            <div className={`p-6 border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                UI Settings
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Sidebar Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Sidebar Navigation
                  </label>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Enable sidebar navigation instead of top menu
                  </p>
                </div>
                <button
                  onClick={toggleSidebar}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                    settings.sidebarEnabled 
                      ? 'bg-blue-600' 
                      : isDark ? 'bg-gray-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1 ${
                    settings.sidebarEnabled ? 'translate-x-6 ml-0.5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Theme Switcher */}
              <div className="flex items-center justify-between">
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Theme
                  </label>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Choose your preferred color scheme
                  </p>
                </div>
                <ThemeSwitcher variant="buttons" size="sm" />
              </div>

              {/* Compact Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Compact Mode
                  </label>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Reduce spacing for more content
                  </p>
                </div>
                <button
                  onClick={() => updateSetting('compactMode', !settings.compactMode)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                    settings.compactMode 
                      ? 'bg-blue-600' 
                      : isDark ? 'bg-gray-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1 ${
                    settings.compactMode ? 'translate-x-6 ml-0.5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className={`p-6 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Mobile Header */}
      <MobileHeader />

      <div className="flex">
        {/* Desktop Sidebar - shown when sidebar is enabled */}
        {settings.sidebarEnabled && (
          <div className="hidden lg:block">
            <AdminSidebar
              userRole={userRole}
              activeTab={activeTab}
              onTabChange={onTabChange}
              currentAdminPath={currentAdminPath}
            />
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-40 lg:hidden">
              <AdminSidebar
                userRole={userRole}
                activeTab={activeTab}
                onTabChange={onTabChange}
                currentAdminPath={currentAdminPath}
              />
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Desktop Top Navigation - shown when sidebar is disabled */}
          {!settings.sidebarEnabled && (
            <div className="hidden lg:block">
              <TopNavigation />
            </div>
          )}

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-8">
            {/* Desktop Header with Actions */}
            {settings.sidebarEnabled && (
              <div className="hidden lg:flex items-center justify-between mb-6">
                <div>
                  {title && (
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {title}
                    </h1>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  {actions}
                  <ThemeSwitcher variant="toggle" size="md" />
                  
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    title="Settings"
                  >
                    <CogIcon className="w-5 h-5" />
                  </button>

                  {userInfo && (
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Welcome, {userInfo.firstName} {userInfo.lastName}!
                    </div>
                  )}

                  <button
                    onClick={handleLogout}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {children}
          </main>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal />
    </div>
  )
} 