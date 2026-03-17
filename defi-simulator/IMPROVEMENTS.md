# DeFi Simulator Improvements

## Summary

We've significantly enhanced the DeFi Liquidity Pool Simulator with production-ready calculations based on real DeFi protocol templates. These improvements bring the simulator closer to how actual protocols like Uniswap, Aave, and Synthetix work.

## New Features & Calculations

### 1. Enhanced AMM Calculations (`src/utils/ammCalculations.js`)

**Key Improvements:**
- ✅ Proper constant product formula (x * y = k) implementation
- ✅ LP share tracking using geometric mean for initial liquidity
- ✅ Multiple fee tiers matching Uniswap V3:
  - Low (0.05%) - for stablecoin pairs
  - Medium (0.3%) - standard fee tier
  - High (1%) - for exotic/volatile pairs
- ✅ Slippage calculations and price impact analysis
- ✅ Swap output calculations with real fee deductions
- ✅ TVL (Total Value Locked) tracking
- ✅ Pool share percentage calculations

**New Functions:**
- `calculateSwapOutput()` - Accurate swap calculations with fee deductions
- `calculatePriceImpact()` - Shows how trades move the market
- `calculateLPShares()` - LP share minting/burning
- `simulateMultipleSwaps()` - See how reserves change over multiple trades
- `calculateBalancedAmounts()` - Optimal liquidity provision ratios

### 2. Time-Weighted Staking Rewards (`src/utils/stakingRewards.js`)

Based on Synthetix StakingRewards contract pattern:

**Features:**
- ✅ Time-weighted reward distribution (rewards accrue every second)
- ✅ Per-token reward tracking for fair distribution
- ✅ Continuous reward accrual calculations
- ✅ Lock boost multipliers (longer locks = higher rewards)
- ✅ Early unstaking penalties
- ✅ Compounding simulations

**New Functions:**
- `calculateRewardPerToken()` - Cumulative reward per staked token
- `calculateEarnedRewards()` - User's earned but unclaimed rewards
- `projectStakingRewards()` - Project future earnings
- `calculateLockBoost()` - Time-lock reward multipliers
- `simulateStakingOverTime()` - Day-by-day staking simulation
- `compareStakingStrategies()` - Compare different lock periods and APRs

### 3. Enhanced Impermanent Loss (`src/utils/impermanentLoss.js`)

**Improvements:**
- ✅ IL calculation from actual reserve changes (more accurate than just price)
- ✅ Fee compensation analysis (when do fees offset IL?)
- ✅ Break-even calculations (days needed to recover from IL)
- ✅ Token rebalancing visualization (see how token ratios change)
- ✅ Uniswap V3 concentrated liquidity IL calculations
- ✅ Optimal price range suggestions

**New Functions:**
- `calculateILFromReserves()` - More accurate using actual amounts
- `calculateNetReturnWithFees()` - Net returns after fees and IL
- `calculateBreakEvenDays()` - How long to break even?
- `calculateILScenarios()` - IL at different price points
- `calculateTokenRebalancing()` - See token composition changes
- `suggestOptimalRange()` - Recommended price ranges based on volatility

### 4. Comprehensive Pool Metrics (`src/utils/poolMetrics.js`)

**Analytics:**
- ✅ Pool health scoring (0-100)
- ✅ Liquidity utilization metrics
- ✅ Fee performance tracking
- ✅ Risk assessments
- ✅ Position ranking and comparison
- ✅ Historical performance metrics (Sharpe ratio, max drawdown)
- ✅ Concentration level analysis for V3 positions

**New Functions:**
- `calculatePoolHealth()` - Overall pool health score
- `calculateLiquidityUtilization()` - How efficiently is liquidity used?
- `calculateFeePerformance()` - Annualized fee APR
- `calculateRiskMetrics()` - Risk level and out-of-range probability
- `rankPositions()` - Compare and rank multiple positions
- `generatePoolAnalytics()` - Comprehensive analytics summary

### 5. Interactive Calculator Page (`src/pages/Calculator.jsx`)

Brand new page with 4 specialized calculators:

**🔄 Swap Calculator:**
- Input amount and reserves
- See output amount, price impact, and fees
- Real-time slippage warnings

**📉 Impermanent Loss Calculator:**
- Compare initial vs current prices
- View IL scenarios at different price points
- Understand IL percentages

**💰 Staking Rewards Calculator:**
- Project rewards over time
- Calculate daily rewards and APR
- Compare different staking periods

**💧 LP Calculator:**
- Calculate LP shares from token amounts
- See geometric mean formula in action
- Understand balanced liquidity provision

## Technical Details

### Mathematical Accuracy

All calculations follow production DeFi protocols:

1. **Constant Product Formula**: `x * y = k`
   - Ensures reserves maintain constant product
   - Used by Uniswap V2

2. **Geometric Mean for LP Shares**: `√(x * y)`
   - Fair initial liquidity provision
   - Prevents manipulation attacks

3. **Time-Weighted Rewards**:
   ```
   rewardPerToken = stored + ((time * rate * 1e18) / totalStaked)
   earned = (balance * (rewardPerToken - userPaid)) / 1e18
   ```
   - Used by Synthetix and similar protocols

4. **Impermanent Loss**:
   ```
   IL = 2 * √(priceRatio) / (1 + priceRatio) - 1
   ```
   - Standard formula across DeFi

### Fee Tiers

Realistic fee structure based on Uniswap V3:

- **0.05%**: Stablecoin pairs (USDC/USDT)
- **0.30%**: Standard pairs (ETH/USDC)
- **1.00%**: Exotic pairs (high volatility)

### Performance Metrics

New metrics provide deeper insights:

- **TVL**: Total value locked in pool
- **Utilization Rate**: Volume / TVL ratio
- **Health Score**: Composite metric (0-100)
- **Sharpe Ratio**: Risk-adjusted returns
- **Max Drawdown**: Worst peak-to-trough decline

## How to Use

### Navigate to Calculator Page

1. Start the dev server: `npm run dev`
2. Open http://localhost:5173
3. Click **Calculator** in the sidebar

### Try the Calculators

**Swap Calculator:**
- Enter token amounts and reserves
- Select fee tier
- See realistic swap results

**IL Calculator:**
- Enter initial and current prices
- View IL scenarios
- Understand price impact on positions

**Staking Calculator:**
- Input stake amount and APR
- Choose staking period
- See projected rewards

**LP Calculator:**
- Enter token amounts
- Calculate LP shares
- Understand geometric mean

## Integration with Existing Code

### Backward Compatibility

All existing calculations still work. New utilities are additive:

- Existing `api.js` functions unchanged
- Existing `uniswapV3Math.js` still valid
- Existing components work as before

### Where to Use New Calculations

**In Positions Page:**
```javascript
import { calculatePoolHealth, calculateRiskMetrics } from './utils/poolMetrics';

const health = calculatePoolHealth(poolData);
const risk = calculateRiskMetrics(position);
```

**In Simulator:**
```javascript
import { calculateSwapOutput, FEE_TIERS } from './utils/ammCalculations';

const swap = calculateSwapOutput(
  amountIn,
  reserve0,
  reserve1,
  FEE_TIERS.MEDIUM.rate
);
```

**For Staking Features:**
```javascript
import { projectStakingRewards } from './utils/stakingRewards';

const projection = projectStakingRewards(10000, 0.25, 365);
```

## Future Enhancements

With these foundations, you can now add:

1. **Real-time pool monitoring** using the health metrics
2. **Position rebalancing alerts** using risk calculations
3. **Strategy comparison tools** using ranking functions
4. **Advanced visualizations** with the historical metrics
5. **Automated strategy testing** using simulation functions

## Educational Value

These improvements make the simulator more educational:

- **Real formulas**: Same math as production protocols
- **Practical scenarios**: Calculate actual trade impacts
- **Risk awareness**: Understand IL and slippage
- **Strategy planning**: Compare different approaches

## Credits

Calculations based on:
- Uniswap V2/V3 whitepapers
- Synthetix StakingRewards contract
- Aave lending protocol patterns
- Industry-standard DeFi formulas

## Questions?

The CLAUDE.md file has been updated with information about these new utilities. Future Claude instances will understand how to use them.
