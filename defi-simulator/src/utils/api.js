// Coinbase API integration for fetching real-time price data
const COINBASE_API_BASE = 'https://api.coinbase.com/v2';

// Pool configurations
export const POOLS = {
  ETH_USDC: {
    id: 'eth-usdc',
    name: 'ETH/USDC',
    token0: 'ETH',
    token1: 'USDC',
    coinbasePair: 'ETH-USD',
    baseAPR: 0.40, // 40% APR at 10% range width
    referenceRangeWidth: 10, // Reference range width in %
    color: '#627EEA',
    gradient: 'from-[#627EEA]/20 to-[#627EEA]/5',
    borderColor: 'border-[#627EEA]/30',
    textColor: 'text-[#627EEA]',
    bgColor: 'bg-[#627EEA]/10',
  },
  BTC_USDC: {
    id: 'btc-usdc',
    name: 'BTC/USDC',
    token0: 'BTC',
    token1: 'USDC',
    coinbasePair: 'BTC-USD',
    baseAPR: 0.30, // 30% APR at 10% range width
    referenceRangeWidth: 10,
    color: '#F7931A',
    gradient: 'from-[#F7931A]/20 to-[#F7931A]/5',
    borderColor: 'border-[#F7931A]/30',
    textColor: 'text-[#F7931A]',
    bgColor: 'bg-[#F7931A]/10',
  },
  SOL_USDC: {
    id: 'sol-usdc',
    name: 'SOL/USDC',
    token0: 'SOL',
    token1: 'USDC',
    coinbasePair: 'SOL-USD',
    baseAPR: 0.50, // 50% APR at 10% range width
    referenceRangeWidth: 10,
    color: '#14F195',
    gradient: 'from-[#14F195]/20 to-[#14F195]/5',
    borderColor: 'border-[#14F195]/30',
    textColor: 'text-[#14F195]',
    bgColor: 'bg-[#14F195]/10',
  },
};

/**
 * Fetch current price for a trading pair from Coinbase
 * @param {string} pair - Trading pair (e.g., 'ETH-USD')
 * @returns {Promise<number>} - Current spot price
 */
export async function fetchPrice(pair) {
  try {
    const response = await fetch(`${COINBASE_API_BASE}/prices/${pair}/spot`);
    if (!response.ok) {
      throw new Error(`Failed to fetch price for ${pair}`);
    }
    const data = await response.json();
    return parseFloat(data.data.amount);
  } catch (error) {
    console.error(`Error fetching price for ${pair}:`, error);
    // Return fallback prices if API fails
    const fallbackPrices = {
      'ETH-USD': 2000,
      'BTC-USD': 40000,
      'SOL-USD': 100,
    };
    return fallbackPrices[pair] || 0;
  }
}

/**
 * Fetch prices for all pools
 * @returns {Promise<Object>} - Object with pool IDs as keys and price data
 */
export async function fetchAllPrices() {
  const prices = {};

  for (const [key, pool] of Object.entries(POOLS)) {
    const price = await fetchPrice(pool.coinbasePair);
    prices[pool.id] = {
      ...pool,
      currentPrice: price,
      lastUpdated: new Date().toISOString(),
    };
  }

  return prices;
}

/**
 * Calculate simulated fees based on allocation and time
 * Linear fee generation model
 * @param {number} allocation - Amount allocated to pool
 * @param {number} apr - Annual percentage rate
 * @param {number} daysElapsed - Days since allocation
 * @returns {number} - Fees generated
 */
export function calculateFees(allocation, apr, daysElapsed) {
  // Linear fee calculation: (allocation * APR * days) / 365
  return (allocation * apr * daysElapsed) / 365;
}

/**
 * Calculate impermanent loss
 * Simplified IL calculation for educational purposes
 * @param {number} priceRatio - Current price / Initial price
 * @returns {number} - Impermanent loss percentage (0-1)
 */
export function calculateImpermanentLoss(priceRatio) {
  // IL formula: 2*sqrt(priceRatio)/(1+priceRatio) - 1
  const il = 2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1;
  return Math.abs(il);
}

/**
 * Calculate total value with fees and impermanent loss
 * @param {number} initialValue - Initial investment value
 * @param {number} fees - Fees earned
 * @param {number} il - Impermanent loss (0-1)
 * @returns {Object} - Final value breakdown
 */
export function calculateTotalValue(initialValue, fees, il) {
  const ilLoss = initialValue * il;
  const finalValue = initialValue + fees - ilLoss;

  return {
    initialValue,
    fees,
    impermanentLoss: ilLoss,
    finalValue,
    netReturn: finalValue - initialValue,
    netReturnPercentage: ((finalValue - initialValue) / initialValue) * 100,
  };
}

/**
 * Calculate dynamic APR based on price range width
 * APR increases as range narrows (concentrated liquidity = higher fees)
 *
 * @param {string} poolId - Pool identifier
 * @param {number} currentPrice - Current market price
 * @param {number} priceLower - Lower price bound
 * @param {number} priceUpper - Upper price bound
 * @returns {number} - Annual percentage rate (0-1)
 */
export function calculateDynamicAPR(poolId, currentPrice, priceLower, priceUpper) {
  const pool = POOLS[poolId.toUpperCase().replace('-', '_')];
  if (!pool) return 0;

  // Calculate range width as percentage of current price
  const rangeWidth = ((priceUpper - priceLower) / currentPrice) * 100;

  // Constants
  const MIN_RANGE = 0.5; // 0.5% minimum range
  const MAX_APR = 0.80; // 80% maximum APR

  // Ensure range is at least minimum
  const effectiveRange = Math.max(rangeWidth, MIN_RANGE);

  // APR scales inversely with range width
  // APR = baseAPR * (referenceRange / actualRange)
  const calculatedAPR = pool.baseAPR * (pool.referenceRangeWidth / effectiveRange);

  // Cap at maximum APR
  return Math.min(calculatedAPR, MAX_APR);
}
