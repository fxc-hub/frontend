'use client'

import { useSiteLogo } from '@/hooks/useSiteLogo'

interface SiteLogoProps {
  className?: string
  fallbackText?: string
  showFallback?: boolean
}

export default function SiteLogo({ 
  className = "h-8 w-auto", 
  fallbackText = "FXCHUB",
  showFallback = true 
}: SiteLogoProps) {
  const { logoUrl, isLoading, error } = useSiteLogo()

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-700 rounded animate-pulse`}></div>
    )
  }

  if (logoUrl && !error) {
    return (
      <img 
        src={logoUrl} 
        alt="Site Logo" 
        className={`${className} object-contain`}
        onError={(e) => {
          // If image fails to load, hide it and show fallback
          e.currentTarget.style.display = 'none'
        }}
      />
    )
  }

  if (showFallback) {
    return (
      <div className={`${className} bg-gradient-to-r from-yellow-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
        {fallbackText}
      </div>
    )
  }

  return null
} 