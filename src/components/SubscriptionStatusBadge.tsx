'use client'

import { ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { formatDate, getDaysRemaining } from '@/lib/utils'

interface SubscriptionStatusBadgeProps {
  isTrial?: boolean
  isGrace?: boolean
  trialEndsAt?: string
  graceEndsAt?: string
  remainingDays?: number
}

export default function SubscriptionStatusBadge({
  isTrial,
  isGrace,
  trialEndsAt,
  graceEndsAt,
  remainingDays
}: SubscriptionStatusBadgeProps) {
  if (!isTrial && !isGrace) return null

  const isTrialActive = isTrial && trialEndsAt
  const isGraceActive = isGrace && graceEndsAt

  // Use provided remainingDays or calculate from end date
  const getDaysLeft = (endDate?: string) => {
    if (remainingDays !== undefined) return remainingDays
    if (endDate) return getDaysRemaining(endDate)
    return undefined
  }

  if (isTrialActive) {
    const daysLeft = getDaysLeft(trialEndsAt)
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-4">
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-5 h-5 text-yellow-400" />
          <div>
            <span className="text-yellow-400 font-medium">Trial Period Active</span>
            <div className="text-gray-300 text-sm">
              Ends: {formatDate(trialEndsAt)}
              {daysLeft !== undefined && (
                <span className="ml-2">({daysLeft} days left)</span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isGraceActive) {
    const daysLeft = getDaysLeft(graceEndsAt)
    return (
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mt-4">
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-orange-400" />
          <div>
            <span className="text-orange-400 font-medium">Grace Period Active</span>
            <div className="text-gray-300 text-sm">
              Ends: {formatDate(graceEndsAt)}
              {daysLeft !== undefined && (
                <span className="ml-2">({daysLeft} days left)</span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
} 