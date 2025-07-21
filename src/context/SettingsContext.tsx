'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface UISettings {
  sidebarEnabled: boolean
  sidebarCollapsed: boolean
  compactMode: boolean
  showNotifications: boolean
  autoSave: boolean
}

interface SettingsContextType {
  settings: UISettings
  updateSetting: <K extends keyof UISettings>(key: K, value: UISettings[K]) => void
  toggleSidebar: () => void
  toggleSidebarCollapse: () => void
  resetSettings: () => void
}

const defaultSettings: UISettings = {
  sidebarEnabled: true, // Default to sidebar ON
  sidebarCollapsed: false,
  compactMode: false,
  showNotifications: true,
  autoSave: true
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UISettings>(defaultSettings)

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem('ui-settings')
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsedSettings })
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Save settings to localStorage whenever they change
    localStorage.setItem('ui-settings', JSON.stringify(settings))
  }, [settings])

  const updateSetting = <K extends keyof UISettings>(key: K, value: UISettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const toggleSidebar = () => {
    setSettings(prev => ({
      ...prev,
      sidebarEnabled: !prev.sidebarEnabled
    }))
  }

  const toggleSidebarCollapse = () => {
    setSettings(prev => ({
      ...prev,
      sidebarCollapsed: !prev.sidebarCollapsed
    }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('ui-settings')
  }

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        updateSetting, 
        toggleSidebar, 
        toggleSidebarCollapse, 
        resetSettings 
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
} 