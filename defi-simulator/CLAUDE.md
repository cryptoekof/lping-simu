# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a DeFi Liquidity Pool Simulator - an educational web application for simulating Uniswap V3 concentrated liquidity provision with real-time market data. The simulator uses simplified mathematical models based on the Uniswap V3 Core whitepaper to help users understand liquidity provision, impermanent loss, and fee generation in concentrated liquidity AMMs.

## Development Commands

### Start Development Server
```bash
npm run dev
```
Opens at http://localhost:5173 with hot reload enabled.

### Build for Production
```bash
npm run build
```
Outputs to `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## Core Architecture

### Application Flow
The app uses React Router for navigation with four main routes:
- `/` - Home page (landing)
- `/simulator` - LiquidityWizard for creating positions
- `/positions` - View and manage created positions
- `/learn` - Educational content

### State Management Strategy
This app uses **localStorage for persistence** and **local component state** (no global state management library). Each major feature manages its own state:
- `Simulator.jsx` fetches prices every 30 seconds and passes them to the wizard
- `LiquidityWizard.jsx` maintains wizard state locally and saves completed positions to localStorage
- `Positions.jsx` reads positions from localStorage and updates them with current prices

### Key Data Structures

**Position Object** (stored in localStorage as array under `'positions'` key):
```javascript
{
  id: string,              // Timestamp-based unique ID
  poolId: string,          // e.g., 'eth-usdc', 'btc-usdc', 'sol-usdc'
  initialPrice: number,    // Price when position was created
  priceRange: {
    lower: number,         // Lower price bound
    upper: number          // Upper price bound
  },
  tokenAmounts: {
    amount0: number,       // Amount of token0 (e.g., ETH)
    amount1: number        // Amount of token1 (USDC)
  },
  createdAt: string        // ISO timestamp
}
```

## Critical Mathematical Components

### Uniswap V3 Math (`src/utils/uniswapV3Math.js`)

This module implements Uniswap V3's concentrated liquidity formulas. **IMPORTANT**: Do not modify these formulas without understanding the math:

- **Price ↔ Tick Conversion**: Uses 1.0001 as the tick spacing constant
- **Liquidity Calculation**: Determines liquidity from token amounts and price range
- **Token Amount Calculation**: Calculates required tokens based on liquidity and range
- **Position Recomposition**: As price moves, the ratio of token0/token1 changes automatically

**Critical Function**: `getPositionStatus()` recalculates current token amounts based on liquidity and current price. This is essential because in Uniswap V3, as price moves within range, the position automatically trades one token for the other.

### Fee and IL Calculations (`src/utils/api.js`)

**Dynamic APR Calculation**:
- APR scales inversely with range width: narrower ranges = higher APR
- Formula: `APR = baseAPR * (referenceRangeWidth / actualRange)`
- Capped at 80% maximum APR
- Each pool has a different base APR (ETH: 40%, BTC: 30%, SOL: 50% at 10% range)

**Impermanent Loss**:
- Formula: `IL = 2 * sqrt(priceRatio) / (1 + priceRatio) - 1`
- Where `priceRatio = currentPrice / initialPrice`
- Returns absolute value (always positive loss)

### Price Data Integration

**Coinbase API** (no authentication required):
- Endpoint: `https://api.coinbase.com/v2/prices/{pair}/spot`
- Supported pairs: ETH-USD, BTC-USD, SOL-USD
- Fallback prices hardcoded in case API fails
- Price updates every 30 seconds in Simulator component

## Component Hierarchy

### Wizard Flow (Multi-Step Position Creation)
```
Simulator.jsx
  └── LiquidityWizard.jsx (manages 4-step wizard state)
      ├── Step1PoolSelection.jsx (select ETH/BTC/SOL pool)
      ├── Step2PriceRange.jsx (set price range bounds)
      ├── Step3TokenAmounts.jsx (enter token amounts)
      └── Step4Summary.jsx (review and confirm)
```

**Wizard State Pattern**: Each step validates before allowing progression. Data flows down as props, callbacks flow up to update centralized wizard state.

### Position Management
```
Positions.jsx
  └── Reads from localStorage['positions']
  └── Fetches current prices
  └── Recalculates position status using uniswapV3Math
```

## Styling System

### Tailwind CSS with Custom Classes
- Uses custom fonts: Manrope (body), JetBrains Mono (monospace), Sora (headings)
- Custom gradient classes: `uni-bg-gradient`, `text-gradient-uni`
- shadcn/ui components in `src/components/ui/`
- Utility function `cn()` in `src/lib/utils.js` for conditional class merging

### Color Scheme
Each pool has a distinctive color (defined in `POOLS` constant in `api.js`):
- ETH: #627EEA (blue)
- BTC: #F7931A (orange)
- SOL: #14F195 (green)

## Storage Layer (`src/utils/storage.js`)

**Storage Keys**:
- `defi-simulator-treasury` - User's virtual treasury amount
- `defi-simulator-allocations` - Pool allocations (legacy, may not be used in wizard flow)
- `defi-simulator-initial-prices` - Initial prices for IL calculation
- `defi-simulator-start-date` - Simulation start timestamp
- `positions` - Array of created positions (used by wizard)

**Pattern**: All storage functions have save/load pairs with default values. Use `clearAllData()` to reset simulation state.

## Key Development Patterns

### Price Updates
Prices are fetched at the page level (Simulator, Positions) and passed down as props. This prevents duplicate API calls and ensures consistency.

### Position Value Calculation
Always recalculate position composition from liquidity + current price, not from stored amounts. This is because Uniswap V3 positions automatically rebalance as price moves.

### Error Handling
- API failures fall back to hardcoded prices
- localStorage errors are caught and logged
- Math functions throw errors for invalid inputs (checked at boundaries)

## Educational Focus

This is an **educational simulator with simplified models**:
- Linear fee generation (real fees depend on actual trading volume)
- No gas costs
- Fixed APRs (real APRs fluctuate)
- Price-based IL only (doesn't model concentrated liquidity ranges perfectly)
- No rebalancing strategies

When adding features, maintain the balance between educational clarity and mathematical accuracy.

## Testing

Currently has a test file at `src/utils/uniswapV3Math.test.js` for the math functions. When modifying Uniswap V3 calculations, ensure test coverage.

## Common Development Tasks

### Adding a New Pool
1. Add entry to `POOLS` in `src/utils/api.js` with all required fields
2. Ensure Coinbase API supports the trading pair
3. Update fallback prices object

### Modifying Fee Calculations
All fee logic is centralized in `src/utils/api.js`:
- `calculateFees()` - Linear fee generation
- `calculateDynamicAPR()` - Range-based APR scaling
- `calculateTotalValue()` - Combines fees and IL

### Adjusting Price Range Validation
See `validatePriceRange()` in `uniswapV3Math.js`. Current limits:
- Must be positive
- Lower < upper
- Within 1000x of current price

## Enhanced DeFi Calculations

### New Utility Modules (Production-Ready)

The simulator now includes production-ready DeFi calculations based on real protocol templates:

#### `src/utils/ammCalculations.js`
- Constant product formula (x * y = k)
- LP share calculations using geometric mean
- Fee tiers: 0.05%, 0.3%, 1% (matching Uniswap V3)
- Slippage and price impact analysis
- TVL tracking
- Key functions: `calculateSwapOutput()`, `calculateLPShares()`, `calculatePriceImpact()`

#### `src/utils/stakingRewards.js`
- Time-weighted reward distribution (Synthetix pattern)
- Per-token reward tracking
- Lock boost multipliers
- Compound staking simulation
- Key functions: `calculateRewardPerToken()`, `projectStakingRewards()`, `calculateLockBoost()`

#### `src/utils/impermanentLoss.js`
- IL from actual reserve changes (more accurate)
- Fee compensation analysis
- Break-even calculations
- V3 concentrated liquidity IL
- Key functions: `calculateILFromReserves()`, `calculateNetReturnWithFees()`, `suggestOptimalRange()`

#### `src/utils/poolMetrics.js`
- Pool health scoring (0-100)
- Liquidity utilization metrics
- Fee performance tracking
- Risk assessments
- Position ranking
- Key functions: `calculatePoolHealth()`, `calculateRiskMetrics()`, `generatePoolAnalytics()`

### Calculator Page (`src/pages/Calculator.jsx`)

New interactive page with 4 calculators:
- Swap Calculator (with price impact)
- IL Calculator (with scenarios)
- Staking Rewards Calculator
- LP Calculator (geometric mean)

Access via `/calculator` route in the navigation.

#### `src/utils/flashLoan.js`
- Flash loan simulation engine
- Atomic transaction modeling
- Arbitrage, liquidation, and collateral swap scenarios
- Step-by-step execution tracking
- Educational content for each step
- Key functions: `simulateArbitrage()`, `simulateLiquidation()`, `simulateCollateralSwap()`

### Flash Loan Simulator (`src/pages/FlashLoan.jsx`)

**Educational Tool Features:**
- Interactive step-by-step visualization of flash loan transactions
- Three scenarios: Arbitrage, Liquidation, Collateral Swap
- Real-time balance tracking through each step
- Success/failure outcome demonstration
- Educational tooltips explaining concepts
- Adjustable parameters to explore different outcomes

**Access**: `/flash-loan` route - ⚡ icon in navigation

**Educational Value**: Shows students how uncollateralized loans work atomically, why transactions revert on failure, and real-world DeFi use cases.

## Important Constraints

- **No backend**: All state in localStorage and component state
- **Coinbase API rate limits**: Be mindful of request frequency
- **Browser storage limits**: localStorage has ~5-10MB limit
- **Simulation accuracy**: Enhanced with production formulas, but still educational
- **New calculations**: Use the enhanced utilities for more accurate DeFi math
