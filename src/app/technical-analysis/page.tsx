'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  ArrowRightOnRectangleIcon,
  CogIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral';
  strength: number; // 0-100
}

interface CurrencyPair {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  direction: 'up' | 'down';
  indicators: TechnicalIndicator[];
  overallSignal: 'buy' | 'sell' | 'neutral';
  overallStrength: number;
}

export default function TechnicalAnalysisPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');
  const [selectedPair, setSelectedPair] = useState('EURUSD');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const timeframes = ['1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W'];

  // Mock data for currency pairs with technical analysis
  const [currencyPairs, setCurrencyPairs] = useState<CurrencyPair[]>([
    {
      symbol: 'EURUSD',
      name: 'Euro / US Dollar',
      price: '1.0854',
      change: '+0.0023',
      changePercent: '+0.21%',
      direction: 'up',
      overallSignal: 'buy',
      overallStrength: 75,
      indicators: [
        { name: 'RSI', value: 65, signal: 'buy', strength: 70 },
        { name: 'MACD', value: 0.0012, signal: 'buy', strength: 80 },
        { name: 'Stochastic', value: 45, signal: 'neutral', strength: 50 },
        { name: 'Bollinger Bands', value: 1.0854, signal: 'buy', strength: 75 },
        { name: 'Moving Averages', value: 1.0840, signal: 'buy', strength: 85 },
        { name: 'Volume', value: 1250000, signal: 'buy', strength: 65 }
      ]
    },
    {
      symbol: 'GBPUSD',
      name: 'British Pound / US Dollar',
      price: '1.2654',
      change: '-0.0018',
      changePercent: '-0.14%',
      direction: 'down',
      overallSignal: 'sell',
      overallStrength: 60,
      indicators: [
        { name: 'RSI', value: 35, signal: 'sell', strength: 65 },
        { name: 'MACD', value: -0.0008, signal: 'sell', strength: 70 },
        { name: 'Stochastic', value: 25, signal: 'sell', strength: 75 },
        { name: 'Bollinger Bands', value: 1.2654, signal: 'neutral', strength: 45 },
        { name: 'Moving Averages', value: 1.2670, signal: 'sell', strength: 60 },
        { name: 'Volume', value: 980000, signal: 'neutral', strength: 50 }
      ]
    },
    {
      symbol: 'USDJPY',
      name: 'US Dollar / Japanese Yen',
      price: '148.25',
      change: '+0.45',
      changePercent: '+0.30%',
      direction: 'up',
      overallSignal: 'buy',
      overallStrength: 80,
      indicators: [
        { name: 'RSI', value: 70, signal: 'buy', strength: 75 },
        { name: 'MACD', value: 0.0025, signal: 'buy', strength: 85 },
        { name: 'Stochastic', value: 80, signal: 'buy', strength: 80 },
        { name: 'Bollinger Bands', value: 148.25, signal: 'buy', strength: 70 },
        { name: 'Moving Averages', value: 147.80, signal: 'buy', strength: 90 },
        { name: 'Volume', value: 2100000, signal: 'buy', strength: 85 }
      ]
    },
    {
      symbol: 'USDCHF',
      name: 'US Dollar / Swiss Franc',
      price: '0.8540',
      change: '-0.0012',
      changePercent: '-0.14%',
      direction: 'down',
      overallSignal: 'neutral',
      overallStrength: 45,
      indicators: [
        { name: 'RSI', value: 50, signal: 'neutral', strength: 45 },
        { name: 'MACD', value: -0.0003, signal: 'neutral', strength: 40 },
        { name: 'Stochastic', value: 55, signal: 'neutral', strength: 50 },
        { name: 'Bollinger Bands', value: 0.8540, signal: 'neutral', strength: 45 },
        { name: 'Moving Averages', value: 0.8545, signal: 'neutral', strength: 40 },
        { name: 'Volume', value: 750000, signal: 'neutral', strength: 50 }
      ]
    }
  ]);

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return 'text-green-400';
      case 'sell': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSignalBgColor = (signal: string) => {
    switch (signal) {
      case 'buy': return 'bg-green-900/20 border-green-700';
      case 'sell': return 'bg-red-900/20 border-red-700';
      default: return 'bg-gray-700 border-gray-600';
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-green-400';
    if (strength >= 60) return 'text-yellow-400';
    if (strength >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getGaugeColor = (strength: number) => {
    if (strength >= 80) return '#10B981'; // green-500
    if (strength >= 60) return '#F59E0B'; // yellow-500
    if (strength >= 40) return '#F97316'; // orange-500
    return '#EF4444'; // red-500
  };

  const renderGauge = (strength: number, signal: 'buy' | 'sell' | 'neutral', size: 'small' | 'large' = 'large') => {
    const radius = size === 'large' ? 80 : 50;
    const strokeWidth = size === 'large' ? 12 : 8;
    const padding = strokeWidth + 10;
    const startAngle = -135;
    const endAngle = 135;
    const totalAngle = endAngle - startAngle;
    
    // Map signal to angle position
    let signalAngle;
    let arcStartAngle, arcEndAngle;
    
    switch (signal) {
      case 'buy':
        signalAngle = startAngle + (totalAngle * 0.8); // 80% of the way (strong buy area)
        arcStartAngle = startAngle + (totalAngle * 0.6); // Start arc at 60% (buy area)
        arcEndAngle = endAngle; // End at the top
        break;
      case 'sell':
        signalAngle = startAngle + (totalAngle * 0.2); // 20% of the way (strong sell area)
        arcStartAngle = startAngle; // Start arc at the bottom
        arcEndAngle = startAngle + (totalAngle * 0.4); // End at 40% (sell area)
        break;
      case 'neutral':
      default:
        signalAngle = startAngle + (totalAngle * 0.5); // Middle (neutral area)
        arcStartAngle = startAngle + (totalAngle * 0.4); // Start arc at 40%
        arcEndAngle = startAngle + (totalAngle * 0.6); // End at 60% (neutral area)
        break;
    }
    
    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const signalRad = (signalAngle * Math.PI) / 180;
    const arcStartRad = (arcStartAngle * Math.PI) / 180;
    const arcEndRad = (arcEndAngle * Math.PI) / 180;
    
    // Calculate center with padding
    const centerX = radius + padding;
    const centerY = radius + padding;
    
    // Calculate path coordinates
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    const arcX1 = centerX + radius * Math.cos(arcStartRad);
    const arcY1 = centerY + radius * Math.sin(arcStartRad);
    const arcX2 = centerX + radius * Math.cos(arcEndRad);
    const arcY2 = centerY + radius * Math.sin(arcEndRad);
    
    // Create background arc path
    const largeArcFlag = Math.abs(endRad - startRad) > Math.PI ? 1 : 0;
    const backgroundPath = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
    
    // Create signal arc path
    const signalLargeArcFlag = Math.abs(arcEndRad - arcStartRad) > Math.PI ? 1 : 0;
    const signalPath = `M ${arcX1} ${arcY1} A ${radius} ${radius} 0 ${signalLargeArcFlag} 1 ${arcX2} ${arcY2}`;
    
    // Calculate needle position based on signal
    const needleX = centerX + (radius - 10) * Math.cos(signalRad);
    const needleY = centerY + (radius - 10) * Math.sin(signalRad);
    
    // Determine signal text and color based on signal
    let signalText = '';
    let signalColor = '';
    switch (signal) {
      case 'buy':
        signalText = strength >= 80 ? 'Strong Buy' : 'Buy';
        signalColor = '#10B981'; // green
        break;
      case 'sell':
        signalText = strength <= 20 ? 'Strong Sell' : 'Sell';
        signalColor = '#EF4444'; // red
        break;
      case 'neutral':
      default:
        signalText = 'Neutral';
        signalColor = '#F59E0B'; // yellow
        break;
    }

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          className={`${size === 'large' ? 'w-48 h-40' : 'w-32 h-24'}`}
          viewBox={`0 0 ${(radius + padding) * 2} ${(radius + padding) * 2}`}
          style={{ overflow: 'visible' }}
        >
          {/* Background arc */}
          <path
            d={backgroundPath}
            stroke="#374151"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />
          
          {/* Signal arc */}
          <path
            d={signalPath}
            stroke={signalColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
          
          {/* Needle */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke="white"
            strokeWidth={size === 'large' ? 3 : 2}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
          
          {/* Needle pivot point */}
          <circle
            cx={centerX}
            cy={centerY}
            r={size === 'large' ? 4 : 3}
            fill="white"
          />
        </svg>
        
        {/* Signal text */}
        <div className="absolute bottom-0 text-center w-full">
          <div className={`font-bold ${size === 'large' ? 'text-sm' : 'text-xs'}`} style={{ color: signalColor }}>
            {signalText}
          </div>
        </div>
        
        {/* Gauge labels for large gauges */}
        {size === 'large' && (
          <>
            {/* Buy label */}
            <div className="absolute top-2 right-2 text-xs text-green-400 font-medium">
              BUY
            </div>
            {/* Sell label */}
            <div className="absolute top-2 left-2 text-xs text-red-400 font-medium">
              SELL
            </div>
            {/* Neutral label */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400 font-medium">
              NEUTRAL
            </div>
          </>
        )}
      </div>
    );
  };

  const selectedPairData = currencyPairs.find(pair => pair.symbol === selectedPair);

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
                <Link href="/economic-news" className="text-gray-300 hover:text-white transition-colors">
                  Economic News
                </Link>
                                 <Link href="/technical-analysis" className="text-yellow-400 font-medium">
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
            Technical Analysis
          </h1>
          <p className="text-gray-400">
            Advanced technical indicators and meter gauges for comprehensive market analysis
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-300">Currency Pair:</span>
              <select
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-700 text-white"
              >
                {currencyPairs.map(pair => (
                  <option key={pair.symbol} value={pair.symbol}>
                    {pair.symbol} - {pair.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-300">Timeframe:</span>
              <div className="flex space-x-2">
                {timeframes.map(tf => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                                         className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                       selectedTimeframe === tf
                         ? 'bg-yellow-600 text-white'
                         : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                     }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {selectedPairData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Gauge */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg shadow p-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {selectedPairData.symbol}
                  </h2>
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <span className="text-2xl font-bold text-white">
                      {selectedPairData.price}
                    </span>
                    <div className={`flex items-center space-x-1 ${
                      selectedPairData.direction === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedPairData.direction === 'up' ? (
                        <ArrowTrendingUpIcon className="w-5 h-5" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-5 h-5" />
                      )}
                      <span className="text-sm font-medium">
                        {selectedPairData.change} ({selectedPairData.changePercent})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-2 mb-6">
                    <span className="text-sm text-gray-400">Overall Signal:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSignalBgColor(selectedPairData.overallSignal)} ${getSignalColor(selectedPairData.overallSignal)}`}>
                      {selectedPairData.overallSignal.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {/* Main Gauge */}
                <div className="flex justify-center">
                  {renderGauge(selectedPairData.overallStrength, selectedPairData.overallSignal, 'large')}
                </div>
              </div>
            </div>

            {/* Individual Indicators */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-white mb-6">
                  Technical Indicators - {selectedTimeframe}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedPairData.indicators.map((indicator, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-white">
                            {indicator.name}
                          </h4>
                          <p className="text-xs text-gray-400">
                            Value: {typeof indicator.value === 'number' && indicator.value < 1000 ? indicator.value.toFixed(2) : indicator.value.toLocaleString()}
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSignalBgColor(indicator.signal)} ${getSignalColor(indicator.signal)}`}>
                          {indicator.signal.toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Small Gauge */}
                      <div className="flex justify-center">
                        {renderGauge(indicator.strength, indicator.signal, 'small')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Pairs Overview */}
        <div className="mt-8">
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              All Currency Pairs Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currencyPairs.map((pair) => (
                <div 
                  key={pair.symbol} 
                                     className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-600 ${
                     selectedPair === pair.symbol ? 'ring-2 ring-yellow-500' : ''
                   }`}
                  onClick={() => setSelectedPair(pair.symbol)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-white">
                      {pair.symbol}
                    </h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSignalBgColor(pair.overallSignal)} ${getSignalColor(pair.overallSignal)}`}>
                      {pair.overallSignal.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-white">{pair.price}</span>
                    <div className={`flex items-center space-x-1 text-xs ${
                      pair.direction === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {pair.direction === 'up' ? (
                        <ArrowTrendingUpIcon className="w-3 h-3" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-3 h-3" />
                      )}
                      <span>{pair.changePercent}</span>
                    </div>
                  </div>
                  
                  {/* Small Gauge */}
                  <div className="flex justify-center">
                    {renderGauge(pair.overallStrength, pair.overallSignal, 'small')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 