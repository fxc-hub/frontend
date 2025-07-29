'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  NewspaperIcon,
  UserIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  HeartIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/context/ThemeContext'

interface UserNavigationProps {
  userInfo?: {
    firstName?: string
    lastName?: string
    email?: string
  }
  onLogout?: () => void
}

export default function UserNavigation({ userInfo, onLogout }: UserNavigationProps) {
  const pathname = usePathname()
  const { actualTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const isDark = actualTheme === 'dark'

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon
    },
    // {
    //   name: 'Marketplace',
    //   href: '/marketplace',
    //   icon: ShoppingBagIcon
    // },
    {
      name: 'Scanners',
      href: '/scanners',
      icon: ChartBarIcon
    },
    // {
    //   name: 'Economic News',
    //   href: '/economic-news',
    //   icon: NewspaperIcon
    // },
    {
      name: 'Education Hub',
      href: '/education-hub',
      icon: BookOpenIcon
    },
    // {
    //   name: 'Alerts',
    //   href: '/alerts',
    //   icon: BellIcon
    // }
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'text-yellow-400 font-medium'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
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
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
            isDark 
              ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="hidden sm:block">
            {userInfo?.firstName ? `${userInfo.firstName} ${userInfo.lastName}` : 'User'}
          </span>
        </button>

        {showUserMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowUserMenu(false)}
            />
            <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 z-20 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <Link
                href="/dashboard"
                className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setShowUserMenu(false)}
              >
                <HomeIcon className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/user/profile"
                className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setShowUserMenu(false)}
              >
                <UserIcon className="w-4 h-4" />
                <span>Profile</span>
              </Link>
              <Link
                href="/user/favorites"
                className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setShowUserMenu(false)}
              >
                <HeartIcon className="w-4 h-4" />
                <span>Favorites</span>
              </Link>
              <button
                onClick={() => {
                  setShowUserMenu(false)
                  onLogout?.()
                }}
                className={`w-full flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className={`fixed inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-700 z-50 md:hidden transform transition-transform ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white">FXCHUB</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-yellow-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
              <div className="text-sm text-gray-400 mb-2">
                {userInfo?.firstName ? `${userInfo.firstName} ${userInfo.lastName}` : 'User'}
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  onLogout?.()
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
} 