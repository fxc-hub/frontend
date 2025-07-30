'use client'

import React, { useState } from 'react';
import EnhancedTradingViewWidget from './EnhancedTradingViewWidget';

// Legacy wrapper for backward compatibility
function TradingViewWidget() {
  const [indicators, setIndicators] = useState<string[]>([]);

  return (
    <EnhancedTradingViewWidget 
      symbol="FX:EURUSD"
      theme="dark"
      height="100%"
      showControls={true}
      indicators={indicators}
      onIndicatorChange={setIndicators}
    />
  );
}

export default TradingViewWidget; 