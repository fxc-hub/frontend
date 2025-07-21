'use client'

import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon, 
  EyeIcon, 
  ArrowDownTrayIcon,
  CreditCardIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'

interface Invoice {
  id: string
  invoice_number: string
  amount: number
  total_amount: number
  currency: string
  status: string
  issue_date: string
  due_date: string
  paid_date?: string
  plan: {
    name: string
  }
}

interface InvoiceStats {
  total_invoices: number
  paid_invoices: number
  pending_invoices: number
  total_amount_paid: number
  total_amount_pending: number
  overdue_invoices: number
}

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<InvoiceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchInvoices()
    fetchStats()
  }, [currentPage])

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await api(`/api/invoices?page=${currentPage}`, 'GET', {}, token)
      setInvoices(response.data.data)
      setTotalPages(response.data.last_page)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await api('/api/invoices/stats', 'GET', {}, token)
      setStats(response.data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await api(`/api/invoices/${invoiceId}/pay`, 'POST', {
        payment_method: 'card',
        payment_provider: 'flutterwave'
      }, token)

      // Redirect to payment URL
      if (response.data.payment_url) {
        window.open(response.data.payment_url, '_blank')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment')
    }
  }

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await api(`/api/invoices/${invoiceId}/download`, 'GET', {}, token)
      
      // Download the PDF
      if (response.data.download_url) {
        window.open(response.data.download_url, '_blank')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to download invoice')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100'
      case 'overdue':
        return 'text-red-600 bg-red-100'
      case 'sent':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'overdue':
        return <ExclamationTriangleIcon className="w-4 h-4" />
      case 'sent':
        return <CalendarIcon className="w-4 h-4" />
      default:
        return <DocumentTextIcon className="w-4 h-4" />
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <DocumentTextIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Invoices</p>
                <p className="text-lg font-semibold text-gray-900">{stats.total_invoices}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Paid</p>
                <p className="text-lg font-semibold text-gray-900">{stats.paid_invoices}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-lg font-semibold text-gray-900">{stats.overdue_invoices}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Paid</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(stats.total_amount_paid, 'USD')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Invoices</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.invoice_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(invoice.issue_date)}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.plan.name}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.total_amount, invoice.currency)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      <span className="ml-1 capitalize">{invoice.status}</span>
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(invoice.due_date)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Download Invoice"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                      
                      {invoice.status !== 'paid' && (
                        <button
                          onClick={() => handlePayInvoice(invoice.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Pay Invoice"
                        >
                          <CreditCardIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 