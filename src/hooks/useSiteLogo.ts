import { useState, useEffect } from 'react'

export function useSiteLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLogo()
  }, [])

  const fetchLogo = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/site-settings/logo')
      if (response.ok) {
        const data = await response.json()
        setLogoUrl(data.logo_url)
      } else {
        setError('Failed to fetch logo')
      }
    } catch (err) {
      setError('Failed to fetch logo')
      console.error('Error fetching logo:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return { logoUrl, isLoading, error, refetch: fetchLogo }
} 