/**
 * Enhanced AMM (Automated Market Maker) Calculations
 * Based on Uniswap V2/V3 constant product formula: x * y = k
 *
 * Incorporates realistic DeFi mechanics:
 * - Constant product formula for reserves
 * - LP share tracking
 * - Multiple fee tiers
 * - Slippage calculations
 * - Price impact analysis
 */

/**
 * Fee tiers matching Uniswap V3
 */
export const FEE_TIERS = {
  LOW: {
    rate: 0.0005,      // 0.05% - for stablecoin pairs
    rateInBps: 5,      // 5 basis points
    name: 'Low (0.05%)',
    description: 'Best for stablecoin pairs with minimal volatility'
  },
  MEDIUM: {
    rate: 0.003,       // 0.3% - standard for most pairs
    rateInBps: 30,     // 30 basis points
    name: 'Medium (0.3%)',
    description: 'Standard fee for most trading pairs'
  },
  HIGH: {
    rate: 0.01,        // 1% - for exotic or volatile pairs
    rateInBps: 100,    // 100 basis points
    name: 'High (1%)',
    description: 'For exotic pairs with high volatility'
  }
};

/**
 * Calculate geometric mean for initial LP shares
 * Formula: sqrt(amount0 * amount1)
 *
 * @param {number} amount0 - Amount of token0
 * @param {number} amount1 - Amount of token1
 * @returns {number} - Initial LP shares
 */
export function calculateInitialShares(amount0, amount1) {
  if (amount0 <= 0 || amount1 <= 0) {
    throw new Error('Amounts must be positive');
  }
  return Math.sqrt(amount0 * amount1);
}

/**
 * Calculate LP shares for additional liquidity
 * Formula: min(amount0 * totalShares / reserve0, amount1 * totalShares / reserve1)
 *
 * @param {number} amount0 - Amount of token0 to add
 * @param {number} amount1 - Amount of token1 to add
 * @param {number} reserve0 - Current reserve of token0
 * @param {number} reserve1 - Current reserve of token1
 * @param {number} totalShares - Total existing LP shares
 * @returns {number} - LP shares to mint
 */
export function calculateLPShares(amount0, amount1, reserve0, reserve1, totalShares) {
  if (totalShares === 0) {
    return calculateInitialShares(amount0, amount1);
  }

  const shares0 = (amount0 * totalShares) / reserve0;
  const shares1 = (amount1 * totalShares) / reserve1;

  // Return minimum to ensure balanced addition
  return Math.min(shares0, shares1);
}

/**
 * Calculate token amounts from LP shares when removing liquidity
 *
 * @param {number} shares - LP shares to burn
 * @param {number} totalShares - Total LP shares
 * @param {number} reserve0 - Current reserve of token0
 * @param {number} reserve1 - Current reserve of token1
 * @returns {Object} - {amount0, amount1}
 */
export function calculateRemoveLiquidity(shares, totalShares, reserve0, reserve1) {
  if (shares > totalShares) {
    throw new Error('Cannot burn more shares than total supply');
  }

  const amount0 = (shares * reserve0) / totalShares;
  const amount1 = (shares * reserve1) / totalShares;

  return { amount0, amount1 };
}

/**
 * Calculate swap output using constant product formula with fees
 * Formula: amountOut = (reserveOut * amountIn * (1 - fee)) / (reserveIn + amountIn * (1 - fee))
 *
 * @param {number} amountIn - Input amount
 * @param {number} reserveIn - Reserve of input token
 * @param {number} reserveOut - Reserve of output token
 * @param {number} feeRate - Fee rate (e.g., 0.003 for 0.3%)
 * @returns {Object} - {amountOut, priceImpact, effectivePrice}
 */
export function calculateSwapOutput(amountIn, reserveIn, reserveOut, feeRate = FEE_TIERS.MEDIUM.rate) {
  if (amountIn <= 0 || reserveIn <= 0 || reserveOut <= 0) {
    throw new Error('Amounts and reserves must be positive');
  }

  // Calculate amount after fee
  const amountInWithFee = amountIn * (1 - feeRate);

  // Constant product formula: x * y = k
  // amountOut = (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee)
  const amountOut = (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee);

  // Calculate price impact
  const spotPrice = reserveOut / reserveIn;
  const effectivePrice = amountOut / amountIn;
  const priceImpact = ((spotPrice - effectivePrice) / spotPrice) * 100;

  return {
    amountOut,
    priceImpact,
    effectivePrice,
    spotPrice,
    feeAmount: amountIn * feeRate
  };
}

/**
 * Calculate price impact of a trade
 * Shows how much the trade moves the price
 *
 * @param {number} amountIn - Amount being traded
 * @param {number} reserveIn - Reserve of input token
 * @param {number} reserveOut - Reserve of output token
 * @returns {number} - Price impact percentage
 */
export function calculatePriceImpact(amountIn, reserveIn, reserveOut) {
  const { priceImpact } = calculateSwapOutput(amountIn, reserveIn, reserveOut);
  return priceImpact;
}

/**
 * Calculate slippage tolerance needed for a trade
 *
 * @param {number} expectedOut - Expected output amount
 * @param {number} minOut - Minimum acceptable output
 * @returns {number} - Slippage tolerance percentage
 */
export function calculateSlippage(expectedOut, minOut) {
  return ((expectedOut - minOut) / expectedOut) * 100;
}

/**
 * Calculate minimum output with slippage tolerance
 *
 * @param {number} expectedOut - Expected output amount
 * @param {number} slippageTolerance - Slippage tolerance percentage (e.g., 0.5 for 0.5%)
 * @returns {number} - Minimum output amount
 */
export function calculateMinOutput(expectedOut, slippageTolerance) {
  return expectedOut * (1 - slippageTolerance / 100);
}

/**
 * Calculate spot price from reserves
 * Formula: price = reserve1 / reserve0
 *
 * @param {number} reserve0 - Reserve of token0
 * @param {number} reserve1 - Reserve of token1
 * @returns {number} - Spot price (token1 per token0)
 */
export function calculateSpotPrice(reserve0, reserve1) {
  if (reserve0 <= 0) {
    throw new Error('Reserve0 must be positive');
  }
  return reserve1 / reserve0;
}

/**
 * Calculate new reserves after a swap
 *
 * @param {number} amountIn - Input amount
 * @param {number} amountOut - Output amount
 * @param {number} reserveIn - Current reserve of input token
 * @param {number} reserveOut - Current reserve of output token
 * @param {boolean} isToken0In - True if swapping token0 for token1
 * @returns {Object} - {reserve0, reserve1}
 */
export function calculateNewReserves(amountIn, amountOut, reserveIn, reserveOut, isToken0In) {
  const newReserveIn = reserveIn + amountIn;
  const newReserveOut = reserveOut - amountOut;

  return isToken0In
    ? { reserve0: newReserveIn, reserve1: newReserveOut }
    : { reserve0: newReserveOut, reserve1: newReserveIn };
}

/**
 * Calculate optimal amounts for balanced liquidity addition
 * Given one amount, calculate the other to maintain pool ratio
 *
 * @param {number} amount - Amount of one token
 * @param {boolean} isToken0 - True if amount is for token0
 * @param {number} reserve0 - Current reserve of token0
 * @param {number} reserve1 - Current reserve of token1
 * @returns {Object} - {amount0, amount1}
 */
export function calculateBalancedAmounts(amount, isToken0, reserve0, reserve1) {
  if (reserve0 <= 0 || reserve1 <= 0) {
    throw new Error('Reserves must be positive');
  }

  const ratio = reserve1 / reserve0;

  if (isToken0) {
    return {
      amount0: amount,
      amount1: amount * ratio
    };
  } else {
    return {
      amount0: amount / ratio,
      amount1: amount
    };
  }
}

/**
 * Simulate multiple swaps to show how reserves change
 * Useful for understanding liquidity depth
 *
 * @param {Array} trades - Array of {amountIn, isToken0In}
 * @param {number} initialReserve0 - Initial reserve of token0
 * @param {number} initialReserve1 - Initial reserve of token1
 * @param {number} feeRate - Fee rate
 * @returns {Array} - Array of reserve states after each trade
 */
export function simulateMultipleSwaps(trades, initialReserve0, initialReserve1, feeRate = FEE_TIERS.MEDIUM.rate) {
  let reserve0 = initialReserve0;
  let reserve1 = initialReserve1;
  const results = [];

  for (const trade of trades) {
    const { amountIn, isToken0In } = trade;
    const [reserveIn, reserveOut] = isToken0In
      ? [reserve0, reserve1]
      : [reserve1, reserve0];

    const swapResult = calculateSwapOutput(amountIn, reserveIn, reserveOut, feeRate);
    const newReserves = calculateNewReserves(
      amountIn,
      swapResult.amountOut,
      reserveIn,
      reserveOut,
      isToken0In
    );

    reserve0 = newReserves.reserve0;
    reserve1 = newReserves.reserve1;

    results.push({
      reserve0,
      reserve1,
      spotPrice: calculateSpotPrice(reserve0, reserve1),
      ...swapResult
    });
  }

  return results;
}

/**
 * Calculate TVL (Total Value Locked) in USD
 *
 * @param {number} reserve0 - Reserve of token0
 * @param {number} reserve1 - Reserve of token1 (assumed to be USD)
 * @param {number} price0 - Price of token0 in USD
 * @returns {number} - TVL in USD
 */
export function calculateTVL(reserve0, reserve1, price0) {
  return reserve0 * price0 + reserve1;
}

/**
 * Calculate pool share percentage
 *
 * @param {number} userShares - User's LP shares
 * @param {number} totalShares - Total LP shares
 * @returns {number} - Percentage of pool owned
 */
export function calculatePoolShare(userShares, totalShares) {
  if (totalShares === 0) return 0;
  return (userShares / totalShares) * 100;
}
