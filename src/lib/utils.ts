/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}

/**
 * Format a date string to include time
 */
export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString()
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  return formatter.format(amount)
}

/**
 * Format currency amount with symbol only
 */
export function formatCurrencyAmount(amount: number, currency: string = 'USD'): string {
  const symbol = currency === 'USD' ? '$' : currency === 'USDT' ? 'USDT' : currency
  return `${symbol}${amount.toLocaleString()}`
}

/**
 * Calculate days remaining between two dates
 */
export function getDaysRemaining(endDate: string | undefined): number | undefined {
  if (!endDate) return undefined
  
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays > 0 ? diffDays : 0
}

/**
 * Get status color classes for badges
 */
export function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
    case 'SUCCESS':
    case 'COMPLETED':
      return 'bg-green-500/20 text-green-300'
    case 'PENDING':
    case 'PROCESSING':
      return 'bg-yellow-500/20 text-yellow-300'
    case 'FAILED':
    case 'CANCELLED':
    case 'EXPIRED':
      return 'bg-red-500/20 text-red-300'
    case 'SUSPENDED':
      return 'bg-orange-500/20 text-orange-300'
    default:
      return 'bg-gray-500/20 text-gray-300'
  }
} 