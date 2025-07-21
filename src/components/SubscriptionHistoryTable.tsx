'use client'

import { CalendarIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import { formatDate, formatCurrencyAmount } from '@/lib/utils'

interface Plan {
  id: number
  name: string
  description: string
  price: number
  currency: string
  duration_days: number
  trial_days: number
  grace_days: number
  features: string[]
  is_active: boolean
}

interface Subscription {
  id: number
  plan_id: number
  status: string
  started_at: string
  trial_ends_at?: string
  ends_at: string
  grace_ends_at?: string
  auto_renew: boolean
  amount_paid: number
  currency: string
  is_trial?: boolean
  is_grace?: boolean
  plan: Plan
}

interface SubscriptionHistoryTableProps {
  subscriptions: Subscription[]
  getStatusColor: (status: string) => string
}

export default function SubscriptionHistoryTable({
  subscriptions,
  getStatusColor
}: SubscriptionHistoryTableProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <CreditCardIcon className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Subscription History</h3>
        </div>
        <div className="text-center py-8">
          <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No subscription history found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 mb-8">
      <div className="flex items-center space-x-3 mb-4">
        <CreditCardIcon className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">Subscription History</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Period Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Amount Paid
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Auto Renew
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {subscriptions.map((subscription) => (
              <tr key={subscription.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div>
                    <div className="text-white font-medium">
                      {subscription.plan?.name || 'Unknown Plan'}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {subscription.plan?.duration_days} days
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                    {subscription.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {formatDate(subscription.started_at)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {formatDate(subscription.ends_at)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {subscription.is_trial ? (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs">
                      Trial
                    </span>
                  ) : subscription.is_grace ? (
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs">
                      Grace
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">Regular</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-white font-medium">
                    {subscription.amount_paid ? formatCurrencyAmount(subscription.amount_paid, subscription.currency) : '-'}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {subscription.currency}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    subscription.auto_renew 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    {subscription.auto_renew ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 