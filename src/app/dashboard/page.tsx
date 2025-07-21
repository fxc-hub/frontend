'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CreditCardIcon, 
  UserIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightOnRectangleIcon,
  CogIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import TradingDashboard from '@/components/TradingDashboard'
import HelpAccordion from '@/components/HelpAccordion'
import SubscriptionStatusBadge from '@/components/SubscriptionStatusBadge'
import SubscriptionHistoryTable from '@/components/SubscriptionHistoryTable'
import PaymentHistoryTable from '@/components/PaymentHistoryTable'
import { getStatusColor } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  trial_days: number;
  grace_days: number;
  features: string[];
  is_active: boolean;
}

interface Subscription {
  id: number;
  plan_id: number;
  status: string;
  started_at: string;
  trial_ends_at?: string;
  ends_at: string;
  grace_ends_at?: string;
  auto_renew: boolean;
  amount_paid: number;
  currency: string;
  is_trial?: boolean;
  is_grace?: boolean;
  plan: Plan;
}

interface Payment {
  id: number;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  payment_provider: string;
  payment_reference: string;
  paid_at?: string;
  description?: string;
}

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
  plan?: Plan;
  subscription: {
    is_active: boolean;
    is_expired: boolean;
    is_trial: boolean;
    is_grace: boolean;
    remaining_days: number;
    ends_at: string;
    trial_ends_at?: string;
    grace_ends_at?: string;
    active_subscription?: Subscription;
  };
  payment_info?: {
    payment_method?: string;
    payment_provider?: string;
    last_payment_at?: string;
    last_payment_amount?: number;
  };
}

export default function DashboardPage() {
  const { user: authUser, token, logout: authLogout, isInitialized } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<Subscription[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [error, setError] = useState('');
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showHelp, setShowHelp] = useState(false);
  const router = useRouter();

  // Hydration check
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth check and data fetch
  useEffect(() => {
    if (!isMounted || !isInitialized) return;
    
    console.log('Dashboard: Auth check', { 
      isMounted, 
      isInitialized,
      authUser: authUser ? 'exists' : 'null', 
      token: token ? 'exists' : 'null',
      hasCheckedAuth
    });
    
    // Only redirect if we've checked auth and user/token are missing
    if (isMounted && isInitialized && hasCheckedAuth && (!authUser || !token)) {
      console.log('Dashboard: Redirecting to home - missing auth data');
      router.push('/');
      return;
    }
    
    // Mark that we've checked auth
    if (isMounted && isInitialized && !hasCheckedAuth) {
      setHasCheckedAuth(true);
    }
    
    if (!token) {
      console.log('Dashboard: No token, skipping data fetch');
      return;
    }
    
    console.log('Dashboard: Fetching data with token');
    fetchUserData();
    fetchPlans();
    fetchSubscriptionHistory();
    fetchPaymentHistory();
  }, [isMounted, isInitialized, authUser, token, hasCheckedAuth, router]);

  const fetchUserData = async () => {
    if (!token) return;
    try {
      const data = await api<{ data: UserProfile }>('/api/user/profile', 'GET', undefined, token);
      setUser(data.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        await authLogout();
        router.push('/');
        return;
      }
      setError('Failed to fetch user data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const data = await api<{ data: Plan[] }>('/api/plans', 'GET');
      setAvailablePlans(data.data);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    }
  };

  const fetchSubscriptionHistory = async () => {
    if (!token) return;
    try {
      const data = await api<{ data: { subscription_history: Subscription[] } }>(
        '/api/subscriptions/my-subscription',
        'GET',
        undefined,
        token
      );
      setSubscriptionHistory(data.data.subscription_history || []);
    } catch (err) {
      console.error('Failed to fetch subscription history:', err);
    }
  };

  const fetchPaymentHistory = async () => {
    if (!token) return;
    try {
      const data = await api<{ data: { data: Payment[] } }>(
        '/api/subscriptions/payment-history',
        'GET',
        undefined,
        token
      );
      setPaymentHistory(data.data.data || []);
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
    }
  };

  const handleLogout = async () => {
    await authLogout();
    router.push('/');
  };

  const handleSubscribe = async (planId: string) => {
    if (!token) return;
    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId })
      });
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.paymentUrl;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create subscription');
      }
    } catch (err) {
      setError('An error occurred while creating subscription');
    }
  };

  // Show loading while hydrating or checking authentication
  if (!isMounted || !isInitialized || (!hasCheckedAuth && (!authUser || !token))) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show loading while fetching dashboard data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-white">FXCHUB</h1>
              <nav className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-blue-400 font-medium">
                  Dashboard
                </Link>
                {/* <Link href="/marketplace" className="text-gray-300 hover:text-white transition-colors">
                  Marketplace
                </Link> */}
                <Link href="/scanners" className="text-gray-300 hover:text-white transition-colors">
                  Scanners
                </Link>
                <Link href="/economic-news" className="text-gray-300 hover:text-white transition-colors">
                  Economic News
                </Link>
                <Link href="/alerts" className="text-gray-300 hover:text-white transition-colors">
                  Alert
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.first_name}!</span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Help Toggle Button */}
      <div className="fixed top-20 right-4 z-50">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Toggle Help"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="fixed top-32 right-4 w-96 z-40 max-h-[80vh] overflow-y-auto bg-gray-900 rounded-xl shadow-lg p-4">
          <HelpAccordion
            title="Dashboard Help"
            items={[
              {
                id: 'dashboard-overview',
                title: 'Dashboard Overview',
                type: 'info',
                content: 'Your trading dashboard provides real-time market data, portfolio insights, and trading tools. Switch between Account Overview and Trading Dashboard to access different features.'
              },
              {
                id: 'account-features',
                title: 'Account Features',
                type: 'help',
                content: 'View your profile information, subscription status, and quick access to trading tools. Monitor your account status, membership details, and manage your subscription.'
              },
              {
                id: 'trading-dashboard',
                title: 'What is the Trading Dashboard?',
                type: 'info',
                content: `The Trading Dashboard is your command center for trading. Here you can:
- View real-time market charts and data
- Analyze price movements and trends
- Access your portfolio and performance analytics
- Use advanced trading tools and indicators
- Monitor and manage your trades

It is designed to help you make informed trading decisions quickly and efficiently.`
              },
              {
                id: 'trading-dashboard-how',
                title: 'How to Use the Trading Dashboard',
                type: 'tip',
                content: `1. Select the 'Trading Dashboard' tab at the top of the page.
2. Use the interactive charts to analyze currency pairs and market trends.
3. Add or remove indicators to customize your analysis.
4. Review your portfolio performance and open trades (if available).
5. Use the available tools to set alerts, draw on charts, or test strategies.
6. Explore different timeframes and chart types for deeper insights.

Tip: Hover over chart elements for more details, and use the help button anytime for guidance!`
              },
              {
                id: 'trading-tools',
                title: 'Trading Tools & Scanners',
                type: 'tip',
                content: 'Access advanced market scanners to identify trading opportunities. Use the marketplace to discover indicators and economic news for market insights.'
              },
              {
                id: 'subscription-plans',
                title: 'Subscription Plans',
                type: 'warning',
                content: 'Different plans offer varying features. Free plans have limited access, while premium plans unlock advanced analytics, real-time data, and professional tools.'
              }
            ]}
            defaultOpen={['dashboard-overview', 'trading-dashboard']}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Dashboard Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-800">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-5 h-5" />
                  <span>Account Overview</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('trading')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'trading'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="w-5 h-5" />
                  <span>Trading Dashboard</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Account Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* User Profile Card */}
            <div className="bg-gray-900 rounded-xl p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-blue-600 p-3 rounded-lg mr-4">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Account Status</div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-green-400">Active</span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Member Since</div>
              <div className="text-white">
                {new Date(user?.created_at || '').toLocaleDateString()}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Phone</div>
              <div className="text-white">{user?.phone || 'Not provided'}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/scanners" className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="bg-white/20 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Trading Scanners</h3>
                <p className="text-white/70 text-sm">Advanced market analysis tools</p>
              </div>
            </div>
            <div className="text-white/60 text-sm">
              Access powerful scanning technology for enhanced trading experience →
            </div>
          </Link>

          <Link href="/education-hub" className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="bg-white/20 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Education Hub</h3>
                <p className="text-white/70 text-sm">Forex Education Portal</p>
              </div>
            </div>
            <div className="text-white/60 text-sm">
              Learn trading strategies and market analysis →
            </div>
          </Link>

          <div className="bg-gray-800 rounded-xl p-6 opacity-50">
            <div className="flex items-center mb-4">
              <div className="bg-gray-700 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-400">Community</h3>
                <p className="text-gray-500 text-sm">Coming soon</p>
              </div>
            </div>
            <div className="text-gray-500 text-sm">
              Connect with other traders and experts
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-gray-900 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Subscription</h3>
          
          {user?.subscription?.active_subscription ? (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <CreditCardIcon className="w-6 h-6 text-blue-400 mr-3" />
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      {user.subscription.active_subscription.plan?.name || 'Plan not found'}
                    </h4>
                    <p className="text-gray-400">
                      {user.subscription.active_subscription.plan?.currency || 'USD'} {user.subscription.active_subscription.plan?.price?.toLocaleString() || '0'} / {user.subscription.active_subscription.plan?.duration_days || 'unknown'} days
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.subscription.active_subscription.status)}`}>
                  {user.subscription.active_subscription.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Start Date</div>
                  <div className="text-white">
                    {new Date(user.subscription.active_subscription.started_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">End Date</div>
                  <div className="text-white">
                    {new Date(user.subscription.active_subscription.ends_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">Auto Renewal</div>
                  <div className="text-white">
                    {user.subscription.active_subscription.auto_renew ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
              
              {/* Trial/Grace Status Badge */}
              <SubscriptionStatusBadge
                isTrial={user.subscription.is_trial}
                isGrace={user.subscription.is_grace}
                trialEndsAt={user.subscription.trial_ends_at}
                graceEndsAt={user.subscription.grace_ends_at}
                remainingDays={user.subscription.remaining_days}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">
                No Active Subscription
              </h4>
              <p className="text-gray-400 mb-6">
                Choose a plan to get started with premium features
              </p>
              <button
                onClick={() => setShowSubscribeModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Choose Plan
              </button>
            </div>
          )}
        </div>

        {/* Subscription History Table */}
        <SubscriptionHistoryTable
          subscriptions={subscriptionHistory}
          getStatusColor={getStatusColor}
        />

        {/* Payment History Table */}
        <PaymentHistoryTable
          payments={paymentHistory}
          getStatusColor={getStatusColor}
        />

        {/* Subscription Modal */}
        {showSubscribeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Choose Your Plan</h3>
                <button
                  onClick={() => setShowSubscribeModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {availablePlans.map((plan, index) => (
                  <div 
                    key={plan.id} 
                    className={`bg-gray-800 rounded-lg p-6 border ${
                      index === 1 ? 'border-blue-500' : 'border-gray-700'
                    }`}
                  >
                    {index === 1 && (
                      <div className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full inline-block mb-4">
                        Most Popular
                      </div>
                    )}
                    <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
                    <div className="text-3xl font-bold text-white mb-4">
                      {plan.currency || 'USD'} {plan.price.toLocaleString()}
                      <span className="text-base text-gray-400">/{plan.duration_days} days</span>
                    </div>
                    {plan.description && (
                      <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                    )}
                    <ul className="text-gray-300 space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx}>• {feature}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleSubscribe(plan.id.toString())}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
                    >
                      Subscribe
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
          </div>
        )}

        {/* Trading Dashboard Tab */}
        {activeTab === 'trading' && (
          <div>
            <TradingDashboard />
          </div>
        )}
      </main>
    </div>
  )
} 