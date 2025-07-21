'use client'

import React from 'react'
import { XMarkIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline'

interface Signal {
  id: string
  triggeredAt: string
  triggerValue: number
  marketPrice: number
  signalStrength: string
  confidence: number
  message: string
}

interface SignalHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  signals: Signal[]
}

export default function SignalHistoryModal({ isOpen, onClose, signals }: SignalHistoryModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Signal History</h2>
                <p className="text-gray-400">View all triggered signals</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {signals.length === 0 ? (
            <div className="text-center py-12">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No signals yet</h3>
              <p className="text-gray-400">Signals will appear here when your alerts are triggered</p>
            </div>
          ) : (
            <div className="space-y-4">
              {signals.map((signal) => (
                <div key={signal.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        {new Date(signal.triggeredAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        signal.signalStrength === 'STRONG' ? 'bg-green-600 text-white' :
                        signal.signalStrength === 'MODERATE' ? 'bg-yellow-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {signal.signalStrength}
                      </span>
                      <span className="text-sm text-gray-400">
                        {signal.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <span className="text-xs text-gray-400">Trigger Value</span>
                      <p className="text-white font-medium">{signal.triggerValue}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Market Price</span>
                      <p className="text-white font-medium">{signal.marketPrice}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Confidence</span>
                      <p className="text-white font-medium">{signal.confidence}%</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs text-gray-400">Message</span>
                    <p className="text-white text-sm">{signal.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 