/**
 * Comprehensive Pool Metrics and Analytics
 *
 * Provides DeFi pool health and performance metrics:
 * - TVL (Total Value Locked) tracking
 * - Volume and liquidity analysis
 * - Pool utilization metrics
 * - Performance indicators
 * - Risk metrics
 */

import { calculateTVL, calculateSpotPrice, calculatePoolShare } from './ammCalculations';
import { calculateILFromPriceRatio, calculateNetReturnWithFees } from './impermanentLoss';

/**
 * Calculate comprehensive pool health metrics
 *
 * @param {Object} pool - Pool data
 * @returns {Object} - Health metrics
 */
export function calculatePoolHealth(pool) {
  const {
    reserve0,
    reserve1,
    price0,
    volume24h = 0,
    feesGenerated24h = 0,
    initialReserve0,
    initialReserve1,
    initialPrice0
  } = pool;

  // Basic metrics
  const tvl = calculateTVL(reserve0, reserve1, price0);
  const spotPrice = calculateSpotPrice(reserve0, reserve1);

  // Liquidity depth (how much can be traded with minimal slippage)
  const liquidityDepth = Math.min(reserve0 * price0, reserve1);

  // Volume to TVL ratio (higher = more active trading)
  const volumeToTVLRatio = tvl > 0 ? volume24h / tvl : 0;

  // Fee generation rate
  const feeAPR = tvl > 0 ? (feesGenerated24h * 365 / tvl) * 100 : 0;

  // Price change
  const priceChange = initialPrice0 > 0
    ? ((price0 - initialPrice0) / initialPrice0) * 100
    : 0;

  // Impermanent loss if applicable
  let il = 0;
  if (initialPrice0 > 0) {
    const priceRatio = price0 / initialPrice0;
    il = calculateILFromPriceRatio(priceRatio) * 100;
  }

  return {
    tvl,
    spotPrice,
    liquidityDepth,
    volumeToTVLRatio,
    feeAPR,
    priceChange,
    impermanentLoss: il,
    volume24h,
    feesGenerated24h,
    health: calculateHealthScore({
      volumeToTVLRatio,
      liquidityDepth: liquidityDepth / tvl,
      feeAPR
    })
  };
}

/**
 * Calculate pool health score (0-100)
 *
 * @param {Object} metrics - {volumeToTVLRatio, liquidityDepth, feeAPR}
 * @returns {number} - Health score 0-100
 */
export function calculateHealthScore(metrics) {
  const { volumeToTVLRatio, liquidityDepth, feeAPR } = metrics;

  // Volume score (0-40 points) - higher volume = healthier
  const volumeScore = Math.min((volumeToTVLRatio / 2) * 40, 40);

  // Liquidity score (0-30 points) - deeper liquidity = healthier
  const liquidityScore = Math.min(liquidityDepth * 100 * 30, 30);

  // Fee score (0-30 points) - sustainable fees = healthier
  const feeScore = Math.min((feeAPR / 50) * 30, 30);

  return Math.round(volumeScore + liquidityScore + feeScore);
}

/**
 * Calculate liquidity utilization
 * Shows how efficiently liquidity is being used
 *
 * @param {number} volume24h - 24h trading volume
 * @param {number} tvl - Total value locked
 * @returns {Object} - Utilization metrics
 */
export function calculateLiquidityUtilization(volume24h, tvl) {
  const utilizationRate = tvl > 0 ? (volume24h / tvl) * 100 : 0;

  let efficiency;
  if (utilizationRate < 10) efficiency = 'low';
  else if (utilizationRate < 50) efficiency = 'moderate';
  else if (utilizationRate < 100) efficiency = 'high';
  else efficiency = 'very_high';

  return {
    volume24h,
    tvl,
    utilizationRate,
    efficiency,
    annualizedVolume: volume24h * 365
  };
}

/**
 * Calculate fee performance metrics
 *
 * @param {number} feesEarned - Total fees earned
 * @param {number} initialInvestment - Initial LP investment
 * @param {number} daysElapsed - Days since investment
 * @returns {Object} - Fee performance
 */
export function calculateFeePerformance(feesEarned, initialInvestment, daysElapsed) {
  const feeYield = initialInvestment > 0 ? (feesEarned / initialInvestment) * 100 : 0;
  const dailyFeeRate = daysElapsed > 0 ? feesEarned / daysElapsed / initialInvestment : 0;
  const annualizedFeeAPR = dailyFeeRate * 365 * 100;

  return {
    feesEarned,
    feeYield,
    dailyFeeRate: dailyFeeRate * 100,
    annualizedFeeAPR,
    projectedYearlyFees: initialInvestment * annualizedFeeAPR / 100
  };
}

/**
 * Calculate position performance including all factors
 *
 * @param {Object} position - Position data
 * @returns {Object} - Comprehensive performance
 */
export function calculatePositionPerformance(position) {
  const {
    initialValue,
    currentValue,
    feesEarned,
    impermanentLoss,
    daysHeld
  } = position;

  // Net returns
  const totalReturn = currentValue + feesEarned - impermanentLoss - initialValue;
  const totalReturnPercent = initialValue > 0 ? (totalReturn / initialValue) * 100 : 0;

  // Component breakdown
  const priceReturn = currentValue - initialValue;
  const priceReturnPercent = initialValue > 0 ? (priceReturn / initialValue) * 100 : 0;
  const feesPercent = initialValue > 0 ? (feesEarned / initialValue) * 100 : 0;
  const ilPercent = initialValue > 0 ? (impermanentLoss / initialValue) * 100 : 0;

  // Daily and annualized metrics
  const dailyReturn = daysHeld > 0 ? totalReturn / daysHeld : 0;
  const dailyReturnPercent = daysHeld > 0 ? totalReturnPercent / daysHeld : 0;
  const annualizedReturn = dailyReturnPercent * 365;

  return {
    initial: initialValue,
    current: currentValue,
    fees: feesEarned,
    il: impermanentLoss,
    totalReturn,
    returns: {
      total: totalReturnPercent,
      price: priceReturnPercent,
      fees: feesPercent,
      il: -ilPercent // Negative because it's a loss
    },
    daily: {
      return: dailyReturn,
      returnPercent: dailyReturnPercent
    },
    annualized: {
      return: dailyReturn * 365,
      returnPercent: annualizedReturn
    },
    daysHeld,
    profitable: totalReturn > 0
  };
}

/**
 * Calculate risk metrics for a position
 *
 * @param {Object} position - Position data
 * @returns {Object} - Risk metrics
 */
export function calculateRiskMetrics(position) {
  const {
    currentPrice,
    initialPrice,
    priceLower,
    priceUpper,
    volatility = 0.2 // Default 20% volatility
  } = position;

  // Price range position
  const priceRange = priceUpper - priceLower;
  const currentPricePosition = (currentPrice - priceLower) / priceRange;

  // Distance to range boundaries (as percentage)
  const distanceToLower = ((currentPrice - priceLower) / currentPrice) * 100;
  const distanceToUpper = ((priceUpper - currentPrice) / currentPrice) * 100;

  // Risk of going out of range
  const outOfRangeRisk = Math.min(distanceToLower, distanceToUpper) / (volatility * 100);

  // Maximum potential IL
  const maxILLower = calculateILFromPriceRatio(priceLower / initialPrice) * 100;
  const maxILUpper = calculateILFromPriceRatio(priceUpper / initialPrice) * 100;
  const maxPotentialIL = Math.max(Math.abs(maxILLower), Math.abs(maxILUpper));

  // Risk level
  let riskLevel;
  if (maxPotentialIL < 5) riskLevel = 'low';
  else if (maxPotentialIL < 15) riskLevel = 'moderate';
  else if (maxPotentialIL < 30) riskLevel = 'high';
  else riskLevel = 'very_high';

  return {
    currentPricePosition,
    distanceToLower,
    distanceToUpper,
    outOfRangeRisk: outOfRangeRisk > 1 ? 'low' : 'high',
    maxPotentialIL,
    riskLevel,
    volatility: volatility * 100
  };
}

/**
 * Compare multiple pools/positions
 *
 * @param {Array} positions - Array of position objects
 * @returns {Array} - Ranked positions with scores
 */
export function rankPositions(positions) {
  return positions.map(position => {
    const performance = calculatePositionPerformance(position);
    const risk = calculateRiskMetrics(position);

    // Calculate score (0-100)
    // 50% performance, 30% fees, 20% risk
    const performanceScore = Math.max(0, Math.min(performance.returns.total, 100)) * 0.5;
    const feeScore = Math.max(0, Math.min(performance.returns.fees, 50)) * 0.6; // Up to 30 points
    const riskScore = risk.riskLevel === 'low' ? 20 : risk.riskLevel === 'moderate' ? 15 : risk.riskLevel === 'high' ? 10 : 5;

    const totalScore = performanceScore + feeScore + riskScore;

    return {
      ...position,
      performance,
      risk,
      score: Math.round(totalScore),
      rank: 0 // Will be assigned after sorting
    };
  }).sort((a, b) => b.score - a.score)
    .map((position, index) => ({
      ...position,
      rank: index + 1
    }));
}

/**
 * Calculate pool concentration metrics
 * For Uniswap V3 concentrated liquidity
 *
 * @param {number} priceLower - Lower price bound
 * @param {number} priceUpper - Upper price bound
 * @param {number} currentPrice - Current price
 * @returns {Object} - Concentration metrics
 */
export function calculateConcentration(priceLower, priceUpper, currentPrice) {
  const rangeWidth = ((priceUpper - priceLower) / currentPrice) * 100;

  // Concentration multiplier (how much more fees vs full range)
  // Rough approximation: smaller range = higher concentration
  const baselineRange = 200; // 200% = 2x price (full range equivalent)
  const concentrationMultiplier = baselineRange / rangeWidth;

  let concentrationLevel;
  if (rangeWidth > 150) concentrationLevel = 'low';
  else if (rangeWidth > 50) concentrationLevel = 'moderate';
  else if (rangeWidth > 20) concentrationLevel = 'high';
  else concentrationLevel = 'very_high';

  return {
    rangeWidth,
    concentrationMultiplier: Math.min(concentrationMultiplier, 10), // Cap at 10x
    concentrationLevel,
    feeBoost: Math.min(concentrationMultiplier, 10)
  };
}

/**
 * Calculate historical performance metrics
 *
 * @param {Array} snapshots - Array of historical data points
 * @returns {Object} - Historical metrics
 */
export function calculateHistoricalMetrics(snapshots) {
  if (snapshots.length < 2) {
    return {
      totalReturn: 0,
      averageDailyReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0
    };
  }

  // Calculate returns
  const returns = [];
  let maxValue = snapshots[0].value;
  let maxDrawdown = 0;

  for (let i = 1; i < snapshots.length; i++) {
    const dailyReturn = (snapshots[i].value - snapshots[i - 1].value) / snapshots[i - 1].value;
    returns.push(dailyReturn);

    // Track drawdown
    if (snapshots[i].value > maxValue) {
      maxValue = snapshots[i].value;
    } else {
      const drawdown = (maxValue - snapshots[i].value) / maxValue;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
  }

  // Average daily return
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;

  // Volatility (standard deviation)
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance);

  // Sharpe ratio (assuming 0% risk-free rate)
  const sharpeRatio = volatility > 0 ? (avgReturn / volatility) * Math.sqrt(365) : 0;

  // Total return
  const totalReturn = (snapshots[snapshots.length - 1].value - snapshots[0].value) / snapshots[0].value;

  return {
    totalReturn: totalReturn * 100,
    averageDailyReturn: avgReturn * 100,
    volatility: volatility * 100,
    sharpeRatio,
    maxDrawdown: maxDrawdown * 100,
    daysTracked: snapshots.length - 1
  };
}

/**
 * Generate pool analytics summary
 *
 * @param {Object} poolData - Complete pool data
 * @returns {Object} - Analytics summary
 */
export function generatePoolAnalytics(poolData) {
  const health = calculatePoolHealth(poolData);
  const utilization = calculateLiquidityUtilization(poolData.volume24h, health.tvl);
  const feePerf = calculateFeePerformance(
    poolData.feesEarned || 0,
    poolData.initialInvestment || health.tvl,
    poolData.daysElapsed || 1
  );

  return {
    summary: {
      tvl: health.tvl,
      volume24h: poolData.volume24h,
      feeAPR: health.feeAPR,
      healthScore: health.health
    },
    health,
    utilization,
    feePerformance: feePerf,
    recommendation: generateRecommendation(health, utilization, feePerf)
  };
}

/**
 * Generate recommendation based on metrics
 *
 * @param {Object} health - Health metrics
 * @param {Object} utilization - Utilization metrics
 * @param {Object} feePerf - Fee performance
 * @returns {string} - Recommendation
 */
function generateRecommendation(health, utilization, feePerf) {
  if (health.health > 80 && feePerf.annualizedFeeAPR > 20) {
    return 'excellent_opportunity';
  } else if (health.health > 60 && utilization.efficiency !== 'low') {
    return 'good_opportunity';
  } else if (health.health > 40) {
    return 'moderate_opportunity';
  } else {
    return 'high_risk';
  }
}
