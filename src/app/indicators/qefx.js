// Import necessary functions from the technicalindicators library
// You need to install this library: npm install technicalindicators
const {
  EMA,
  RSI,
  ATR,
  SMA,
  StdDev,
  WMA,
  TrueRange
} = require('technicalindicators');

/**
 * Calculates the Quantum Edge FX [Pro] indicator signals based on provided OHLC data and parameters.
 *
 * @param {Array<Object>} candles - An array of candle objects, each with 'open', 'high', 'low', 'close' properties.
 * Optionally, a 'timestamp' property can be included for output.
 * @param {Object} options - Configuration options for the indicator.
 * @param {number} [options.length=14] - Base Sensitivity (Pine Script 'length').
 * @param {number} [options.predictiveLength=28] - Predictive Strength (Pine Script 'predictiveLength').
 * @param {number} [options.volatilityThreshold=0.75] - Volatility Threshold (Pine Script 'volatilityThreshold').
 * @param {number} [options.smoothFactor=2.0] - Smoothing Factor (Pine Script 'smoothFactor').
 * @param {boolean} [options.useAdaptive=true] - Whether to use Adaptive Sensitivity (Pine Script 'useAdaptive').
 * @param {boolean} [options.showZones=true] - Whether to show Trading Zones (Pine Script 'showZones').
 * @param {boolean} [options.showSignals=true] - Whether to show Entry/Exit Signals (Pine Script 'showSignals').
 * @returns {Array<Object>} An array of objects, where each object contains the calculated
 * indicator values and signals for a corresponding bar.
 */
function calculateQuantumEdgeFX(candles, options = {}) {
  // === Input Parameters ===
  const length = options.length !== undefined ? options.length : 14;
  const predictiveLength = options.predictiveLength !== undefined ? options.predictiveLength : 28;
  const volatilityThreshold = options.volatilityThreshold !== undefined ? options.volatilityThreshold : 0.75;
  const smoothFactor = options.smoothFactor !== undefined ? options.smoothFactor : 2.0;
  const useAdaptive = options.useAdaptive !== undefined ? options.useAdaptive : true;
  const showZones = options.showZones !== undefined ? options.showZones : true;
  const showSignals = options.showSignals !== undefined ? options.showSignals : true;

  // Extract close prices for calculations
  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);

  // Pre-calculate necessary base indicators
  const rsi5 = RSI.calculate({ period: 5, values: closes });
  const atr14 = ATR.calculate({ period: 14, high: highs, low: lows, close: closes });
  const atr20SMA = SMA.calculate({ period: 20, values: atr14 });

  // --- Helper function for Pine Script's crossover/crossunder ---
  const crossover = (series1, series2, index) => {
    if (index < 1) return false;
    return series1[index] > series2[index] && series1[index - 1] <= series2[index - 1];
  };

  const crossunder = (series1, series2, index) => {
    if (index < 1) return false;
    return series1[index] < series2[index] && series1[index - 1] >= series2[index - 1];
  };

  // Array to store results for each bar
  const results = [];

  // Iterate through the candles to calculate indicators bar by bar
  // Start from an index where all required lookback periods are met
  const minBarsRequired = Math.max(
    length,
    predictiveLength,
    14, // ATR length
    20  // SMA of ATR length
  );

  if (candles.length < minBarsRequired) {
    console.warn(`Not enough data. Requires at least ${minBarsRequired} bars.`);
    return [];
  }

  // Arrays to store intermediate indicator values for subsequent calculations
  const momentumValues = [];
  const normalizedMomentumValues = [];
  const predictiveWaveValues = [];
  const predictiveWaveSmoothedValues = [];
  const quantumEdgeValues = [];
  const quantumEdgeSmoothedValues = [];
  const trendDirectionValues = [];
  const trendStrengthValues = [];
  const upperZoneValues = [];
  const lowerZoneValues = [];

  for (let i = 0; i < candles.length; i++) {
    const bar = candles[i];
    const prevBar = candles[i - 1]; // For accessing close[finalLength]

    // Initialize current bar's result object
    const currentResult = {
      timestamp: bar.timestamp, // Assuming timestamp exists
      quantumEdgeSmoothed: null,
      trendDirection: null,
      buySignal: false,
      sellSignal: false,
      zoneColor: null,
      upperZone: null,
      lowerZone: null
    };

    // Skip calculations if not enough historical data for the current bar
    if (i < minBarsRequired - 1) {
      results.push(currentResult);
      continue;
    }

    // === Adaptive Sensitivity Calculation ===
    // RSI is calculated for the current bar's index relative to its series
    const currentRSI5 = rsi5[i - (5 - 1)]; // Adjust index for RSI array
    const adaptiveLength = (currentRSI5 / 10) * length;
    const finalLength = useAdaptive ? Math.round(adaptiveLength) : length;

    // Ensure finalLength is at least 1 for calculations
    const effectiveFinalLength = Math.max(1, finalLength);

    // === Core Momentum Calculation with Triple Smoothing ===
    let momentum = null;
    let normalizedMomentum = null;

    if (i >= effectiveFinalLength) {
      const closeMinusPrevClose = bar.close - closes[i - effectiveFinalLength];
      momentumValues.push(closeMinusPrevClose);

      // Triple EMA smoothing of momentum
      // Need enough values in momentumValues for EMA calculation
      if (momentumValues.length >= effectiveFinalLength) {
        const ema1 = EMA.calculate({ period: effectiveFinalLength, values: momentumValues });
        if (ema1.length > 0) {
          const ema2 = EMA.calculate({ period: Math.round(effectiveFinalLength / 2), values: ema1 });
          if (ema2.length > 0) {
            const ema3 = EMA.calculate({ period: Math.round(effectiveFinalLength / 2), values: ema2 });
            if (ema3.length > 0) {
              momentum = ema3[ema3.length - 1];
            }
          }
        }
      }

      if (momentum !== null) {
        // Normalized Momentum
        const absMomentumValues = momentumValues.map(Math.abs);
        const emaAbsMomentum = EMA.calculate({ period: effectiveFinalLength, values: absMomentumValues });
        const currentEmaAbsMomentum = emaAbsMomentum[emaAbsMomentum.length - 1];

        if (currentEmaAbsMomentum !== undefined && currentEmaAbsMomentum !== 0) {
          normalizedMomentum = (momentum / currentEmaAbsMomentum) * 100;
        } else {
          normalizedMomentum = 0; // Handle division by zero
        }
      }
    }
    normalizedMomentumValues.push(normalizedMomentum); // Store for predictive wave

    // === Predictive Wave Calculation ===
    let predictiveWave = null;
    let predictiveWaveSmoothed = null;

    if (normalizedMomentum !== null && normalizedMomentumValues.length >= predictiveLength) {
      // ta.vwma(normalizedMomentum, predictiveLength) is interpreted as WMA here
      const wmaPredictive = WMA.calculate({ period: predictiveLength, values: normalizedMomentumValues });
      predictiveWave = wmaPredictive[wmaPredictive.length - 1];
    }
    predictiveWaveValues.push(predictiveWave); // Store for smoothing

    if (predictiveWave !== null && predictiveWaveValues.length >= Math.round(predictiveLength / smoothFactor)) {
      const emaPredictiveSmoothed = EMA.calculate({ period: Math.round(predictiveLength / smoothFactor), values: predictiveWaveValues });
      predictiveWaveSmoothed = emaPredictiveSmoothed[emaPredictiveSmoothed.length - 1];
    }
    predictiveWaveSmoothedValues.push(predictiveWaveSmoothed); // Store for quantum edge

    // === Volatility Adaptive Filter ===
    const currentAtr = atr14[i - (14 - 1)]; // Adjust index for ATR array
    const currentAtr20SMA = atr20SMA[i - (20 - 1)]; // Adjust index for SMA of ATR array

    let volatilityRatio = 0;
    if (currentAtr20SMA !== undefined && currentAtr20SMA !== 0) {
      volatilityRatio = currentAtr / currentAtr20SMA;
    }

    const volatilityFilter = volatilityRatio > volatilityThreshold ? 1 : 0;

    // === Quantum Edge Calculation ===
    let quantumEdge = null;
    let quantumEdgeSmoothed = null;

    if (normalizedMomentum !== null && predictiveWaveSmoothed !== null) {
      const quantumEdgeSource = normalizedMomentum * volatilityFilter + predictiveWaveSmoothed;
      quantumEdgeValues.push(quantumEdgeSource);

      if (quantumEdgeValues.length >= 5) {
        const emaQuantumEdge = EMA.calculate({ period: 5, values: quantumEdgeValues });
        quantumEdge = emaQuantumEdge[emaQuantumEdge.length - 1];
      }
    }
    quantumEdgeValues.push(quantumEdge); // Store for smoothing

    if (quantumEdge !== null && quantumEdgeValues.length >= 3) {
      const emaQuantumEdgeSmoothed = EMA.calculate({ period: 3, values: quantumEdgeValues });
      quantumEdgeSmoothed = emaQuantumEdgeSmoothed[emaQuantumEdgeSmoothed.length - 1];
    }
    quantumEdgeSmoothedValues.push(quantumEdgeSmoothed); // Store for trend direction/strength

    currentResult.quantumEdgeSmoothed = quantumEdgeSmoothed;

    // === Trend Direction and Strength ===
    let trendDirection = null;
    let trendStrength = null;

    if (quantumEdgeSmoothed !== null && quantumEdgeSmoothedValues.length >= 9) {
      const emaTrendDirection = EMA.calculate({ period: 9, values: quantumEdgeSmoothedValues });
      trendDirection = emaTrendDirection[emaTrendDirection.length - 1];
    }
    trendDirectionValues.push(trendDirection); // Store for signals

    currentResult.trendDirection = trendDirection;

    if (quantumEdgeSmoothed !== null && prevBar && quantumEdgeSmoothedValues.length >= 14) {
      // Calculate absolute difference for trend strength
      const absDiffs = [];
      for (let k = 1; k < quantumEdgeSmoothedValues.length; k++) {
        absDiffs.push(Math.abs(quantumEdgeSmoothedValues[k] - quantumEdgeSmoothedValues[k - 1]));
      }

      if (absDiffs.length >= 14) {
        const emaTrendStrength = EMA.calculate({ period: 14, values: absDiffs });
        trendStrength = emaTrendStrength[emaTrendStrength.length - 1];
      }
    }
    trendStrengthValues.push(trendStrength); // Store for signals

    // === Signal Generation ===
    let buySignal = false;
    let sellSignal = false;

    if (quantumEdgeSmoothed !== null && trendDirection !== null && trendStrength !== null && trendStrength > 20) {
      buySignal = crossover(quantumEdgeSmoothedValues, trendDirectionValues, quantumEdgeSmoothedValues.length - 1);
      sellSignal = crossunder(quantumEdgeSmoothedValues, trendDirectionValues, quantumEdgeSmoothedValues.length - 1);
    }

    currentResult.buySignal = showSignals && buySignal;
    currentResult.sellSignal = showSignals && sellSignal;

    // === Zone Calculation ===
    let upperZone = null;
    let lowerZone = null;

    if (quantumEdgeSmoothed !== null && quantumEdgeSmoothedValues.length >= 14) {
      const emaForZones = EMA.calculate({ period: 14, values: quantumEdgeSmoothedValues });
      const currentEmaForZones = emaForZones[emaForZones.length - 1];

      const stdevForZones = StdDev.calculate({ period: 14, values: quantumEdgeSmoothedValues });
      const currentStdevForZones = stdevForZones[stdevForZones.length - 1];

      if (currentEmaForZones !== undefined && currentStdevForZones !== undefined) {
        upperZone = currentEmaForZones + (currentStdevForZones * 1.5);
        lowerZone = currentEmaForZones - (currentStdevForZones * 1.5);
      }
    }
    upperZoneValues.push(upperZone);
    lowerZoneValues.push(lowerZone);

    currentResult.upperZone = upperZone;
    currentResult.lowerZone = lowerZone;

    // === Visualization (Zone Color) ===
    if (showZones && quantumEdgeSmoothed !== null && upperZone !== null && lowerZone !== null) {
      if (quantumEdgeSmoothed > upperZone) {
        currentResult.zoneColor = 'green'; // Represents color.new(color.green, 90)
      } else if (quantumEdgeSmoothed < lowerZone) {
        currentResult.zoneColor = 'red'; // Represents color.new(color.red, 90)
      } else {
        currentResult.zoneColor = 'blue'; // Represents color.new(color.blue, 90)
      }
    }

    results.push(currentResult);
  }

  return results;
}

// --- Example Usage ---
// This is sample data. In a real application, you would fetch this from an API or file.
// Ensure you have enough data points for the calculations (e.g., at least 100-200 bars for robust results).
const sampleCandleData = [
  // Example structure: { open: 10, high: 12, low: 9, close: 11, timestamp: '...' }
  // ... Add many more historical candle data objects here ...
  { open: 100, high: 105, low: 98, close: 103, timestamp: '2023-01-01T00:00:00Z' },
  { open: 103, high: 106, low: 101, close: 104, timestamp: '2023-01-01T01:00:00Z' },
  { open: 104, high: 107, low: 102, close: 105, timestamp: '2023-01-01T02:00:00Z' },
  { open: 105, high: 108, low: 103, close: 106, timestamp: '2023-01-01T03:00:00Z' },
  { open: 106, high: 109, low: 104, close: 107, timestamp: '2023-01-01T04:00:00Z' },
  { open: 107, high: 110, low: 105, close: 108, timestamp: '2023-01-01T05:00:00Z' },
  { open: 108, high: 111, low: 106, close: 109, timestamp: '2023-01-01T06:00:00Z' },
  { open: 109, high: 112, low: 107, close: 110, timestamp: '2023-01-01T07:00:00Z' },
  { open: 110, high: 113, low: 108, close: 111, timestamp: '2023-01-01T08:00:00Z' },
  { open: 111, high: 114, low: 109, close: 112, timestamp: '2023-01-01T09:00:00Z' },
  { open: 112, high: 115, low: 110, close: 113, timestamp: '2023-01-01T10:00:00Z' },
  { open: 113, high: 116, low: 111, close: 114, timestamp: '2023-01-01T11:00:00Z' },
  { open: 114, high: 117, low: 112, close: 115, timestamp: '2023-01-01T12:00:00Z' },
  { open: 115, high: 118, low: 113, close: 116, timestamp: '2023-01-01T13:00:00Z' },
  { open: 116, high: 119, low: 114, close: 117, timestamp: '2023-01-01T14:00:00Z' },
  { open: 117, high: 120, low: 115, close: 118, timestamp: '2023-01-01T15:00:00Z' },
  { open: 118, high: 121, low: 116, close: 119, timestamp: '2023-01-01T16:00:00Z' },
  { open: 119, high: 122, low: 117, close: 120, timestamp: '2023-01-01T17:00:00Z' },
  { open: 120, high: 123, low: 118, close: 121, timestamp: '2023-01-01T18:00:00Z' },
  { open: 121, high: 124, low: 119, close: 122, timestamp: '2023-01-01T19:00:00Z' },
  { open: 122, high: 125, low: 120, close: 123, timestamp: '2023-01-01T20:00:00Z' },
  { open: 123, high: 126, low: 121, close: 124, timestamp: '2023-01-01T21:00:00Z' },
  { open: 124, high: 127, low: 122, close: 125, timestamp: '2023-01-01T22:00:00Z' },
  { open: 125, high: 128, low: 123, close: 126, timestamp: '2023-01-01T23:00:00Z' },
  { open: 126, high: 129, low: 124, close: 127, timestamp: '2023-01-02T00:00:00Z' },
  { open: 127, high: 130, low: 125, close: 128, timestamp: '2023-01-02T01:00:00Z' },
  { open: 128, high: 131, low: 126, close: 129, timestamp: '2023-01-02T02:00:00Z' },
  { open: 129, high: 132, low: 127, close: 130, timestamp: '2023-01-02T03:00:00Z' },
  { open: 130, high: 133, low: 128, close: 131, timestamp: '2023-01-02T04:00:00Z' },
  { open: 131, high: 134, low: 129, close: 132, timestamp: '2023-01-02T05:00:00Z' },
  { open: 132, high: 135, low: 130, close: 133, timestamp: '2023-01-02T06:00:00Z' },
  { open: 133, high: 136, low: 131, close: 134, timestamp: '2023-01-02T07:00:00Z' },
  { open: 134, high: 137, low: 132, close: 135, timestamp: '2023-01-02T08:00:00Z' },
  { open: 135, high: 138, low: 133, close: 136, timestamp: '2023-01-02T09:00:00Z' },
  { open: 136, high: 139, low: 134, close: 137, timestamp: '2023-01-02T10:00:00Z' },
  { open: 137, high: 140, low: 135, close: 138, timestamp: '2023-01-02T11:00:00Z' },
  { open: 138, high: 141, low: 136, close: 139, timestamp: '2023-01-02T12:00:00Z' },
  { open: 139, high: 142, low: 137, close: 140, timestamp: '2023-01-02T13:00:00Z' },
  { open: 140, high: 143, low: 138, close: 141, timestamp: '2023-01-02T14:00:00Z' },
  { open: 141, high: 144, low: 139, close: 142, timestamp: '2023-01-02T15:00:00Z' },
  { open: 142, high: 145, low: 140, close: 143, timestamp: '2023-01-02T16:00:00Z' },
  { open: 143, high: 146, low: 141, close: 144, timestamp: '2023-01-02T17:00:00Z' },
  { open: 144, high: 147, low: 142, close: 145, timestamp: '2023-01-02T18:00:00Z' },
  { open: 145, high: 148, low: 143, close: 146, timestamp: '2023-01-02T19:00:00Z' },
  { open: 146, high: 149, low: 144, close: 147, timestamp: '2023-01-02T20:00:00Z' },
  { open: 147, high: 150, low: 145, close: 148, timestamp: '2023-01-02T21:00:00Z' },
  { open: 148, high: 151, low: 146, close: 149, timestamp: '2023-01-02T22:00:00Z' },
  { open: 149, high: 152, low: 147, close: 150, timestamp: '2023-01-02T23:00:00Z' },
  { open: 150, high: 153, low: 148, close: 151, timestamp: '2023-01-03T00:00:00Z' },
  { open: 151, high: 154, low: 149, close: 152, timestamp: '2023-01-03T01:00:00Z' },
  { open: 152, high: 155, low: 150, close: 153, timestamp: '2023-01-03T02:00:00Z' },
  { open: 153, high: 156, low: 151, close: 154, timestamp: '2023-01-03T03:00:00Z' },
  { open: 154, high: 157, low: 152, close: 155, timestamp: '2023-01-03T04:00:00Z' },
  { open: 155, high: 158, low: 153, close: 156, timestamp: '2023-01-03T05:00:00Z' },
  { open: 156, high: 159, low: 154, close: 157, timestamp: '2023-01-03T06:00:00Z' },
  { open: 157, high: 160, low: 155, close: 158, timestamp: '2023-01-03T07:00:00Z' },
  { open: 158, high: 161, low: 156, close: 159, timestamp: '2023-01-03T08:00:00Z' },
  { open: 159, high: 162, low: 157, close: 160, timestamp: '2023-01-03T09:00:00Z' },
  { open: 160, high: 163, low: 158, close: 161, timestamp: '2023-01-03T10:00:00Z' },
  { open: 161, high: 164, low: 159, close: 162, timestamp: '2023-01-03T11:00:00Z' },
  { open: 162, high: 165, low: 160, close: 163, timestamp: '2023-01-03T12:00:00Z' },
  { open: 163, high: 166, low: 161, close: 164, timestamp: '2023-01-03T13:00:00Z' },
  { open: 164, high: 167, low: 162, close: 165, timestamp: '2023-01-03T14:00:00Z' },
  { open: 165, high: 168, low: 163, close: 166, timestamp: '2023-01-03T15:00:00Z' },
  { open: 166, high: 169, low: 164, close: 167, timestamp: '2023-01-03T16:00:00Z' },
  { open: 167, high: 170, low: 165, close: 168, timestamp: '2023-01-03T17:00:00Z' },
  { open: 168, high: 171, low: 166, close: 169, timestamp: '2023-01-03T18:00:00Z' },
  { open: 169, high: 172, low: 167, close: 170, timestamp: '2023-01-03T19:00:00Z' },
  { open: 170, high: 173, low: 168, close: 171, timestamp: '2023-01-03T20:00:00Z' },
  { open: 171, high: 174, low: 169, close: 172, timestamp: '2023-01-03T21:00:00Z' },
  { open: 172, high: 175, low: 170, close: 173, timestamp: '2023-01-03T22:00:00Z' },
  { open: 173, high: 176, low: 171, close: 174, timestamp: '2023-01-03T23:00:00Z' },
  { open: 174, high: 177, low: 172, close: 175, timestamp: '2023-01-04T00:00:00Z' },
  { open: 175, high: 178, low: 173, close: 176, timestamp: '2023-01-04T01:00:00Z' },
  { open: 176, high: 179, low: 174, close: 177, timestamp: '2023-01-04T02:00:00Z' },
  { open: 177, high: 180, low: 175, close: 178, timestamp: '2023-01-04T03:00:00Z' },
  { open: 178, high: 181, low: 176, close: 179, timestamp: '2023-01-04T04:00:00Z' },
  { open: 179, high: 182, low: 177, close: 180, timestamp: '2023-01-04T05:00:00Z' },
  { open: 180, high: 183, low: 178, close: 181, timestamp: '2023-01-04T06:00:00Z' },
  { open: 181, high: 184, low: 179, close: 182, timestamp: '2023-01-04T07:00:00Z' },
  { open: 182, high: 185, low: 180, close: 183, timestamp: '2023-01-04T08:00:00Z' },
  { open: 183, high: 186, low: 181, close: 184, timestamp: '2023-01-04T09:00:00Z' },
  { open: 184, high: 187, low: 182, close: 185, timestamp: '2023-01-04T10:00:00Z' },
  { open: 185, high: 188, low: 183, close: 186, timestamp: '2023-01-04T11:00:00Z' },
  { open: 186, high: 189, low: 184, close: 187, timestamp: '2023-01-04T12:00:00Z' },
  { open: 187, high: 190, low: 185, close: 188, timestamp: '2023-01-04T13:00:00Z' },
  { open: 188, high: 191, low: 186, close: 189, timestamp: '2023-01-04T14:00:00Z' },
  { open: 189, high: 192, low: 187, close: 190, timestamp: '2023-01-04T15:00:00Z' },
  { open: 190, high: 193, low: 188, close: 191, timestamp: '2023-01-04T16:00:00Z' },
  { open: 191, high: 194, low: 189, close: 192, timestamp: '2023-01-04T17:00:00Z' },
  { open: 192, high: 195, low: 190, close: 193, timestamp: '2023-01-04T18:00:00Z' },
  { open: 193, high: 196, low: 191, close: 194, timestamp: '2023-01-04T19:00:00Z' },
  { open: 194, high: 197, low: 192, close: 195, timestamp: '2023-01-04T20:00:00Z' },
  { open: 195, high: 198, low: 193, close: 196, timestamp: '2023-01-04T21:00:00Z' },
  { open: 196, high: 199, low: 194, close: 197, timestamp: '2023-01-04T22:00:00Z' },
  { open: 197, high: 200, low: 195, close: 198, timestamp: '2023-01-04T23:00:00Z' },
  { open: 198, high: 201, low: 196, close: 199, timestamp: '2023-01-05T00:00:00Z' },
  { open: 199, high: 202, low: 197, close: 200, timestamp: '2023-01-05T01:00:00Z' },
  { open: 200, high: 203, low: 198, close: 201, timestamp: '2023-01-05T02:00:00Z' },
  { open: 201, high: 204, low: 199, close: 202, timestamp: '2023-01-05T03:00:00Z' },
  { open: 202, high: 205, low: 200, close: 203, timestamp: '2023-01-05T04:00:00Z' },
  { open: 203, high: 206, low: 201, close: 204, timestamp: '2023-01-05T05:00:00Z' },
  { open: 204, high: 207, low: 202, close: 205, timestamp: '2023-01-05T06:00:00Z' },
  { open: 205, high: 208, low: 203, close: 206, timestamp: '2023-01-05T07:00:00Z' },
  { open: 206, high: 209, low: 204, close: 207, timestamp: '2023-01-05T08:00:00Z' },
  { open: 207, high: 210, low: 205, close: 208, timestamp: '2023-01-05T09:00:00Z' },
  { open: 208, high: 211, low: 206, close: 209, timestamp: '2023-01-05T10:00:00Z' },
  { open: 209, high: 212, low: 207, close: 210, timestamp: '2023-01-05T11:00:00Z' },
  { open: 210, high: 213, low: 208, close: 211, timestamp: '2023-01-05T12:00:00Z' },
  { open: 211, high: 214, low: 209, close: 212, timestamp: '2023-01-05T13:00:00Z' },
  { open: 212, high: 215, low: 210, close: 213, timestamp: '2023-01-05T14:00:00Z' },
  { open: 213, high: 216, low: 211, close: 214, timestamp: '2023-01-05T15:00:00Z' },
  { open: 214, high: 217, low: 212, close: 215, timestamp: '2023-01-05T16:00:00Z' },
  { open: 215, high: 218, low: 213, close: 216, timestamp: '2023-01-05T17:00:00Z' },
  { open: 216, high: 219, low: 214, close: 217, timestamp: '2023-01-05T18:00:00Z' },
  { open: 217, high: 220, low: 215, close: 218, timestamp: '2023-01-05T19:00:00Z' },
  { open: 218, high: 221, low: 216, close: 219, timestamp: '2023-01-05T20:00:00Z' },
  { open: 219, high: 222, low: 217, close: 220, timestamp: '2023-01-05T21:00:00Z' },
  { open: 220, high: 223, low: 218, close: 221, timestamp: '2023-01-05T22:00:00Z' },
  { open: 221, high: 224, low: 219, close: 222, timestamp: '2023-01-05T23:00:00Z' },
  { open: 222, high: 225, low: 220, close: 223, timestamp: '2023-01-06T00:00:00Z' },
  { open: 223, high: 226, low: 221, close: 224, timestamp: '2023-01-06T01:00:00Z' },
  { open: 224, high: 227, low: 222, close: 225, timestamp: '2023-01-06T02:00:00Z' },
  { open: 225, high: 228, low: 223, close: 226, timestamp: '2023-01-06T03:00:00Z' },
  { open: 226, high: 229, low: 224, close: 227, timestamp: '2023-01-06T04:00:00Z' },
  { open: 227, high: 230, low: 225, close: 228, timestamp: '2023-01-06T05:00:00Z' },
  { open: 228, high: 231, low: 226, close: 229, timestamp: '2023-01-06T06:00:00Z' },
  { open: 229, high: 232, low: 227, close: 230, timestamp: '2023-01-06T07:00:00Z' },
  { open: 230, high: 233, low: 228, close: 231, timestamp: '2023-01-06T08:00:00Z' },
  { open: 231, high: 234, low: 229, close: 232, timestamp: '2023-01-06T09:00:00Z' },
  { open: 232, high: 235, low: 230, close: 233, timestamp: '2023-01-06T10:00:00Z' },
  { open: 233, high: 236, low: 231, close: 234, timestamp: '2023-01-06T11:00:00Z' },
  { open: 234, high: 237, low: 232, close: 235, timestamp: '2023-01-06T12:00:00Z' },
  { open: 235, high: 238, low: 233, close: 236, timestamp: '2023-01-06T13:00:00Z' },
  { open: 236, high: 239, low: 234, close: 237, timestamp: '2023-01-06T14:00:00Z' },
  { open: 237, high: 240, low: 235, close: 238, timestamp: '2023-01-06T15:00:00Z' },
  { open: 238, high: 241, low: 236, close: 239, timestamp: '2023-01-06T16:00:00Z' },
  { open: 239, high: 242, low: 237, close: 240, timestamp: '2023-01-06T17:00:00Z' },
  { open: 240, high: 243, low: 238, close: 241, timestamp: '2023-01-06T18:00:00Z' },
  { open: 241, high: 244, low: 239, close: 242, timestamp: '2023-01-06T19:00:00Z' },
  { open: 242, high: 245, low: 240, close: 243, timestamp: '2023-01-06T20:00:00Z' },
  { open: 243, high: 246, low: 241, close: 244, timestamp: '2023-01-06T21:00:00Z' },
  { open: 244, high: 247, low: 242, close: 245, timestamp: '2023-01-06T22:00:00Z' },
  { open: 245, high: 248, low: 243, close: 246, timestamp: '2023-01-06T23:00:00Z' },
  { open: 246, high: 249, low: 244, close: 247, timestamp: '2023-01-07T00:00:00Z' },
  { open: 247, high: 250, low: 245, close: 248, timestamp: '2023-01-07T01:00:00Z' },
  { open: 248, high: 251, low: 246, close: 249, timestamp: '2023-01-07T02:00:00Z' },
  { open: 249, high: 252, low: 247, close: 250, timestamp: '2023-01-07T03:00:00Z' },
  { open: 250, high: 253, low: 248, close: 251, timestamp: '2023-01-07T04:00:00Z' },
  { open: 251, high: 254, low: 249, close: 252, timestamp: '2023-01-07T05:00:00Z' },
  { open: 252, high: 255, low: 250, close: 253, timestamp: '2023-01-07T06:00:00Z' },
  { open: 253, high: 256, low: 251, close: 254, timestamp: '2023-01-07T07:00:00Z' },
  { open: 254, high: 257, low: 252, close: 255, timestamp: '2023-01-07T08:00:00Z' },
  { open: 255, high: 258, low: 253, close: 256, timestamp: '2023-01-07T09:00:00Z' },
  { open: 256, high: 259, low: 254, close: 257, timestamp: '2023-01-07T10:00:00Z' },
  { open: 257, high: 260, low: 255, close: 258, timestamp: '2023-01-07T11:00:00Z' },
  { open: 258, high: 261, low: 256, close: 259, timestamp: '2023-01-07T12:00:00Z' },
  { open: 259, high: 262, low: 257, close: 260, timestamp: '2023-01-07T13:00:00Z' },
  { open: 260, high: 263, low: 258, close: 261, timestamp: '2023-01-07T14:00:00Z' },
  { open: 261, high: 264, low: 259, close: 262, timestamp: '2023-01-07T15:00:00Z' },
  { open: 262, high: 265, low: 260, close: 263, timestamp: '2023-01-07T16:00:00Z' },
  { open: 263, high: 266, low: 261, close: 264, timestamp: '2023-01-07T17:00:00Z' },
  { open: 264, high: 267, low: 262, close: 265, timestamp: '2023-01-07T18:00:00Z' },
  { open: 265, high: 268, low: 263, close: 266, timestamp: '2023-01-07T19:00:00Z' },
  { open: 266, high: 269, low: 264, close: 267, timestamp: '2023-01-07T20:00:00Z' },
  { open: 267, high: 270, low: 265, close: 268, timestamp: '2023-01-07T21:00:00Z' },
  { open: 268, high: 271, low: 266, close: 269, timestamp: '2023-01-07T22:00:00Z' },
  { open: 269, high: 272, low: 267, close: 270, timestamp: '2023-01-07T23:00:00Z' },
  { open: 270, high: 273, low: 268, close: 271, timestamp: '2023-01-08T00:00:00Z' },
  { open: 271, high: 274, low: 269, close: 272, timestamp: '2023-01-08T01:00:00Z' },
  { open: 272, high: 275, low: 270, close: 273, timestamp: '2023-01-08T02:00:00Z' },
  { open: 273, high: 276, low: 271, close: 274, timestamp: '2023-01-08T03:00:00Z' },
  { open: 274, high: 277, low: 272, close: 275, timestamp: '2023-01-08T04:00:00Z' },
  { open: 275, high: 278, low: 273, close: 276, timestamp: '2023-01-08T05:00:00Z' },
  { open: 276, high: 279, low: 274, close: 277, timestamp: '2023-01-08T06:00:00Z' },
  { open: 277, high: 280, low: 275, close: 278, timestamp: '2023-01-08T07:00:00Z' },
  { open: 278, high: 281, low: 276, close: 279, timestamp: '2023-01-08T08:00:00Z' },
  { open: 279, high: 282, low: 277, close: 280, timestamp: '2023-01-08T09:00:00Z' },
  { open: 280, high: 283, low: 278, close: 281, timestamp: '2023-01-08T10:00:00Z' },
  { open: 281, high: 284, low: 279, close: 282, timestamp: '2023-01-08T11:00:00Z' },
  { open: 282, high: 285, low: 280, close: 283, timestamp: '2023-01-08T12:00:00Z' },
  { open: 283, high: 286, low: 281, close: 284, timestamp: '2023-01-08T13:00:00Z' },
  { open: 284, high: 287, low: 282, close: 285, timestamp: '2023-01-08T14:00:00Z' },
  { open: 285, high: 288, low: 283, close: 286, timestamp: '2023-01-08T15:00:00Z' },
  { open: 286, high: 289, low: 284, close: 287, timestamp: '2023-01-08T16:00:00Z' },
  { open: 287, high: 290, low: 285, close: 288, timestamp: '2023-01-08T17:00:00Z' },
  { open: 288, high: 291, low: 286, close: 289, timestamp: '2023-01-08T18:00:00Z' },
  { open: 289, high: 292, low: 287, close: 290, timestamp: '2023-01-08T19:00:00Z' },
  { open: 290, high: 293, low: 288, close: 291, timestamp: '2023-01-08T20:00:00Z' },
  { open: 291, high: 294, low: 289, close: 292, timestamp: '2023-01-08T21:00:00Z' },
  { open: 292, high: 295, low: 290, close: 293, timestamp: '2023-01-08T22:00:00Z' },
  { open: 293, high: 296, low: 291, close: 294, timestamp: '2023-01-08T23:00:00Z' },
  { open: 294, high: 297, low: 292, close: 295, timestamp: '2023-01-09T00:00:00Z' },
  { open: 295, high: 298, low: 293, close: 296, timestamp: '2023-01-09T01:00:00Z' },
  { open: 296, high: 299, low: 294, close: 297, timestamp: '2023-01-09T02:00:00Z' },
  { open: 297, high: 300, low: 295, close: 298, timestamp: '2023-01-09T03:00:00Z' },
  { open: 298, high: 301, low: 296, close: 299, timestamp: '2023-01-09T04:00:00Z' },
  { open: 299, high: 302, low: 297, close: 300, timestamp: '2023-01-09T05:00:00Z' },
  { open: 300, high: 303, low: 298, close: 301, timestamp: '2023-01-09T06:00:00Z' },
  { open: 301, high: 304, low: 299, close: 302, timestamp: '2023-01-09T07:00:00Z' },
  { open: 302, high: 305, low: 300, close: 303, timestamp: '2023-01-09T08:00:00Z' },
  { open: 303, high: 306, low: 301, close: 304, timestamp: '2023-01-09T09:00:00Z' },
  { open: 304, high: 307, low: 302, close: 305, timestamp: '2023-01-09T10:00:00Z' },
  { open: 305, high: 308, low: 303, close: 306, timestamp: '2023-01-09T11:00:00Z' },
  { open: 306, high: 309, low: 304, close: 307, timestamp: '2023-01-09T12:00:00Z' },
  { open: 307, high: 310, low: 305, close: 308, timestamp: '2023-01-09T13:00:00Z' },
  { open: 308, high: 311, low: 306, close: 309, timestamp: '2023-01-09T14:00:00Z' },
  { open: 309, high: 312, low: 307, close: 310, timestamp: '2023-01-09T15:00:00Z' },
  { open: 310, high: 313, low: 308, close: 311, timestamp: '2023-01-09T16:00:00Z' },
  { open: 311, high: 314, low: 309, close: 312, timestamp: '2023-01-09T17:00:00Z' },
  { open: 312, high: 315, low: 310, close: 313, timestamp: '2023-01-09T18:00:00Z' },
  { open: 313, high: 316, low: 311, close: 314, timestamp: '2023-01-09T19:00:00Z' },
  { open: 314, high: 317, low: 312, close: 315, timestamp: '2023-01-09T20:00:00Z' },
  { open: 315, high: 318, low: 313, close: 316, timestamp: '2023-01-09T21:00:00Z' },
  { open: 316, high: 319, low: 314, close: 317, timestamp: '2023-01-09T22:00:00Z' },
  { open: 317, high: 320, low: 315, close: 318, timestamp: '2023-01-09T23:00:00Z' },
  { open: 318, high: 321, low: 316, close: 319, timestamp: '2023-01-10T00:00:00Z' },
  { open: 319, high: 322, low: 317, close: 320, timestamp: '2023-01-10T01:00:00Z' },
  { open: 320, high: 323, low: 318, close: 321, timestamp: '2023-01-10T02:00:00Z' },
  { open: 321, high: 324, low: 319, close: 322, timestamp: '2023-01-10T03:00:00Z' },
  { open: 322, high: 325, low: 320, close: 323, timestamp: '2023-01-10T04:00:00Z' },
  { open: 323, high: 326, low: 321, close: 324, timestamp: '2023-01-10T05:00:00Z' },
  { open: 324, high: 327, low: 322, close: 325, timestamp: '2023-01-10T06:00:00Z' },
  { open: 325, high: 328, low: 323, close: 326, timestamp: '2023-01-10T07:00:00Z' },
  { open: 326, high: 329, low: 324, close: 327, timestamp: '2023-01-10T08:00:00Z' },
  { open: 327, high: 330, low: 325, close: 328, timestamp: '2023-01-10T09:00:00Z' },
  { open: 328, high: 331, low: 326, close: 329, timestamp: '2023-01-10T10:00:00Z' },
  { open: 329, high: 332, low: 327, close: 330, timestamp: '2023-01-10T11:00:00Z' },
  { open: 330, high: 333, low: 328, close: 331, timestamp: '2023-01-10T12:00:00Z' },
  { open: 331, high: 334, low: 329, close: 332, timestamp: '2023-01-10T13:00:00Z' },
  { open: 332, high: 335, low: 330, close: 333, timestamp: '2023-01-10T14:00:00Z' },
  { open: 333, high: 336, low: 331, close: 334, timestamp: '2023-01-10T15:00:00Z' },
  { open: 334, high: 337, low: 332, close: 335, timestamp: '2023-01-10T16:00:00Z' },
  { open: 335, high: 338, low: 333, close: 336, timestamp: '2023-01-10T17:00:00Z' },
  { open: 336, high: 339, low: 334, close: 337, timestamp: '2023-01-10T18:00:00Z' },
  { open: 337, high: 340, low: 335, close: 338, timestamp: '2023-01-10T19:00:00Z' },
  { open: 338, high: 341, low: 336, close: 339, timestamp: '2023-01-10T20:00:00Z' },
  { open: 339, high: 342, low: 337, close: 340, timestamp: '2023-01-10T21:00:00Z' },
  { open: 340, high: 343, low: 338, close: 341, timestamp: '2023-01-10T22:00:00Z' },
  { open: 341, high: 344, low: 339, close: 342, timestamp: '2023-01-10T23:00:00Z' },
  { open: 342, high: 345, low: 340, close: 343, timestamp: '2023-01-11T00:00:00Z' },
  { open: 343, high: 346, low: 341, close: 344, timestamp: '2023-01-11T01:00:00Z' },
  { open: 344, high: 347, low: 342, close: 345, timestamp: '2023-01-11T02:00:00Z' },
  { open: 345, high: 348, low: 343, close: 346, timestamp: '2023-01-11T03:00:00Z' },
  { open: 346, high: 349, low: 344, close: 347, timestamp: '2023-01-11T04:00:00Z' },
  { open: 347, high: 350, low: 345, close: 348, timestamp: '2023-01-11T05:00:00Z' },
  { open: 348, high: 351, low: 346, close: 349, timestamp: '2023-01-11T06:00:00Z' },
  { open: 349, high: 352, low: 347, close: 350, timestamp: '2023-01-11T07:00:00Z' },
  { open: 350, high: 353, low: 348, close: 351, timestamp: '2023-01-11T08:00:00Z' },
  { open: 351, high: 354, low: 349, close: 352, timestamp: '2023-01-11T09:00:00Z' },
  { open: 352, high: 355, low: 350, close: 353, timestamp: '2023-01-11T10:00:00Z' },
  { open: 353, high: 356, low: 351, close: 354, timestamp: '2023-01-11T11:00:00Z' },
  { open: 354, high: 357, low: 352, close: 355, timestamp: '2023-01-11T12:00:00Z' },
  { open: 355, high: 358, low: 353, close: 356, timestamp: '2023-01-11T13:00:00Z' },
  { open: 356, high: 359, low: 354, close: 357, timestamp: '2023-01-11T14:00:00Z' },
  { open: 357, high: 360, low: 355, close: 358, timestamp: '2023-01-11T15:00:00Z' },
  { open: 358, high: 361, low: 356, close: 359, timestamp: '2023-01-11T16:00:00Z' },
  { open: 359, high: 362, low: 357, close: 360, timestamp: '2023-01-11T17:00:00Z' },
  { open: 360, high: 363, low: 358, close: 361, timestamp: '2023-01-11T18:00:00Z' },
  { open: 361, high: 364, low: 359, close: 362, timestamp: '2023-01-11T19:00:00Z' },
  { open: 362, high: 365, low: 360, close: 363, timestamp: '2023-01-11T20:00:00Z' },
  { open: 363, high: 366, low: 361, close: 364, timestamp: '2023-01-11T21:00:00Z' },
  { open: 364, high: 367, low: 362, close: 365, timestamp: '2023-01-11T22:00:00Z' },
  { open: 365, high: 368, low: 363, close: 366, timestamp: '2023-01-11T23:00:00Z' },
  { open: 366, high: 369, low: 364, close: 367, timestamp: '2023-01-12T00:00:00Z' },
  { open: 367, high: 370, low: 365, close: 368, timestamp: '2023-01-12T01:00:00Z' },
  { open: 368, high: 371, low: 366, close: 369, timestamp: '2023-01-12T02:00:00Z' },
  { open: 369, high: 372, low: 367, close: 370, timestamp: '2023-01-12T03:00:00Z' },
  { open: 370, high: 373, low: 368, close: 371, timestamp: '2023-01-12T04:00:00Z' },
  { open: 371, high: 374, low: 369, close: 372, timestamp: '2023-01-12T05:00:00Z' },
  { open: 372, high: 375, low: 370, close: 373, timestamp: '2023-01-12T06:00:00Z' },
  { open: 373, high: 376, low: 371, close: 374, timestamp: '2023-01-12T07:00:00Z' },
  { open: 374, high: 377, low: 372, close: 375, timestamp: '2023-01-12T08:00:00Z' },
  { open: 375, high: 378, low: 373, close: 376, timestamp: '2023-01-12T09:00:00Z' },
  { open: 376, high: 379, low: 374, close: 377, timestamp: '2023-01-12T10:00:00Z' },
  { open: 377, high: 380, low: 375, close: 378, timestamp: '2023-01-12T11:00:00Z' },
  { open: 378, high: 381, low: 376, close: 379, timestamp: '2023-01-12T12:00:00Z' },
  { open: 379, high: 382, low: 377, close: 380, timestamp: '2023-01-12T13:00:00Z' },
  { open: 380, high: 383, low: 378, close: 381, timestamp: '2023-01-12T14:00:00Z' },
  { open: 381, high: 384, low: 379, close: 382, timestamp: '2023-01-12T15:00:00Z' },
  { open: 382, high: 385, low: 380, close: 383, timestamp: '2023-01-12T16:00:00Z' },
  { open: 383, high: 386, low: 381, close: 384, timestamp: '2023-01-12T17:00:00Z' },
  { open: 384, high: 387, low: 382, close: 385, timestamp: '2023-01-12T18:00:00Z' },
  { open: 385, high: 388, low: 383, close: 386, timestamp: '2023-01-12T19:00:00Z' },
  { open: 386, high: 389, low: 384, close: 387, timestamp: '2023-01-12T20:00:00Z' },
  { open: 387, high: 390, low: 385, close: 388, timestamp: '2023-01-12T21:00:00Z' },
  { open: 388, high: 391, low: 386, close: 389, timestamp: '2023-01-12T22:00:00Z' },
  { open: 389, high: 392, low: 387, close: 390, timestamp: '2023-01-12T23:00:00Z' },
  { open: 390, high: 393, low: 388, close: 391, timestamp: '2023-01-13T00:00:00Z' },
  { open: 391, high: 394, low: 389, close: 392, timestamp: '2023-01-13T01:00:00Z' },
  { open: 392, high: 395, low: 390, close: 393, timestamp: '2023-01-13T02:00:00Z' },
  { open: 393, high: 396, low: 391, close: 394, timestamp: '2023-01-13T03:00:00Z' },
  { open: 394, high: 397, low: 392, close: 395, timestamp: '2023-01-13T04:00:00Z' },
  { open: 395, high: 398, low: 393, close: 396, timestamp: '2023-01-13T05:00:00Z' },
  { open: 396, high: 399, low: 394, close: 397, timestamp: '2023-01-13T06:00:00Z' },
  { open: 397, high: 400, low: 395, close: 398, timestamp: '2023-01-13T07:00:00Z' },
  { open: 398, high: 401, low: 396, close: 399, timestamp: '2023-01-13T08:00:00Z' },
  { open: 399, high: 402, low: 397, close: 400, timestamp: '2023-01-13T09:00:00Z' },
  { open: 400, high: 403, low: 398, close: 401, timestamp: '2023-01-13T10:00:00Z' },
  { open: 401, high: 404, low: 399, close: 402, timestamp: '2023-01-13T11:00:00Z' },
  { open: 402, high: 405, low: 400, close: 403, timestamp: '2023-01-13T12:00:00Z' },
  { open: 403, high: 406, low: 401, close: 404, timestamp: '2023-01-13T13:00:00Z' },
  { open: 404, high: 407, low: 402, close: 405, timestamp: '2023-01-13T14:00:00Z' },
  { open: 405, high: 408, low: 403, close: 406, timestamp: '2023-01-13T15:00:00Z' },
  { open: 406, high: 409, low: 404, close: 407, timestamp: '2023-01-13T16:00:00Z' },
  { open: 407, high: 410, low: 405, close: 408, timestamp: '2023-01-13T17:00:00Z' },
  { open: 408, high: 411, low: 406, close: 409, timestamp: '2023-01-13T18:00:00Z' },
  { open: 409, high: 412, low: 407, close: 410, timestamp: '2023-01-13T19:00:00Z' },
  { open: 410, high: 413, low: 408, close: 411, timestamp: '2023-01-13T20:00:00Z' },
  { open: 411, high: 414, low: 409, close: 412, timestamp: '2023-01-13T21:00:00Z' },
  { open: 412, high: 415, low: 410, close: 413, timestamp: '2023-01-13T22:00:00Z' },
  { open: 413, high: 416, low: 411, close: 414, timestamp: '2023-01-13T23:00:00Z' },
  { open: 414, high: 417, low: 412, close: 415, timestamp: '2023-01-14T00:00:00Z' },
  { open: 415, high: 418, low: 413, close: 416, timestamp: '2023-01-14T01:00:00Z' },
  { open: 416, high: 419, low: 414, close: 417, timestamp: '2023-01-14T02:00:00Z' },
  { open: 417, high: 420, low: 415, close: 418, timestamp: '2023-01-14T03:00:00Z' },
  { open: 418, high: 421, low: 416, close: 419, timestamp: '2023-01-14T04:00:00Z' },
  { open: 419, high: 422, low: 417, close: 420, timestamp: '2023-01-14T05:00:00Z' },
  { open: 420, high: 423, low: 418, close: 421, timestamp: '2023-01-14T06:00:00Z' },
  { open: 421, high: 424, low: 419, close: 422, timestamp: '2023-01-14T07:00:00Z' },
  { open: 422, high: 425, low: 420, close: 423, timestamp: '2023-01-14T08:00:00Z' },
  { open: 423, high: 426, low: 421, close: 424, timestamp: '2023-01-14T09:00:00Z' },
  { open: 424, high: 427, low: 422, close: 425, timestamp: '2023-01-14T10:00:00Z' },
  { open: 425, high: 428, low: 423, close: 426, timestamp: '2023-01-14T11:00:00Z' },
  { open: 426, high: 429, low: 424, close: 427, timestamp: '2023-01-14T12:00:00Z' },
  { open: 427, high: 430, low: 425, close: 428, timestamp: '2023-01-14T13:00:00Z' },
  { open: 428, high: 431, low: 426, close: 429, timestamp: '2023-01-14T14:00:00Z' },
  { open: 429, high: 432, low: 427, close: 430, timestamp: '2023-01-14T15:00:00Z' },
  { open: 430, high: 433, low: 428, close: 431, timestamp: '2023-01-14T16:00:00Z' },
  { open: 431, high: 434, low: 429, close: 432, timestamp: '2023-01-14T17:00:00Z' },
  { open: 432, high: 435, low: 430, close: 433, timestamp: '2023-01-14T18:00:00Z' },
  { open: 433, high: 436, low: 431, close: 434, timestamp: '2023-01-14T19:00:00Z' },
  { open: 434, high: 437, low: 432, close: 435, timestamp: '2023-01-14T20:00:00Z' },
  { open: 435, high: 438, low: 433, close: 436, timestamp: '2023-01-14T21:00:00Z' },
  { open: 436, high: 439, low: 434, close: 437, timestamp: '2023-01-14T22:00:00Z' },
  { open: 437, high: 440, low: 435, close: 438, timestamp: '2023-01-14T23:00:00Z' },
  { open: 438, high: 441, low: 436, close: 439, timestamp: '2023-01-15T00:00:00Z' },
  { open: 439, high: 442, low: 437, close: 440, timestamp: '2023-01-15T01:00:00Z' },
  { open: 440, high: 443, low: 438, close: 441, timestamp: '2023-01-15T02:00:00Z' },
  { open: 441, high: 444, low: 439, close: 442, timestamp: '2023-01-15T03:00:00Z' },
  { open: 442, high: 445, low: 440, close: 443, timestamp: '2023-01-15T04:00:00Z' },
  { open: 443, high: 446, low: 441, close: 444, timestamp: '2023-01-15T05:00:00Z' },
  { open: 444, high: 447, low: 442, close: 445, timestamp: '2023-01-15T06:00:00Z' },
  { open: 445, high: 448, low: 443, close: 446, timestamp: '2023-01-15T07:00:00Z' },
  { open: 446, high: 449, low: 444, close: 447, timestamp: '2023-01-15T08:00:00Z' },
  { open: 447, high: 450, low: 445, close: 448, timestamp: '2023-01-15T09:00:00Z' },
  { open: 448, high: 451, low: 446, close: 449, timestamp: '2023-01-15T10:00:00Z' },
  { open: 449, high: 452, low: 447, close: 450, timestamp: '2023-01-15T11:00:00Z' },
  { open: 450, high: 453, low: 448, close: 451, timestamp: '2023-01-15T12:00:00Z' },
  { open: 451, high: 454, low: 449, close: 452, timestamp: '2023-01-15T13:00:00Z' },
  { open: 452, high: 455, low: 450, close: 453, timestamp: '2023-01-15T14:00:00Z' },
  { open: 453, high: 456, low: 451, close: 454, timestamp: '2023-01-15T15:00:00Z' },
  { open: 454, high: 457, low: 452, close: 455, timestamp: '2023-01-15T16:00:00Z' },
  { open: 455, high: 458, low: 453, close: 456, timestamp: '2023-01-15T17:00:00Z' },
  { open: 456, high: 459, low: 454, close: 457, timestamp: '2023-01-15T18:00:00Z' },
  { open: 457, high: 460, low: 455, close: 458, timestamp: '2023-01-15T19:00:00Z' },
  { open: 458, high: 461, low: 456, close: 459, timestamp: '2023-01-15T20:00:00Z' },
  { open: 459, high: 462, low: 457, close: 460, timestamp: '2023-01-15T21:00:00Z' },
  { open: 460, high: 463, low: 458, close: 461, timestamp: '2023-01-15T22:00:00Z' },
  { open: 461, high: 464, low: 459, close: 462, timestamp: '2023-01-15T23:00:00Z' },
  { open: 462, high: 465, low: 460, close: 463, timestamp: '2023-01-16T00:00:00Z' },
  { open: 463, high: 466, low: 461, close: 464, timestamp: '2023-01-16T01:00:00Z' },
  { open: 464, high: 467, low: 462, close: 465, timestamp: '2023-01-16T02:00:00Z' },
  { open: 465, high: 468, low: 463, close: 466, timestamp: '2023-01-16T03:00:00Z' },
  { open: 466, high: 469, low: 464, close: 467, timestamp: '2023-01-16T04:00:00Z' },
  { open: 467, high: 470, low: 465, close: 468, timestamp: '2023-01-16T05:00:00Z' },
  { open: 468, high: 471, low: 466, close: 469, timestamp: '2023-01-16T06:00:00Z' },
  { open: 469, high: 472, low: 467, close: 470, timestamp: '2023-01-16T07:00:00Z' },
  { open: 470, high: 473, low: 468, close: 471, timestamp: '2023-01-16T08:00:00Z' },
  { open: 471, high: 474, low: 469, close: 472, timestamp: '2023-01-16T09:00:00Z' },
  { open: 472, high: 475, low: 470, close: 473, timestamp: '2023-01-16T10:00:00Z' },
  { open: 473, high: 476, low: 471, close: 474, timestamp: '2023-01-16T11:00:00Z' },
  { open: 474, high: 477, low: 472, close: 475, timestamp: '2023-01-16T12:00:00Z' },
  { open: 475, high: 478, low: 473, close: 476, timestamp: '2023-01-16T13:00:00Z' },
  { open: 476, high: 479, low: 474, close: 477, timestamp: '2023-01-16T14:00:00Z' },
  { open: 477, high: 480, low: 475, close: 478, timestamp: '2023-01-16T15:00:00Z' },
  { open: 478, high: 481, low: 476, close: 479, timestamp: '2023-01-16T16:00:00Z' },
  { open: 479, high: 482, low: 477, close: 480, timestamp: '2023-01-16T17:00:00Z' },
  { open: 480, high: 483, low: 478, close: 481, timestamp: '2023-01-16T18:00:00Z' },
  { open: 481, high: 484, low: 479, close: 482, timestamp: '2023-01-16T19:00:00Z' },
  { open: 482, high: 485, low: 480, close: 483, timestamp: '2023-01-16T20:00:00Z' },
  { open: 483, high: 486, low: 481, close: 484, timestamp: '2023-01-16T21:00:00Z' },
  { open: 484, high: 487, low: 482, close: 485, timestamp: '2023-01-16T22:00:00Z' },
  { open: 485, high: 488, low: 483, close: 486, timestamp: '2023-01-16T23:00:00Z' },
  { open: 486, high: 489, low: 484, close: 487, timestamp: '2023-01-17T00:00:00Z' },
  { open: 487, high: 490, low: 485, close: 488, timestamp: '2023-01-17T01:00:00Z' },
  { open: 488, high: 491, low: 486, close: 489, timestamp: '2023-01-17T02:00:00Z' },
  { open: 489, high: 492, low: 487, close: 490, timestamp: '2023-01-17T03:00:00Z' },
  { open: 490, high: 493, low: 488, close: 491, timestamp: '2023-01-17T04:00:00Z' },
  { open: 491, high: 494, low: 489, close: 492, timestamp: '2023-01-17T05:00:00Z' },
  { open: 492, high: 495, low: 490, close: 493, timestamp: '2023-01-17T06:00:00Z' },
  { open: 493, high: 496, low: 491, close: 494, timestamp: '2023-01-17T07:00:00Z' },
  { open: 494, high: 497, low: 492, close: 495, timestamp: '2023-01-17T08:00:00Z' },
  { open: 495, high: 498, low: 493, close: 496, timestamp: '2023-01-17T09:00:00Z' },
  { open: 496, high: 499, low: 494, close: 497, timestamp: '2023-01-17T10:00:00Z' },
  { open: 497, high: 500, low: 495, close: 498, timestamp: '2023-01-17T11:00:00Z' },
  { open: 498, high: 501, low: 496, close: 499, timestamp: '2023-01-17T12:00:00Z' },
  { open: 499, high: 502, low: 497, close: 500, timestamp: '2023-01-17T13:00:00Z' },
  { open: 500, high: 503, low: 498, close: 501, timestamp: '2023-01-17T14:00:00Z' },
  { open: 501, high: 504, low: 499, close: 502, timestamp: '2023-01-17T15:00:00Z' },
  { open: 502, high: 505, low: 500, close: 503, timestamp: '2023-01-17T16:00:00Z' },
  { open: 503, high: 506, low: 501, close: 504, timestamp: '2023-01-17T17:00:00Z' },
  { open: 504, high: 507, low: 502, close: 505, timestamp: '2023-01-17T18:00:00Z' },
  { open: 505, high: 508, low: 503, close: 506, timestamp: '2023-01-17T19:00:00Z' },
  { open: 506, high: 509, low: 504, close: 507, timestamp: '2023-01-17T20:00:00Z' },
  { open: 507, high: 510, low: 505, close: 508, timestamp: '2023-01-17T21:00:00Z' },
  { open: 508, high: 511, low: 506, close: 509, timestamp: '2023-01-17T22:00:00Z' },
  { open: 509, high: 512, low: 507, close: 510, timestamp: '2023-01-17T23:00:00Z' },
  { open: 510, high: 513, low: 508, close: 511, timestamp: '2023-01-18T00:00:00Z' },
  { open: 511, high: 514, low: 509, close: 512, timestamp: '2023-01-18T01:00:00Z' },
  { open: 512, high: 515, low: 510, close: 513, timestamp: '2023-01-18T02:00:00Z' },
  { open: 513, high: 516, low: 511, close: 514, timestamp: '2023-01-18T03:00:00Z' },
  { open: 514, high: 517, low: 512, close: 515, timestamp: '2023-01-18T04:00:00Z' },
  { open: 515, high: 518, low: 513, close: 516, timestamp: '2023-01-18T05:00:00Z' },
  { open: 516, high: 519, low: 514, close: 517, timestamp: '2023-01-18T06:00:00Z' },
  { open: 517, high: 520, low: 515, close: 518, timestamp: '2023-01-18T07:00:00Z' },
  { open: 518, high: 521, low: 516, close: 519, timestamp: '2023-01-18T08:00:00Z' },
  { open: 519, high: 522, low: 517, close: 520, timestamp: '2023-01-18T09:00:00Z' },
  { open: 520, high: 523, low: 518, close: 521, timestamp: '2023-01-18T10:00:00Z' },
  { open: 521, high: 524, low: 519, close: 522, timestamp: '2023-01-18T11:00:00Z' },
  { open: 522, high: 525, low: 520, close: 523, timestamp: '2023-01-18T12:00:00Z' },
  { open: 523, high: 526, low: 521, close: 524, timestamp: '2023-01-18T13:00:00Z' },
  { open: 524, high: 527, low: 522, close: 525, timestamp: '2023-01-18T14:00:00Z' },
  { open: 525, high: 528, low: 523, close: 526, timestamp: '2023-01-18T15:00:00Z' },
  { open: 526, high: 529, low: 524, close: 527, timestamp: '2023-01-18T16:00:00Z' },
  { open: 527, high: 530, low: 525, close: 528, timestamp: '2023-01-18T17:00:00Z' },
  { open: 528, high: 531, low: 526, close: 529, timestamp: '2023-01-18T18:00:00Z' },
  { open: 529, high: 532, low: 527, close: 530, timestamp: '2023-01-18T19:00:00Z' },
  { open: 530, high: 533, low: 528, close: 531, timestamp: '2023-01-18T20:00:00Z' },
  { open: 531, high: 534, low: 529, close: 532, timestamp: '2023-01-18T21:00:00Z' },
  { open: 532, high: 535, low: 530, close: 533, timestamp: '2023-01-18T22:00:00Z' },
  { open: 533, high: 536, low: 531, close: 534, timestamp: '2023-01-18T23:00:00Z' },
  { open: 534, high: 537, low: 532, close: 535, timestamp: '2023-01-19T00:00:00Z' },
  { open: 535, high: 538, low: 533, close: 536, timestamp: '2023-01-19T01:00:00Z' },
  { open: 536, high: 539, low: 534, close: 537, timestamp: '2023-01-19T02:00:00Z' },
  { open: 537, high: 540, low: 535, close: 538, timestamp: '2023-01-19T03:00:00Z' },
  { open: 538, high: 541, low: 536, close: 539, timestamp: '2023-01-19T04:00:00Z' },
  { open: 539, high: 542, low: 537, close: 540, timestamp: '2023-01-19T05:00:00Z' },
  { open: 540, high: 543, low: 538, close: 541, timestamp: '2023-01-19T06:00:00Z' },
  { open: 541, high: 544, low: 539, close: 542, timestamp: '2023-01-19T07:00:00Z' },
  { open: 542, high: 545, low: 540, close: 543, timestamp: '2023-01-19T08:00:00Z' },
  { open: 543, high: 546, low: 541, close: 544, timestamp: '2023-01-19T09:00:00Z' },
  { open: 544, high: 547, low: 542, close: 545, timestamp: '2023-01-19T10:00:00Z' },
  { open: 545, high: 548, low: 543, close: 546, timestamp: '2023-01-19T11:00:00Z' },
  { open: 546, high: 549, low: 544, close: 547, timestamp: '2023-01-19T12:00:00Z' },
  { open: 547, high: 550, low: 545, close: 548, timestamp: '2023-01-19T13:00:00Z' },
  { open: 548, high: 551, low: 546, close: 549, timestamp: '2023-01-19T14:00:00Z' },
  { open: 549, high: 552, low: 547, close: 550, timestamp: '2023-01-19T15:00:00Z' },
  { open: 550, high: 553, low: 548, close: 551, timestamp: '2023-01-19T16:00:00Z' },
  { open: 551, high: 554, low: 549, close: 552, timestamp: '2023-01-19T17:00:00Z' },
  { open: 552, high: 555, low: 550, close: 553, timestamp: '2023-01-19T18:00:00Z' },
  { open: 553, high: 556, low: 551, close: 554, timestamp: '2023-01-19T19:00:00Z' },
  { open: 554, high: 557, low: 552, close: 555, timestamp: '2023-01-19T20:00:00Z' },
  { open: 555, high: 558, low: 553, close: 556, timestamp: '2023-01-19T21:00:00Z' },
  { open: 556, high: 559, low: 554, close: 557, timestamp: '2023-01-19T22:00:00Z' },
  { open: 557, high: 560, low: 555, close: 558, timestamp: '2023-01-19T23:00:00Z' },
  { open: 558, high: 561, low: 556, close: 559, timestamp: '2023-01-20T00:00:00Z' },
  { open: 559, high: 562, low: 557, close: 560, timestamp: '2023-01-20T01:00:00Z' },
  { open: 560, high: 563, low: 558, close: 561, timestamp: '2023-01-20T02:00:00Z' },
  { open: 561, high: 564, low: 559, close: 562, timestamp: '2023-01-20T03:00:00Z' },
  { open: 562, high: 565, low: 560, close: 563, timestamp: '2023-01-20T04:00:00Z' },
  { open: 563, high: 566, low: 561, close: 564, timestamp: '2023-01-20T05:00:00Z' },
  { open: 564, high: 567, low: 562, close: 565, timestamp: '2023-01-20T06:00:00Z' },
  { open: 565, high: 568, low: 563, close: 566, timestamp: '2023-01-20T07:00:00Z' },
  { open: 566, high: 569, low: 564, close: 567, timestamp: '2023-01-20T08:00:00Z' },
  { open: 567, high: 570, low: 565, close: 568, timestamp: '2023-01-20T09:00:00Z' },
  { open: 568, high: 571, low: 566, close: 569, timestamp: '2023-01-20T10:00:00Z' },
  { open: 569, high: 572, low: 567, close: 570, timestamp: '2023-01-20T11:00:00Z' },
  { open: 570, high: 573, low: 568, close: 571, timestamp: '2023-01-20T12:00:00Z' },
  { open: 571, high: 574, low: 569, close: 572, timestamp: '2023-01-20T13:00:00Z' },
  { open: 572, high: 575, low: 570, close: 573, timestamp: '2023-01-20T14:00:00Z' },
  { open: 573, high: 576, low: 571, close: 574, timestamp: '2023-01-20T15:00:00Z' },
  { open: 574, high: 577, low: 572, close: 575, timestamp: '2023-01-20T16:00:00Z' },
  { open: 575, high: 578, low: 573, close: 576, timestamp: '2023-01-20T17:00:00Z' },
  { open: 576, high: 579, low: 574, close: 577, timestamp: '2023-01-20T18:00:00Z' },
  { open: 577, high: 580, low: 575, close: 578, timestamp: '2023-01-20T19:00:00Z' },
  { open: 578, high: 581, low: 576, close: 579, timestamp: '2023-01-20T20:00:00Z' },
  { open: 579, high: 582, low: 577, close: 580, timestamp: '2023-01-20T21:00:00Z' },
  { open: 580, high: 583, low: 578, close: 581, timestamp: '2023-01-20T22:00:00Z' },
  { open: 581, high: 584, low: 579, close: 582, timestamp: '2023-01-20T23:00:00Z' },
  { open: 582, high: 585, low: 580, close: 583, timestamp: '2023-01-21T00:00:00Z' },
  { open: 583, high: 586, low: 581, close: 584, timestamp: '2023-01-21T01:00:00Z' },
  { open: 584, high: 587, low: 582, close: 585, timestamp: '2023-01-21T02:00:00Z' },
  { open: 585, high: 588, low: 583, close: 586, timestamp: '2023-01-21T03:00:00Z' },
  { open: 586, high: 589, low: 584, close: 587, timestamp: '2023-01-21T04:00:00Z' },
  { open: 587, high: 590, low: 585, close: 588, timestamp: '2023-01-21T05:00:00Z' },
  { open: 588, high: 591, low: 586, close: 589, timestamp: '2023-01-21T06:00:00Z' },
  { open: 589, high: 592, low: 587, close: 590, timestamp: '2023-01-21T07:00:00Z' },
  { open: 590, high: 593, low: 588, close: 591, timestamp: '2023-01-21T08:00:00Z' },
  { open: 591, high: 594, low: 589, close: 592, timestamp: '2023-01-21T09:00:00Z' },
  { open: 592, high: 595, low: 590, close: 593, timestamp: '2023-01-21T10:00:00Z' },
  { open: 593, high: 596, low: 591, close: 594, timestamp: '2023-01-21T11:00:00Z' },
  { open: 594, high: 597, low: 592, close: 595, timestamp: '2023-01-21T12:00:00Z' },
  { open: 595, high: 598, low: 593, close: 596, timestamp: '2023-01-21T13:00:00Z' },
  { open: 596, high: 599, low: 594, close: 597, timestamp: '2023-01-21T14:00:00Z' },
  { open: 597, high: 600, low: 595, close: 598, timestamp: '2023-01-21T15:00:00Z' },
  { open: 598, high: 601, low: 596, close: 599, timestamp: '2023-01-21T16:00:00Z' },
  { open: 599, high: 602, low: 597, close: 600, timestamp: '2023-01-21T17:00:00Z' },
  { open: 600, high: 603, low: 598, close: 601, timestamp: '2023-01-21T18:00:00Z' },
  { open: 601, high: 604, low: 599, close: 602, timestamp: '2023-01-21T19:00:00Z' },
  { open: 602, high: 605, low: 600, close: 603, timestamp: '2023-01-21T20:00:00Z' },
  { open: 603, high: 606, low: 601, close: 604, timestamp: '2023-01-21T21:00:00Z' },
  { open: 604, high: 607, low: 602, close: 605, timestamp: '2023-01-21T22:00:00Z' },
  { open: 605, high: 608, low: 603, close: 606, timestamp: '2023-01-21T23:00:00Z' },
];

const qefxResults = calculateQuantumEdgeFX(sampleCandleData, {
  length: 14,
  predictiveLength: 28,
  volatilityThreshold: 0.75,
  smoothFactor: 2.0,
  useAdaptive: true,
  showZones: true,
  showSignals: true,
});

// Log the last few results to inspect the output
console.log("Last 10 Quantum Edge FX Results:");
qefxResults.slice(-10).forEach(result => {
  console.log(result);
});

// Example of how you might use the signals for alerts:
qefxResults.forEach(result => {
  if (result.buySignal) {
    console.log(`BUY Signal at ${result.timestamp}`);
  }
  if (result.sellSignal) {
    console.log(`SELL Signal at ${result.timestamp}`);
  }
});
