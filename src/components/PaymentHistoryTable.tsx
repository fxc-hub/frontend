'use client'

import { CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { formatDate, formatCurrencyAmount } from '@/lib/utils'

interface Payment {
  id: number
  amount: number
  currency: string
  status: string
  payment_method: string
  payment_provider: string
  payment_reference: string
  paid_at?: string
  description?: string
}

interface PaymentHistoryTableProps {
  payments: Payment[]
  getStatusColor: (status: string) => string
}

export default function PaymentHistoryTable({
  payments,
  getStatusColor
}: PaymentHistoryTableProps) {
  if (payments.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-bold text-white">Payment History</h3>
        </div>
        <div className="text-center py-8">
          <CurrencyDollarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No payment history found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 mb-8">
      <div className="flex items-center space-x-3 mb-4">
        <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
        <h3 className="text-xl font-bold text-white">Payment History</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Payment Method
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {formatDate(payment.paid_at)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-white font-medium">
                    {formatCurrencyAmount(payment.amount, payment.currency)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {payment.currency}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-white font-medium">
                    {payment.payment_method}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-gray-300">
                    {payment.payment_provider}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-gray-300 font-mono text-sm">
                    {payment.payment_reference}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-gray-300 text-sm max-w-xs truncate">
                    {payment.description || '-'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 