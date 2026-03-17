/**
 * Uniswap V3 Concentrated Liquidity Math
 * Based on Uniswap V3 Core whitepaper
 * https://uniswap.org/whitepaper-v3.pdf
 */

// Constants
const Q96 = Math.pow(2, 96);
const MIN_TICK = -887272;
const MAX_TICK = 887272;

/**
 * Convert price to sqrt price (Q64.96 format)
 * @param {number} price - Price as token1/token0
 * @returns {number} - Square root of price
 */
export function priceToSqrtPrice(price) {
  return Math.sqrt(price);
}

/**
 * Convert sqrt price to price
 * @param {number} sqrtPrice - Square root of price
 * @returns {number} - Price as token1/token0
 */
export function sqrtPriceToPrice(sqrtPrice) {
  return sqrtPrice * sqrtPrice;
}

/**
 * Convert price to tick
 * @param {number} price - Price as token1/token0
 * @returns {number} - Tick index
 */
export function priceToTick(price) {
  return Math.floor(Math.log(price) / Math.log(1.0001));
}

/**
 * Convert tick to price
 * @param {number} tick - Tick index
 * @returns {number} - Price as token1/token0
 */
export function tickToPrice(tick) {
  return Math.pow(1.0001, tick);
}

/**
 * Calculate liquidity from token0 amount
 * Formula: L = amount0 * (sqrtP_upper * sqrtP_lower) / (sqrtP_upper - sqrtP_lower)
 *
 * @param {number} amount0 - Amount of token0
 * @param {number} sqrtPriceLower - Square root of lower price bound
 * @param {number} sqrtPriceUpper - Square root of upper price bound
 * @returns {number} - Liquidity
 */
export function getLiquidityForAmount0(amount0, sqrtPriceLower, sqrtPriceUpper) {
  if (sqrtPriceUpper <= sqrtPriceLower) {
    throw new Error('sqrtPriceUpper must be greater than sqrtPriceLower');
  }

  const numerator = amount0 * sqrtPriceLower * sqrtPriceUpper;
  const denominator = sqrtPriceUpper - sqrtPriceLower;

  return numerator / denominator;
}

/**
 * Calculate liquidity from token1 amount
 * Formula: L = amount1 / (sqrtP_upper - sqrtP_lower)
 *
 * @param {number} amount1 - Amount of token1
 * @param {number} sqrtPriceLower - Square root of lower price bound
 * @param {number} sqrtPriceUpper - Square root of upper price bound
 * @returns {number} - Liquidity
 */
export function getLiquidityForAmount1(amount1, sqrtPriceLower, sqrtPriceUpper) {
  if (sqrtPriceUpper <= sqrtPriceLower) {
    throw new Error('sqrtPriceUpper must be greater than sqrtPriceLower');
  }

  return amount1 / (sqrtPriceUpper - sqrtPriceLower);
}

/**
 * Calculate liquidity from amounts (when current price is in range)
 * @param {number} amount0 - Amount of token0
 * @param {number} amount1 - Amount of token1
 * @param {number} sqrtPriceCurrent - Square root of current price
 * @param {number} sqrtPriceLower - Square root of lower price bound
 * @param {number} sqrtPriceUpper - Square root of upper price bound
 * @returns {number} - Liquidity
 */
export function getLiquidityForAmounts(
  amount0,
  amount1,
  sqrtPriceCurrent,
  sqrtPriceLower,
  sqrtPriceUpper
) {
  if (sqrtPriceCurrent <= sqrtPriceLower) {
    // Current price below range, only token0 used
    return getLiquidityForAmount0(amount0, sqrtPriceLower, sqrtPriceUpper);
  } else if (sqrtPriceCurrent >= sqrtPriceUpper) {
    // Current price above range, only token1 used
    return getLiquidityForAmount1(amount1, sqrtPriceLower, sqrtPriceUpper);
  } else {
    // Current price in range, use both tokens
    const liquidity0 = getLiquidityForAmount0(amount0, sqrtPriceCurrent, sqrtPriceUpper);
    const liquidity1 = getLiquidityForAmount1(amount1, sqrtPriceLower, sqrtPriceCurrent);

    // Return the minimum to ensure both amounts are sufficient
    return Math.min(liquidity0, liquidity1);
  }
}

/**
 * Calculate amount of token0 needed for given liquidity
 * Formula: amount0 = L * (sqrtP_upper - sqrtP_current) / (sqrtP_upper * sqrtP_current)
 *
 * @param {number} liquidity - Liquidity amount
 * @param {number} sqrtPriceCurrent - Square root of current price
 * @param {number} sqrtPriceUpper - Square root of upper price bound
 * @returns {number} - Amount of token0
 */
export function getAmount0ForLiquidity(liquidity, sqrtPriceCurrent, sqrtPriceUpper) {
  if (sqrtPriceCurrent >= sqrtPriceUpper) {
    return 0;
  }

  return liquidity * (sqrtPriceUpper - sqrtPriceCurrent) / (sqrtPriceUpper * sqrtPriceCurrent);
}

/**
 * Calculate amount of token1 needed for given liquidity
 * Formula: amount1 = L * (sqrtP_current - sqrtP_lower)
 *
 * @param {number} liquidity - Liquidity amount
 * @param {number} sqrtPriceLower - Square root of lower price bound
 * @param {number} sqrtPriceCurrent - Square root of current price
 * @returns {number} - Amount of token1
 */
export function getAmount1ForLiquidity(liquidity, sqrtPriceLower, sqrtPriceCurrent) {
  if (sqrtPriceCurrent <= sqrtPriceLower) {
    return 0;
  }

  return liquidity * (sqrtPriceCurrent - sqrtPriceLower);
}

/**
 * Calculate token amounts needed for a position
 * @param {number} liquidity - Desired liquidity
 * @param {number} currentPrice - Current price
 * @param {number} priceLower - Lower price bound
 * @param {number} priceUpper - Upper price bound
 * @returns {Object} - {amount0, amount1, inRange}
 */
export function getTokenAmounts(liquidity, currentPrice, priceLower, priceUpper) {
  const sqrtPriceCurrent = priceToSqrtPrice(currentPrice);
  const sqrtPriceLower = priceToSqrtPrice(priceLower);
  const sqrtPriceUpper = priceToSqrtPrice(priceUpper);

  let amount0 = 0;
  let amount1 = 0;
  let inRange = true;

  if (sqrtPriceCurrent < sqrtPriceLower) {
    // Price below range - only token0 needed
    amount0 = getAmount0ForLiquidity(liquidity, sqrtPriceLower, sqrtPriceUpper);
    amount1 = 0;
    inRange = false;
  } else if (sqrtPriceCurrent > sqrtPriceUpper) {
    // Price above range - only token1 needed
    amount0 = 0;
    amount1 = getAmount1ForLiquidity(liquidity, sqrtPriceLower, sqrtPriceUpper);
    inRange = false;
  } else {
    // Price in range - both tokens needed
    amount0 = getAmount0ForLiquidity(liquidity, sqrtPriceCurrent, sqrtPriceUpper);
    amount1 = getAmount1ForLiquidity(liquidity, sqrtPriceLower, sqrtPriceCurrent);
    inRange = true;
  }

  return { amount0, amount1, inRange };
}

/**
 * Calculate liquidity from a single token amount and price range
 * User provides one token amount, we calculate required liquidity
 *
 * @param {number} tokenAmount - Amount of token being provided
 * @param {boolean} isToken0 - True if providing token0, false for token1
 * @param {number} currentPrice - Current price
 * @param {number} priceLower - Lower price bound
 * @param {number} priceUpper - Upper price bound
 * @returns {Object} - {liquidity, amount0, amount1}
 */
export function calculatePositionFromAmount(
  tokenAmount,
  isToken0,
  currentPrice,
  priceLower,
  priceUpper
) {
  const sqrtPriceCurrent = priceToSqrtPrice(currentPrice);
  const sqrtPriceLower = priceToSqrtPrice(priceLower);
  const sqrtPriceUpper = priceToSqrtPrice(priceUpper);

  let liquidity;

  if (sqrtPriceCurrent < sqrtPriceLower) {
    // Below range - only token0
    if (!isToken0) {
      throw new Error('Price below range: only token0 can be deposited');
    }
    liquidity = getLiquidityForAmount0(tokenAmount, sqrtPriceLower, sqrtPriceUpper);
  } else if (sqrtPriceCurrent > sqrtPriceUpper) {
    // Above range - only token1
    if (isToken0) {
      throw new Error('Price above range: only token1 can be deposited');
    }
    liquidity = getLiquidityForAmount1(tokenAmount, sqrtPriceLower, sqrtPriceUpper);
  } else {
    // In range - calculate based on which token is provided
    if (isToken0) {
      liquidity = getLiquidityForAmount0(tokenAmount, sqrtPriceCurrent, sqrtPriceUpper);
    } else {
      liquidity = getLiquidityForAmount1(tokenAmount, sqrtPriceLower, sqrtPriceCurrent);
    }
  }

  // Calculate both amounts based on liquidity
  return getTokenAmounts(liquidity, currentPrice, priceLower, priceUpper);
}

/**
 * Get position status and composition
 * IMPORTANT: In Uniswap V3, token composition changes as price moves
 * We need to calculate current amounts based on liquidity, not use stored amounts
 *
 * @param {number} currentPrice - Current market price
 * @param {number} priceLower - Lower price bound
 * @param {number} priceUpper - Upper price bound
 * @param {number} amount0Initial - Initial amount of token0 when position was created
 * @param {number} amount1Initial - Initial amount of token1 when position was created
 * @param {number} initialPrice - Price when position was created (optional, defaults to currentPrice)
 * @returns {Object} - Position status details
 */
export function getPositionStatus(currentPrice, priceLower, priceUpper, amount0Initial, amount1Initial, initialPrice = null) {
  const inRange = currentPrice >= priceLower && currentPrice <= priceUpper;
  const priceAtCreation = initialPrice || currentPrice;

  let status;
  if (currentPrice < priceLower) {
    status = 'below_range';
  } else if (currentPrice > priceUpper) {
    status = 'above_range';
  } else {
    status = 'in_range';
  }

  // Calculate the liquidity from initial amounts at the initial price
  const sqrtPriceInitial = priceToSqrtPrice(priceAtCreation);
  const sqrtPriceLower = priceToSqrtPrice(priceLower);
  const sqrtPriceUpper = priceToSqrtPrice(priceUpper);

  const liquidity = getLiquidityForAmounts(
    amount0Initial,
    amount1Initial,
    sqrtPriceInitial,
    sqrtPriceLower,
    sqrtPriceUpper
  );

  // Get current token amounts based on CURRENT price and the calculated liquidity
  const currentAmounts = getTokenAmounts(liquidity, currentPrice, priceLower, priceUpper);

  // Use current amounts for all calculations
  const amount0 = currentAmounts.amount0;
  const amount1 = currentAmounts.amount1;

  // Calculate USD value of each token (assuming token1 is the quote currency like USDC)
  const value0 = amount0 * currentPrice;
  const value1 = amount1;
  const totalValue = value0 + value1;

  // Calculate proportions
  const proportion0 = totalValue > 0 ? (value0 / totalValue) * 100 : 0;
  const proportion1 = totalValue > 0 ? (value1 / totalValue) * 100 : 0;

  return {
    inRange,
    status,
    currentPrice,
    priceLower,
    priceUpper,
    amount0,
    amount1,
    value0,
    value1,
    totalValue,
    proportion0,
    proportion1,
    liquidity,
  };
}

/**
 * Validate price range
 * @param {number} priceLower - Lower price bound
 * @param {number} priceUpper - Upper price bound
 * @param {number} currentPrice - Current price
 * @returns {Object} - {valid, error}
 */
export function validatePriceRange(priceLower, priceUpper, currentPrice) {
  if (priceLower <= 0 || priceUpper <= 0) {
    return { valid: false, error: 'Prices must be positive' };
  }

  if (priceLower >= priceUpper) {
    return { valid: false, error: 'Lower price must be less than upper price' };
  }

  // Check if range is reasonable (within 1000x of current price)
  const minReasonable = currentPrice / 1000;
  const maxReasonable = currentPrice * 1000;

  if (priceLower < minReasonable || priceUpper > maxReasonable) {
    return {
      valid: false,
      error: 'Price range too wide. Keep within 1000x of current price'
    };
  }

  return { valid: true, error: null };
}
