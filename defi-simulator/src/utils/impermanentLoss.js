/**
 * Enhanced Impermanent Loss (IL) Calculator
 *
 * Provides accurate IL calculations using:
 * - Actual reserve changes
 * - Constant product formula
 * - Fee compensation analysis
 * - Break-even calculations
 */

/**
 * Calculate impermanent loss from price ratio
 * Standard formula used across DeFi
 *
 * Formula: IL = 2 * sqrt(priceRatio) / (1 + priceRatio) - 1
 *
 * @param {number} priceRatio - currentPrice / initialPrice
 * @returns {number} - Impermanent loss as decimal (e.g., -0.05 for 5% loss)
 */
export function calculateILFromPriceRatio(priceRatio) {
  if (priceRatio <= 0) {
    throw new Error('Price ratio must be positive');
  }

  const il = 2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1;
  return il;
}

/**
 * Calculate IL from reserves (more accurate)
 * Uses actual reserve changes from AMM rebalancing
 *
 * @param {number} initialAmount0 - Initial token0 amount
 * @param {number} initialAmount1 - Initial token1 amount
 * @param {number} currentAmount0 - Current token0 amount
 * @param {number} currentAmount1 - Current token1 amount
 * @param {number} currentPrice - Current price of token0 in token1
 * @returns {Object} - IL details
 */
export function calculateILFromReserves(
  initialAmount0,
  initialAmount1,
  currentAmount0,
  currentAmount1,
  currentPrice
) {
  // Value if held (HODL value)
  const hodlValue = initialAmount0 * currentPrice + initialAmount1;

  // Current pool position value
  const poolValue = currentAmount0 * currentPrice + currentAmount1;

  // Impermanent loss
  const ilAmount = poolValue - hodlValue;
  const ilPercent = (ilAmount / hodlValue) * 100;

  return {
    hodlValue,
    poolValue,
    ilAmount,
    ilPercent,
    initialAmount0,
    initialAmount1,
    currentAmount0,
    currentAmount1
  };
}

/**
 * Calculate IL with fees earned
 * Shows net return after accounting for trading fees
 *
 * @param {number} ilPercent - IL percentage (negative value)
 * @param {number} feesEarnedPercent - Fees earned as percentage of initial investment
 * @returns {Object} - Net return analysis
 */
export function calculateNetReturnWithFees(ilPercent, feesEarnedPercent) {
  const netReturn = ilPercent + feesEarnedPercent;
  const breakEven = netReturn >= 0;

  return {
    ilPercent,
    feesEarnedPercent,
    netReturn,
    breakEven,
    feesNeededToBreakEven: breakEven ? 0 : Math.abs(ilPercent)
  };
}

/**
 * Calculate days needed to break even on IL through fees
 *
 * @param {number} ilPercent - IL percentage (positive value, e.g., 5 for 5%)
 * @param {number} dailyFeeAPR - Daily fee APR (annual rate / 365)
 * @returns {number} - Days needed to break even
 */
export function calculateBreakEvenDays(ilPercent, dailyFeeAPR) {
  if (dailyFeeAPR <= 0) {
    return Infinity;
  }

  return Math.abs(ilPercent) / dailyFeeAPR;
}

/**
 * Calculate IL for different price scenarios
 * Useful for showing risk at various price points
 *
 * @param {number} initialPrice - Starting price
 * @param {number[]} priceMultipliers - Array of multipliers (e.g., [0.5, 0.75, 1, 1.5, 2])
 * @returns {Array} - IL scenarios
 */
export function calculateILScenarios(initialPrice, priceMultipliers) {
  return priceMultipliers.map(multiplier => {
    const newPrice = initialPrice * multiplier;
    const priceRatio = newPrice / initialPrice;
    const il = calculateILFromPriceRatio(priceRatio);
    const ilPercent = il * 100;

    return {
      multiplier,
      newPrice,
      priceChange: (multiplier - 1) * 100,
      ilPercent: ilPercent,
      ilAmount: il
    };
  });
}

/**
 * Calculate token composition changes due to IL
 * Shows how token ratios shift as price moves
 *
 * @param {number} initialAmount0 - Initial token0 amount
 * @param {number} initialAmount1 - Initial token1 amount
 * @param {number} initialPrice - Initial price
 * @param {number} newPrice - New price
 * @returns {Object} - Token rebalancing details
 */
export function calculateTokenRebalancing(initialAmount0, initialAmount1, initialPrice, newPrice) {
  // Calculate initial k value (constant product)
  const k = initialAmount0 * initialAmount1;

  // Calculate new amounts at new price
  // Using constant product: x * y = k
  // And price constraint: y / x = price
  const newAmount0 = Math.sqrt(k / newPrice);
  const newAmount1 = Math.sqrt(k * newPrice);

  // Changes in token amounts
  const amount0Change = newAmount0 - initialAmount0;
  const amount1Change = newAmount1 - initialAmount1;

  return {
    initial: {
      amount0: initialAmount0,
      amount1: initialAmount1,
      price: initialPrice,
      value: initialAmount0 * initialPrice + initialAmount1
    },
    current: {
      amount0: newAmount0,
      amount1: newAmount1,
      price: newPrice,
      value: newAmount0 * newPrice + newAmount1
    },
    changes: {
      amount0: amount0Change,
      amount1: amount1Change,
      amount0Percent: (amount0Change / initialAmount0) * 100,
      amount1Percent: (amount1Change / initialAmount1) * 100
    }
  };
}

/**
 * Calculate divergence loss (another name for IL)
 * Shows loss relative to holding both tokens
 *
 * @param {number} priceChange - Price change percentage (e.g., 50 for 50% increase)
 * @returns {Object} - Divergence loss details
 */
export function calculateDivergenceLoss(priceChange) {
  const multiplier = 1 + (priceChange / 100);
  const il = calculateILFromPriceRatio(multiplier);

  return {
    priceChange,
    priceMultiplier: multiplier,
    divergenceLoss: il,
    divergenceLossPercent: il * 100,
    hodlReturn: priceChange / 2, // Average return of holding 50/50
    lpReturn: (priceChange / 2) + (il * 100) // LP return considering IL
  };
}

/**
 * Calculate IL for Uniswap V3 concentrated liquidity position
 * More complex due to range-specific exposure
 *
 * @param {number} currentPrice - Current price
 * @param {number} initialPrice - Price when position opened
 * @param {number} priceLower - Lower price bound
 * @param {number} priceUpper - Upper price bound
 * @param {number} initialAmount0 - Initial token0 amount
 * @param {number} initialAmount1 - Initial token1 amount
 * @returns {Object} - V3 IL details
 */
export function calculateV3IL(
  currentPrice,
  initialPrice,
  priceLower,
  priceUpper,
  initialAmount0,
  initialAmount1
) {
  // Determine if price is in range
  const inRange = currentPrice >= priceLower && currentPrice <= priceUpper;

  let ilPercent;
  let status;

  if (!inRange) {
    if (currentPrice < priceLower) {
      // All in token0 - maximum IL when below range
      status = 'below_range';
      const priceRatio = currentPrice / initialPrice;
      ilPercent = calculateILFromPriceRatio(priceRatio) * 100;
    } else {
      // All in token1 - maximum IL when above range
      status = 'above_range';
      const priceRatio = currentPrice / initialPrice;
      ilPercent = calculateILFromPriceRatio(priceRatio) * 100;
    }
  } else {
    // In range - calculate based on price movement within range
    status = 'in_range';
    const priceRatio = currentPrice / initialPrice;
    ilPercent = calculateILFromPriceRatio(priceRatio) * 100;
  }

  // Calculate value comparison
  const hodlValue = initialAmount0 * currentPrice + initialAmount1;
  const ilAmount = (hodlValue * Math.abs(ilPercent)) / 100;

  return {
    status,
    inRange,
    currentPrice,
    initialPrice,
    priceLower,
    priceUpper,
    ilPercent,
    ilAmount,
    hodlValue,
    estimatedPoolValue: hodlValue + ilAmount
  };
}

/**
 * Calculate optimal price range to minimize IL
 * Wider range = less IL but lower fees
 *
 * @param {number} currentPrice - Current price
 * @param {number} volatility - Expected volatility (e.g., 0.2 for 20%)
 * @param {number} riskTolerance - Risk tolerance (0-1, where 1 is highest tolerance)
 * @returns {Object} - Range recommendation
 */
export function suggestOptimalRange(currentPrice, volatility, riskTolerance = 0.5) {
  // Conservative: wider range, less IL, lower fees
  // Aggressive: narrower range, more IL, higher fees

  const baseRange = volatility * (1 - riskTolerance);
  const lowerMultiplier = 1 - baseRange;
  const upperMultiplier = 1 + baseRange;

  const priceLower = currentPrice * lowerMultiplier;
  const priceUpper = currentPrice * upperMultiplier;
  const rangeWidth = ((priceUpper - priceLower) / currentPrice) * 100;

  // Estimate max IL if price hits range boundary
  const maxIL = calculateILFromPriceRatio(upperMultiplier) * 100;

  return {
    priceLower,
    priceUpper,
    rangeWidth,
    maxILPercent: Math.abs(maxIL),
    recommendation: riskTolerance > 0.7 ? 'aggressive' : riskTolerance > 0.4 ? 'balanced' : 'conservative'
  };
}

/**
 * Calculate IL impact on different portfolio allocations
 *
 * @param {number} portfolioValue - Total portfolio value
 * @param {number} lpAllocationPercent - Percentage allocated to LP (0-100)
 * @param {number} ilPercent - IL percentage
 * @returns {Object} - Portfolio impact
 */
export function calculatePortfolioILImpact(portfolioValue, lpAllocationPercent, ilPercent) {
  const lpValue = (portfolioValue * lpAllocationPercent) / 100;
  const hodlValue = portfolioValue - lpValue;
  const ilAmount = (lpValue * Math.abs(ilPercent)) / 100;
  const newLpValue = lpValue - ilAmount;
  const newTotalValue = newLpValue + hodlValue;

  return {
    initial: {
      total: portfolioValue,
      lp: lpValue,
      hodl: hodlValue,
      lpPercent: lpAllocationPercent
    },
    withIL: {
      total: newTotalValue,
      lp: newLpValue,
      hodl: hodlValue,
      ilImpact: ilAmount,
      totalLossPercent: ((newTotalValue - portfolioValue) / portfolioValue) * 100
    }
  };
}
