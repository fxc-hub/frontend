'use client'

import React from 'react';
import EnhancedTradingViewWidget from './EnhancedTradingViewWidget';

// Legacy wrapper for backward compatibility
function TradingViewWidget() {
  return (
    <EnhancedTradingViewWidget 
      symbol="FX:EURUSD"
      theme="dark"
      height="100%"
      showControls={true}
    />
  );
}

export default TradingViewWidget; 