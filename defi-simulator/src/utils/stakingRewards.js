/**
 * Time-Weighted Staking Rewards Calculator
 * Based on the Synthetix StakingRewards contract pattern
 *
 * Implements realistic staking mechanics:
 * - Time-weighted reward distribution
 * - Per-token reward tracking
 * - Continuous reward accrual
 * - Fair distribution among stakers
 */

/**
 * Calculate reward per token stored
 * This is the cumulative reward per staked token
 *
 * Formula: rewardPerToken = rewardPerTokenStored + ((currentTime - lastUpdateTime) * rewardRate * 1e18) / totalStaked
 *
 * @param {number} rewardPerTokenStored - Previously stored reward per token
 * @param {number} lastUpdateTime - Last time rewards were calculated (timestamp in seconds)
 * @param {number} currentTime - Current time (timestamp in seconds)
 * @param {number} rewardRate - Rewards distributed per second
 * @param {number} totalStaked - Total amount staked by all users
 * @returns {number} - Updated reward per token
 */
export function calculateRewardPerToken(
  rewardPerTokenStored,
  lastUpdateTime,
  currentTime,
  rewardRate,
  totalStaked
) {
  if (totalStaked === 0) {
    return rewardPerTokenStored;
  }

  const timeElapsed = currentTime - lastUpdateTime;
  const rewardsSinceLastUpdate = timeElapsed * rewardRate * 1e18;

  return rewardPerTokenStored + (rewardsSinceLastUpdate / totalStaked);
}

/**
 * Calculate earned rewards for a user
 *
 * Formula: earned = (stakedBalance * (rewardPerToken - userRewardPerTokenPaid)) / 1e18 + storedRewards
 *
 * @param {number} stakedBalance - User's staked amount
 * @param {number} rewardPerToken - Current reward per token
 * @param {number} userRewardPerTokenPaid - User's last recorded reward per token
 * @param {number} storedRewards - Previously calculated but unclaimed rewards
 * @returns {number} - Total earned rewards
 */
export function calculateEarnedRewards(
  stakedBalance,
  rewardPerToken,
  userRewardPerTokenPaid,
  storedRewards
) {
  const newRewards = (stakedBalance * (rewardPerToken - userRewardPerTokenPaid)) / 1e18;
  return newRewards + storedRewards;
}

/**
 * Calculate APR based on reward rate and pool size
 *
 * @param {number} rewardRate - Rewards per second
 * @param {number} totalStaked - Total amount staked
 * @param {number} rewardTokenPrice - Price of reward token in USD
 * @param {number} stakedTokenPrice - Price of staked token in USD
 * @returns {number} - Annual Percentage Rate (as decimal, e.g., 0.5 for 50%)
 */
export function calculateStakingAPR(rewardRate, totalStaked, rewardTokenPrice = 1, stakedTokenPrice = 1) {
  if (totalStaked === 0) return 0;

  // Rewards per year in USD
  const rewardsPerYear = rewardRate * 365 * 24 * 60 * 60 * rewardTokenPrice;

  // Total value staked in USD
  const totalValueStaked = totalStaked * stakedTokenPrice;

  return rewardsPerYear / totalValueStaked;
}

/**
 * Calculate staking position value including rewards
 *
 * @param {number} stakedAmount - Amount staked
 * @param {number} earnedRewards - Rewards earned
 * @param {number} stakedTokenPrice - Price of staked token
 * @param {number} rewardTokenPrice - Price of reward token
 * @returns {Object} - Position details
 */
export function calculateStakingPosition(
  stakedAmount,
  earnedRewards,
  stakedTokenPrice,
  rewardTokenPrice = null
) {
  // If reward token price not specified, assume it's the same as staked token
  const rewardPrice = rewardTokenPrice || stakedTokenPrice;

  const stakedValue = stakedAmount * stakedTokenPrice;
  const rewardsValue = earnedRewards * rewardPrice;
  const totalValue = stakedValue + rewardsValue;

  return {
    stakedAmount,
    stakedValue,
    earnedRewards,
    rewardsValue,
    totalValue,
    percentGain: stakedValue > 0 ? (rewardsValue / stakedValue) * 100 : 0
  };
}

/**
 * Calculate rewards for a time period
 * Useful for projecting future earnings
 *
 * @param {number} stakedAmount - Amount to stake
 * @param {number} apr - Annual percentage rate (as decimal)
 * @param {number} daysStaked - Number of days to calculate for
 * @returns {Object} - Projected rewards
 */
export function projectStakingRewards(stakedAmount, apr, daysStaked) {
  const rewardsEarned = (stakedAmount * apr * daysStaked) / 365;
  const totalValue = stakedAmount + rewardsEarned;

  return {
    stakedAmount,
    rewardsEarned,
    totalValue,
    percentGain: (rewardsEarned / stakedAmount) * 100,
    dailyRewards: rewardsEarned / daysStaked
  };
}

/**
 * Calculate LP staking rewards
 * Combines LP position value with staking rewards
 *
 * @param {number} lpShares - LP shares staked
 * @param {number} shareOfPool - Percentage of pool owned (0-100)
 * @param {number} poolTVL - Total value locked in pool
 * @param {number} earnedRewards - Rewards earned from staking
 * @param {number} rewardTokenPrice - Price of reward token
 * @returns {Object} - LP staking position
 */
export function calculateLPStakingPosition(
  lpShares,
  shareOfPool,
  poolTVL,
  earnedRewards,
  rewardTokenPrice
) {
  const lpValue = (poolTVL * shareOfPool) / 100;
  const rewardsValue = earnedRewards * rewardTokenPrice;
  const totalValue = lpValue + rewardsValue;

  return {
    lpShares,
    lpValue,
    shareOfPool,
    earnedRewards,
    rewardsValue,
    totalValue,
    percentGain: lpValue > 0 ? (rewardsValue / lpValue) * 100 : 0
  };
}

/**
 * Calculate boost multiplier for time-locked staking
 * Longer lock periods = higher rewards
 *
 * @param {number} lockDays - Days tokens are locked
 * @param {number} baseMultiplier - Base multiplier (default 1x)
 * @param {number} maxMultiplier - Maximum multiplier (default 3x)
 * @param {number} maxLockDays - Days to reach max multiplier (default 365)
 * @returns {number} - Multiplier to apply to rewards
 */
export function calculateLockBoost(
  lockDays,
  baseMultiplier = 1,
  maxMultiplier = 3,
  maxLockDays = 365
) {
  if (lockDays <= 0) return baseMultiplier;
  if (lockDays >= maxLockDays) return maxMultiplier;

  // Linear scaling
  const boostRange = maxMultiplier - baseMultiplier;
  const lockRatio = lockDays / maxLockDays;

  return baseMultiplier + (boostRange * lockRatio);
}

/**
 * Calculate early unstaking penalty
 *
 * @param {number} stakedAmount - Amount staked
 * @param {number} lockTimeRemaining - Days remaining in lock period
 * @param {number} penaltyRate - Penalty rate per day (as decimal)
 * @returns {Object} - Penalty details
 */
export function calculateUnstakingPenalty(
  stakedAmount,
  lockTimeRemaining,
  penaltyRate = 0.001 // 0.1% per day default
) {
  if (lockTimeRemaining <= 0) {
    return {
      penaltyAmount: 0,
      receivedAmount: stakedAmount,
      penaltyPercent: 0
    };
  }

  const penaltyPercent = Math.min(lockTimeRemaining * penaltyRate * 100, 50); // Cap at 50%
  const penaltyAmount = stakedAmount * (penaltyPercent / 100);
  const receivedAmount = stakedAmount - penaltyAmount;

  return {
    penaltyAmount,
    receivedAmount,
    penaltyPercent
  };
}

/**
 * Simulate staking over time
 * Shows how rewards accumulate
 *
 * @param {number} initialStake - Initial amount staked
 * @param {number} apr - Annual percentage rate
 * @param {number} days - Number of days to simulate
 * @param {number} compoundFrequencyDays - How often to compound (0 = no compounding)
 * @returns {Array} - Daily snapshots of position
 */
export function simulateStakingOverTime(
  initialStake,
  apr,
  days,
  compoundFrequencyDays = 0
) {
  const dailyRate = apr / 365;
  let currentStake = initialStake;
  let totalRewards = 0;
  const snapshots = [];

  for (let day = 1; day <= days; day++) {
    const dailyRewards = currentStake * dailyRate;
    totalRewards += dailyRewards;

    // Compound if frequency is set and it's time
    if (compoundFrequencyDays > 0 && day % compoundFrequencyDays === 0) {
      currentStake += totalRewards;
      totalRewards = 0;
    }

    snapshots.push({
      day,
      stakedAmount: currentStake,
      totalRewards,
      totalValue: currentStake + totalRewards,
      percentGain: ((currentStake + totalRewards - initialStake) / initialStake) * 100
    });
  }

  return snapshots;
}

/**
 * Calculate optimal stake amount for target rewards
 *
 * @param {number} targetDailyRewards - Desired rewards per day
 * @param {number} apr - Annual percentage rate
 * @returns {number} - Amount to stake
 */
export function calculateStakeForTargetRewards(targetDailyRewards, apr) {
  const dailyRate = apr / 365;
  return targetDailyRewards / dailyRate;
}

/**
 * Compare multiple staking strategies
 *
 * @param {Array} strategies - Array of {name, apr, lockDays, multiplier}
 * @param {number} amount - Amount to stake
 * @param {number} days - Days to evaluate
 * @returns {Array} - Comparison results
 */
export function compareStakingStrategies(strategies, amount, days) {
  return strategies.map(strategy => {
    const effectiveAPR = strategy.apr * (strategy.multiplier || 1);
    const projection = projectStakingRewards(amount, effectiveAPR, days);

    return {
      name: strategy.name,
      apr: strategy.apr,
      effectiveAPR,
      lockDays: strategy.lockDays || 0,
      multiplier: strategy.multiplier || 1,
      ...projection
    };
  }).sort((a, b) => b.totalValue - a.totalValue);
}
