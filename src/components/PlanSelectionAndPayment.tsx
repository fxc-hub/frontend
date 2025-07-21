'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCardIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import { usePaymentGateways } from '@/hooks/usePaymentGateways'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  duration: string
  features: string[] | string
  isActive: boolean
  createdAt: string
}

const PlanSelectionAndPayment = () => {
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [selectedGateway, setSelectedGateway] = useState<any>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentStep, setCurrentStep] = useState<'plans' | 'payment' | 'processing'>('plans')

  const {
    gateways: paymentGateways,
    isLoading: gatewaysLoading,
    getGatewayIcon,
    getCompatibleGateways,
    calculateProcessingFee,
    getPaymentMethods
  } = usePaymentGateways()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setIsLoading(true)
      const response = await api('/api/plans')
      setPlans(response.data || [])
    } catch (err: any) {
      setError('Failed to load plans')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan)
    setSelectedGateway(null)
    setSelectedPaymentMethod('')
    setCurrentStep('payment')
    setError('')
  }

  const handleGatewaySelect = (gateway: any) => {
    setSelectedGateway(gateway)
    setSelectedPaymentMethod('')
    setError('')
  }

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId)
    setError('')
  }

  const isGatewayCompatible = (gateway: any, plan: Plan) => {
    return gateway.supported_currencies.includes(plan.currency) &&
           plan.price >= gateway.min_amount &&
           plan.price <= gateway.max_amount
  }

  const getCompatibleGatewaysForPlan = (plan: Plan) => {
    return paymentGateways.filter(gateway => isGatewayCompatible(gateway, plan))
  }

  const handleSubscribe = async () => {
    if (!selectedPlan || !selectedGateway || !selectedPaymentMethod) {
      setError('Please select a plan, payment gateway, and payment method')
      return
    }

    try {
      setIsProcessing(true)
      setError('')
      setCurrentStep('processing')

      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to subscribe')
        return
      }

      const response = await api('/api/subscribe', 'POST', {
        plan_id: selectedPlan.id,
        payment_method: selectedPaymentMethod,
        payment_provider: selectedGateway.gateway.toLowerCase(),
        auto_renew: true
      }, token)

      if (response.data?.payment_url) {
        // Redirect to payment gateway
        window.location.href = response.data.payment_url
      } else {
        setSuccess('Subscription created successfully! Please check your email for payment instructions.')
        setCurrentStep('plans')
        setSelectedPlan(null)
        setSelectedGateway(null)
        setSelectedPaymentMethod('')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create subscription')
      setCurrentStep('payment')
    } finally {
      setIsProcessing(false)
    }
  }

  const goBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('plans')
      setSelectedPlan(null)
      setSelectedGateway(null)
      setSelectedPaymentMethod('')
    } else if (currentStep === 'processing') {
      setCurrentStep('payment')
    }
    setError('')
  }

  if (isLoading || gatewaysLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading plans and payment options...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h1>
          <p className="text-gray-400">Select a plan and payment method to get started</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${currentStep === 'plans' ? 'text-blue-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === 'plans' ? 'border-blue-400 bg-blue-400/10' : 'border-gray-500'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Select Plan</span>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-gray-500" />
            <div className={`flex items-center ${currentStep === 'payment' || currentStep === 'processing' ? 'text-blue-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === 'payment' || currentStep === 'processing' ? 'border-blue-400 bg-blue-400/10' : 'border-gray-500'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Payment</span>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <XCircleIcon className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
              <p className="text-green-400">{success}</p>
            </div>
          </div>
        )}

        {/* Step 1: Plan Selection */}
        {currentStep === 'plans' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-colors">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-white mb-1">
                    {plan.currency} {plan.price.toLocaleString()}
                    <span className="text-sm text-gray-400">/{plan.duration.toLowerCase()}</span>
                  </div>
                  {plan.description && (
                    <p className="text-gray-400 text-sm">{plan.description}</p>
                  )}
                </div>

                <div className="mb-6">
                  <div className="text-sm text-gray-400 mb-3">Features:</div>
                  <ul className="space-y-2">
                    {(() => {
                      let featuresArray: string[] = [];
                      if (plan.features) {
                        if (typeof plan.features === 'string') {
                          try {
                            featuresArray = JSON.parse(plan.features);
                          } catch {
                            featuresArray = [plan.features];
                          }
                        } else if (Array.isArray(plan.features)) {
                          featuresArray = plan.features;
                        }
                      }
                      return featuresArray.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start text-sm text-gray-300">
                          <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ));
                    })()}
                  </ul>
                </div>

                <button
                  onClick={() => handlePlanSelect(plan)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Select Plan
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Payment Selection */}
        {currentStep === 'payment' && selectedPlan && (
          <div className="max-w-4xl mx-auto">
            {/* Selected Plan Summary */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedPlan.name}</h3>
                  <p className="text-gray-400">{selectedPlan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {selectedPlan.currency} {selectedPlan.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">/{selectedPlan.duration.toLowerCase()}</div>
                </div>
              </div>
            </div>

            {/* Payment Gateway Selection */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Select Payment Gateway</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCompatibleGatewaysForPlan(selectedPlan).map((gateway) => (
                  <div
                    key={gateway.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedGateway?.id === gateway.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => handleGatewaySelect(gateway)}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">{getGatewayIcon(gateway.gateway)}</span>
                      <div>
                        <div className="font-medium text-white">{gateway.display_name}</div>
                        <div className="text-sm text-gray-400">{gateway.description}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      <div>Fee: {gateway.processing_fee}%</div>
                      <div>Supported: {gateway.supported_currencies.join(', ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            {selectedGateway && (
              <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Select Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getPaymentMethods(selectedGateway.gateway).map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{method.icon}</span>
                        <div>
                          <div className="font-medium text-white">{method.name}</div>
                          <div className="text-sm text-gray-400">{method.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Summary */}
            {selectedGateway && selectedPaymentMethod && (
              <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan Price:</span>
                    <span className="text-white">{selectedPlan.currency} {selectedPlan.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Processing Fee ({selectedGateway.processing_fee}%):</span>
                    <span className="text-white">
                      {selectedPlan.currency} {calculateProcessingFee(selectedPlan.price, selectedGateway.processing_fee).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-white">Total:</span>
                      <span className="text-lg font-bold text-white">
                        {selectedPlan.currency} {(selectedPlan.price + calculateProcessingFee(selectedPlan.price, selectedGateway.processing_fee)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={goBack}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Back to Plans
              </button>
              <button
                onClick={handleSubscribe}
                disabled={!selectedGateway || !selectedPaymentMethod}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {currentStep === 'processing' && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-white mb-2">Processing Payment</h3>
              <p className="text-gray-400 mb-6">Please wait while we redirect you to the payment gateway...</p>
              <button
                onClick={goBack}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlanSelectionAndPayment 