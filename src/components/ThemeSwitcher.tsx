'use client'

import React, { useState } from 'react'
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline'
import { useTheme } from '@/context/ThemeContext'

interface ThemeSwitcherProps {
  variant?: 'dropdown' | 'buttons' | 'toggle'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export default function ThemeSwitcher({ 
  variant = 'dropdown', 
  size = 'md', 
  showLabel = false,
  className = ''
}: ThemeSwitcherProps) {
  const { theme, setTheme, actualTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const themes = [
    { value: 'light', label: 'Light', icon: SunIcon },
    { value: 'dark', label: 'Dark', icon: MoonIcon },
    { value: 'system', label: 'System', icon: ComputerDesktopIcon }
  ] as const

  const currentTheme = themes.find(t => t.value === theme) || themes[2]
  const isDark = actualTheme === 'dark'

  const sizeClasses = {
    sm: 'text-xs p-1.5',
    md: 'text-sm p-2',
    lg: 'text-base p-3'
  }

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  if (variant === 'toggle') {
    return (
      <button
        onClick={() => setTheme(actualTheme === 'dark' ? 'light' : 'dark')}
        className={`${sizeClasses[size]} rounded-lg transition-colors ${
          isDark 
            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } ${className}`}
        title={`Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {actualTheme === 'dark' ? (
          <SunIcon className={iconSizeClasses[size]} />
        ) : (
          <MoonIcon className={iconSizeClasses[size]} />
        )}
        {showLabel && (
          <span className="ml-2">
            {actualTheme === 'dark' ? 'Light' : 'Dark'}
          </span>
        )}
      </button>
    )
  }

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          const isActive = theme === themeOption.value
          
          return (
            <button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`${sizeClasses[size]} rounded-lg transition-colors flex items-center space-x-1 ${
                isActive
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                  : isDark
                    ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={`Switch to ${themeOption.label.toLowerCase()} mode`}
            >
              <Icon className={iconSizeClasses[size]} />
              {showLabel && <span>{themeOption.label}</span>}
            </button>
          )
        })}
      </div>
    )
  }

  // Dropdown variant (default)
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${sizeClasses[size]} rounded-lg transition-colors flex items-center space-x-2 ${
          isDark 
            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-600' 
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        } min-w-max`}
      >
        <currentTheme.icon className={iconSizeClasses[size]} />
        {showLabel && <span>{currentTheme.label}</span>}
        <ChevronDownIcon className={`${iconSizeClasses[size]} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-20 ${
            isDark 
              ? 'bg-gray-800 border border-gray-600' 
              : 'bg-white border border-gray-200'
          }`}>
            <div className="py-1">
              {themes.map((themeOption) => {
                const Icon = themeOption.icon
                const isActive = theme === themeOption.value
                
                return (
                  <button
                    key={themeOption.value}
                    onClick={() => {
                      setTheme(themeOption.value)
                      setIsOpen(false)
                    }}
                    className={`w-full px-4 py-2 text-left flex items-center space-x-3 transition-colors ${
                      isActive
                        ? isDark
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-700'
                        : isDark
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="font-medium">{themeOption.label}</div>
                      <div className={`text-xs ${
                        isActive
                          ? isDark ? 'text-blue-200' : 'text-blue-600'
                          : isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {themeOption.value === 'system' 
                          ? `Use system preference (${actualTheme})`
                          : `Always use ${themeOption.value} mode`
                        }
                      </div>
                    </div>
                    {isActive && (
                      <div className={`w-2 h-2 rounded-full ${
                        isDark ? 'bg-blue-300' : 'bg-blue-600'
                      }`} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
} 