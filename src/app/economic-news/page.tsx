'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDaysIcon, ClockIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, CurrencyDollarIcon, GlobeAltIcon, FunnelIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface EconomicEvent {
  id: number;
  title: string;
  country: string;
  currency: string;
  impact: 'High' | 'Medium' | 'Low';
  time: string;
  date: string;
  forecast?: string;
  previous?: string;
  actual?: string;
  description: string;
}

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  category: string;
  impact: 'Positive' | 'Negative' | 'Neutral';
  image?: string;
}

export default function EconomicNewsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'calendar' | 'news' | 'analysis'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterImpact, setFilterImpact] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [filterCurrency, setFilterCurrency] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  // Mock data for economic calendar
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([
    {
      id: 1,
      title: 'Non-Farm Payrolls',
      country: 'United States',
      currency: 'USD',
      impact: 'High',
      time: '13:30',
      date: '2024-01-05',
      forecast: '180K',
      previous: '173K',
      actual: '185K',
      description: 'Employment change in the non-farm business sector'
    },
    {
      id: 2,
      title: 'CPI (YoY)',
      country: 'United States',
      currency: 'USD',
      impact: 'High',
      time: '13:30',
      date: '2024-01-12',
      forecast: '3.1%',
      previous: '3.2%',
      description: 'Consumer Price Index year-over-year change'
    },
    {
      id: 3,
      title: 'Interest Rate Decision',
      country: 'Eurozone',
      currency: 'EUR',
      impact: 'High',
      time: '14:45',
      date: '2024-01-15',
      forecast: '4.50%',
      previous: '4.50%',
      description: 'ECB monetary policy decision'
    },
    {
      id: 4,
      title: 'GDP (QoQ)',
      country: 'United Kingdom',
      currency: 'GBP',
      impact: 'Medium',
      time: '09:30',
      date: '2024-01-16',
      forecast: '0.2%',
      previous: '0.1%',
      description: 'Quarterly GDP growth rate'
    },
    {
      id: 5,
      title: 'Retail Sales (MoM)',
      country: 'Canada',
      currency: 'CAD',
      impact: 'Medium',
      time: '13:30',
      date: '2024-01-17',
      forecast: '0.3%',
      previous: '0.2%',
      description: 'Monthly retail sales change'
    }
  ]);

  // Mock data for news
  const [newsItems, setNewsItems] = useState<NewsItem[]>([
    {
      id: 1,
      title: 'Federal Reserve Signals Potential Rate Cuts in 2024',
      summary: 'The Federal Reserve indicated a dovish shift in monetary policy, suggesting potential interest rate reductions in the coming year.',
      source: 'Reuters',
      publishedAt: '2024-01-05T10:30:00Z',
      category: 'Monetary Policy',
      impact: 'Positive',
      image: '/images/news/fed-rates.jpg'
    },
    {
      id: 2,
      title: 'Eurozone Inflation Falls Below Target',
      summary: 'Eurozone inflation dropped to 2.4% in December, below the ECB\'s 2% target, raising expectations for policy easing.',
      source: 'Bloomberg',
      publishedAt: '2024-01-04T14:15:00Z',
      category: 'Inflation',
      impact: 'Positive'
    },
    {
      id: 3,
      title: 'UK Economy Shows Signs of Recovery',
      summary: 'Recent economic data suggests the UK economy is beginning to recover from recent challenges.',
      source: 'Financial Times',
      publishedAt: '2024-01-03T09:45:00Z',
      category: 'Economic Growth',
      impact: 'Positive'
    },
    {
      id: 4,
      title: 'Oil Prices Surge on Middle East Tensions',
      summary: 'Crude oil prices jumped 5% following escalating tensions in the Middle East region.',
      source: 'CNBC',
      publishedAt: '2024-01-02T16:20:00Z',
      category: 'Commodities',
      impact: 'Negative'
    }
  ]);

  const [analysisData, setAnalysisData] = useState({
    marketSentiment: 'Bullish',
    topMovers: [
      { currency: 'EUR/USD', change: '+0.85%', direction: 'up' },
      { currency: 'GBP/USD', change: '+0.62%', direction: 'up' },
      { currency: 'USD/JPY', change: '-0.43%', direction: 'down' },
      { currency: 'USD/CAD', change: '+0.28%', direction: 'up' }
    ],
    volatilityIndex: '15.2',
    riskLevel: 'Medium'
  });

  const currencies = ['All', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF'];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-red-400 bg-red-900/20 border-red-700';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
      case 'Low': return 'text-green-400 bg-green-900/20 border-green-700';
      default: return 'text-gray-400 bg-gray-700 border-gray-600';
    }
  };

  const getNewsImpactColor = (impact: string) => {
    switch (impact) {
      case 'Positive': return 'text-green-400';
      case 'Negative': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredEvents = economicEvents.filter(event => {
    const impactMatch = filterImpact === 'All' || event.impact === filterImpact;
    const currencyMatch = filterCurrency === 'All' || event.currency === filterCurrency;
    return impactMatch && currencyMatch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-white">FXCHUB</h1>
              <nav className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/scanners" className="text-gray-300 hover:text-white transition-colors">
                  Scanners
                </Link>
                                 <Link href="/economic-news" className="text-yellow-400 font-medium">
                  Economic News
                </Link>
                <Link href="/technical-analysis" className="text-gray-300 hover:text-white transition-colors">
                  Technical Analysis
                </Link>
                <Link href="/alerts" className="text-gray-300 hover:text-white transition-colors">
                  Alerts
                </Link>
                <Link href="/marketplace" className="text-gray-300 hover:text-white transition-colors">
                  Marketplace
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Economic News & Calendar
          </h1>
          <p className="text-gray-400">
            Stay updated with the latest economic events, market news, and financial analysis
          </p>
        </div>

                {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'calendar', label: 'Economic Calendar', icon: CalendarDaysIcon },
                { id: 'news', label: 'Market News', icon: GlobeAltIcon },
                { id: 'analysis', label: 'Market Analysis', icon: ArrowTrendingUpIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-yellow-500 text-yellow-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
                        {/* Filters */}
            <div className="bg-gray-800 rounded-lg shadow p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Filters:</span>
                </div>
                
                <select
                  value={filterImpact}
                  onChange={(e) => setFilterImpact(e.target.value as any)}
                  className="px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-700 text-white"
                >
                  <option value="All">All Impact Levels</option>
                  <option value="High">High Impact</option>
                  <option value="Medium">Medium Impact</option>
                  <option value="Low">Low Impact</option>
                </select>

                <select
                  value={filterCurrency}
                  onChange={(e) => setFilterCurrency(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-700 text-white"
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>
                      {currency === 'All' ? 'All Currencies' : currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>

                        {/* Economic Events */}
            <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">
                  Economic Calendar
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Currency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Impact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Forecast
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Previous
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actual
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {filteredEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <span>{formatTime(event.time)}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDate(event.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-white">
                              {event.currency}
                            </span>
                            <span className="text-xs text-gray-400">
                              {event.country}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">
                            {event.title}
                          </div>
                          <div className="text-xs text-gray-400">
                            {event.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getImpactColor(event.impact)}`}>
                            {event.impact}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {event.forecast || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {event.previous || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {event.actual || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">
                  Latest Market News
                </h2>
              </div>
              <div className="divide-y divide-gray-700">
                {newsItems.map((news) => (
                  <div key={news.id} className="p-6 hover:bg-gray-700">
                    <div className="flex items-start space-x-4">
                      {news.image && (
                        <div className="flex-shrink-0">
                          <img
                            className="h-16 w-24 object-cover rounded-lg"
                            src={news.image}
                            alt={news.title}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getNewsImpactColor(news.impact)}`}>
                            {news.impact}
                          </span>
                          <span className="text-xs text-gray-400">
                            {news.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">
                          {news.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                          {news.summary}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{news.source}</span>
                          <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

                {activeTab === 'analysis' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Sentiment */}
            <div className="bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Market Sentiment
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Overall Sentiment</span>
                  <span className="text-sm font-medium text-green-400">
                    {analysisData.marketSentiment}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Volatility Index</span>
                  <span className="text-sm font-medium text-white">
                    {analysisData.volatilityIndex}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Risk Level</span>
                  <span className="text-sm font-medium text-yellow-400">
                    {analysisData.riskLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Movers */}
            <div className="bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Top Movers
              </h3>
              <div className="space-y-3">
                {analysisData.topMovers.map((mover, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      {mover.currency}
                    </span>
                    <div className="flex items-center space-x-2">
                      {mover.direction === 'up' ? (
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-sm font-medium ${
                        mover.direction === 'up' 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {mover.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Commentary */}
            <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Market Commentary
              </h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-400">
                  The forex market is showing increased volatility as traders digest the latest economic data. 
                  The US Dollar has been under pressure following dovish comments from Federal Reserve officials, 
                  while the Euro has gained strength on positive economic indicators from the Eurozone. 
                  Market participants are closely watching upcoming central bank meetings and key economic releases 
                  for further direction.
                </p>
                <p className="text-gray-400 mt-4">
                  Technical analysis suggests that major currency pairs are approaching key support and resistance levels, 
                  which could lead to significant breakouts in the coming sessions. Risk sentiment remains cautious 
                  as geopolitical tensions continue to influence market dynamics.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 